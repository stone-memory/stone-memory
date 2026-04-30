"use client"

import { authedFetch } from "@/lib/authed-fetch"

import { useEffect } from "react"
import { create } from "zustand"
import {
  projects as baseProjects,
  categoryLabels as baseCategoryLabels,
  type Project,
  type ProjectCategory,
} from "@/lib/data/projects"

type Row = { slug: string; data: Project; hidden: boolean; position: number }

interface ProjectsAdminState {
  items: Row[]
  hiddenCategories: ProjectCategory[]
  hasHydrated: boolean
  loading: boolean
  hydrate: () => Promise<void>
  upsert: (p: Project) => Promise<void>
  softDelete: (slug: string) => Promise<void>
  restore: (slug: string) => Promise<void>
  remove: (slug: string) => Promise<void>
  toggleCategory: (c: ProjectCategory) => Promise<void>
}

async function putRow(row: Row) {
  const res = await authedFetch("/api/content/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(row),
  })
  if (!res.ok) throw new Error("projects upsert failed")
}

async function patchRow(slug: string, patch: Partial<{ data: Project; hidden: boolean; position: number }>) {
  const res = await authedFetch(`/api/content/projects/${encodeURIComponent(slug)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error("projects patch failed")
}

async function putHiddenCategories(categories: ProjectCategory[]) {
  const res = await authedFetch("/api/content/project-hidden-categories", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ categories }),
  })
  if (!res.ok) throw new Error("project-hidden-categories failed")
}

export const useProjectsAdminStore = create<ProjectsAdminState>()((set, get) => ({
  items: [],
  hiddenCategories: [],
  hasHydrated: false,
  loading: false,

  hydrate: async () => {
    if (get().hasHydrated || get().loading) return
    set({ loading: true })
    try {
      const [rowsRes, catsRes] = await Promise.all([
        fetch("/api/content/projects", { cache: "no-store" }),
        fetch("/api/content/project-hidden-categories", { cache: "no-store" }),
      ])
      const rowsJson = rowsRes.ok ? await rowsRes.json() : { items: [] }
      const catsJson = catsRes.ok ? await catsRes.json() : { categories: [] }
      set({
        items: Array.isArray(rowsJson.items) ? (rowsJson.items as Row[]) : [],
        hiddenCategories: Array.isArray(catsJson.categories) ? (catsJson.categories as ProjectCategory[]) : [],
        hasHydrated: true,
      })
    } catch {
      set({ hasHydrated: true })
    } finally {
      set({ loading: false })
    }
  },

  upsert: async (p) => {
    const existing = get().items.find((r) => r.slug === p.slug)
    const position = existing?.position ?? get().items.length
    const row: Row = { slug: p.slug, data: p, hidden: existing?.hidden ?? false, position }
    const prev = get().items
    set({ items: existing ? prev.map((r) => (r.slug === p.slug ? row : r)) : [...prev, row] })
    try {
      await putRow(row)
    } catch {
      set({ items: prev })
    }
  },

  softDelete: async (slug) => {
    const prev = get().items
    set({ items: prev.map((r) => (r.slug === slug ? { ...r, hidden: true } : r)) })
    try {
      await patchRow(slug, { hidden: true })
    } catch {
      set({ items: prev })
    }
  },

  restore: async (slug) => {
    const prev = get().items
    set({ items: prev.map((r) => (r.slug === slug ? { ...r, hidden: false } : r)) })
    try {
      await patchRow(slug, { hidden: false })
    } catch {
      set({ items: prev })
    }
  },

  remove: async (slug) => {
    const prev = get().items
    set({ items: prev.filter((r) => r.slug !== slug) })
    try {
      const res = await authedFetch(`/api/content/projects/${encodeURIComponent(slug)}`, { method: "DELETE" })
      if (!res.ok) throw new Error("delete failed")
    } catch {
      set({ items: prev })
    }
  },

  toggleCategory: async (c) => {
    const prev = get().hiddenCategories
    const next = prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    set({ hiddenCategories: next })
    try {
      await putHiddenCategories(next)
    } catch {
      set({ hiddenCategories: prev })
    }
  },
}))

export function useProjects(): Project[] {
  const items = useProjectsAdminStore((s) => s.items)
  const hasHydrated = useProjectsAdminStore((s) => s.hasHydrated)
  const hydrate = useProjectsAdminStore((s) => s.hydrate)
  useEffect(() => {
    hydrate()
  }, [hydrate])
  if (!hasHydrated) return baseProjects
  return items.filter((r) => !r.hidden).map((r) => r.data)
}

export function useVisibleCategories(): ProjectCategory[] {
  const hidden = useProjectsAdminStore((s) => s.hiddenCategories)
  const hasHydrated = useProjectsAdminStore((s) => s.hasHydrated)
  const hydrate = useProjectsAdminStore((s) => s.hydrate)
  useEffect(() => {
    hydrate()
  }, [hydrate])
  const all = Object.keys(baseCategoryLabels) as ProjectCategory[]
  if (!hasHydrated) return all
  return all.filter((c) => !hidden.includes(c))
}
