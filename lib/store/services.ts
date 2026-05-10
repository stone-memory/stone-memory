"use client"

import { authedFetch } from "@/lib/authed-fetch"

import { useEffect } from "react"
import { create } from "zustand"
import { services as baseServices, type Service } from "@/lib/data/services"

type Row = { slug: string; data: Service; hidden: boolean; position: number }

interface ServicesAdminState {
  items: Row[]
  hasHydrated: boolean
  loading: boolean
  hydrate: () => Promise<void>
  upsert: (s: Service) => Promise<void>
  softDelete: (slug: string) => Promise<void>
  restore: (slug: string) => Promise<void>
  remove: (slug: string) => Promise<void>
}

async function putRow(row: Row) {
  const res = await authedFetch("/api/content/services", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(row),
  })
  if (!res.ok) throw new Error("services upsert failed")
}

async function patchRow(slug: string, patch: Partial<{ data: Service; hidden: boolean; position: number }>) {
  const res = await authedFetch(`/api/content/services/${encodeURIComponent(slug)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error("services patch failed")
}

export const useServicesAdminStore = create<ServicesAdminState>()((set, get) => ({
  items: [],
  hasHydrated: false,
  loading: false,

  hydrate: async () => {
    if (get().hasHydrated || get().loading) return
    set({ loading: true })
    try {
      const res = await fetch("/api/content/services", { cache: "no-store" })
      const json = await res.json()
      if (res.ok && Array.isArray(json.items)) {
        set({ items: json.items as Row[], hasHydrated: true })
      } else {
        set({ hasHydrated: true })
      }
    } finally {
      set({ loading: false })
    }
  },

  upsert: async (service) => {
    const existing = get().items.find((r) => r.slug === service.slug)
    const position = existing?.position ?? get().items.length
    const row: Row = { slug: service.slug, data: service, hidden: existing?.hidden ?? false, position }
    const prev = get().items
    set({
      items: existing ? prev.map((r) => (r.slug === service.slug ? row : r)) : [...prev, row],
    })
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
      const res = await authedFetch(`/api/content/services/${encodeURIComponent(slug)}`, { method: "DELETE" })
      if (!res.ok) throw new Error("delete failed")
    } catch {
      set({ items: prev })
    }
  },
}))

export function useServices(): Service[] {
  const items = useServicesAdminStore((s) => s.items)
  const hasHydrated = useServicesAdminStore((s) => s.hasHydrated)
  const hydrate = useServicesAdminStore((s) => s.hydrate)
  useEffect(() => {
    hydrate()
  }, [hydrate])
  if (!hasHydrated) return baseServices
  return items.filter((r) => !r.hidden).map((r) => r.data)
}
