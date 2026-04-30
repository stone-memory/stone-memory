"use client"

import { authedFetch } from "@/lib/authed-fetch"

import { useEffect } from "react"
import { create } from "zustand"
import type { Locale } from "@/lib/types"

export type FaqItem = {
  id: string
  q: Record<Locale, string>
  a: Record<Locale, string>
  order: number
  hidden?: boolean
}

type Row = { id: string; data: FaqItem; order: number; hidden: boolean }

interface FaqState {
  items: Row[]
  hasHydrated: boolean
  loading: boolean
  hydrate: () => Promise<void>
  add: (item: Omit<FaqItem, "id" | "order">) => Promise<void>
  update: (id: string, patch: Partial<FaqItem>) => Promise<void>
  remove: (id: string) => Promise<void>
  setOrder: (id: string, order: number) => Promise<void>
}

async function postRow(row: Row) {
  const res = await authedFetch("/api/content/faq-items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(row),
  })
  if (!res.ok) throw new Error("faq upsert failed")
}

async function patchRow(id: string, patch: Partial<{ data: FaqItem; order: number; hidden: boolean }>) {
  const res = await authedFetch(`/api/content/faq-items/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error("faq patch failed")
}

export const useFaqStore = create<FaqState>()((set, get) => ({
  items: [],
  hasHydrated: false,
  loading: false,

  hydrate: async () => {
    if (get().hasHydrated || get().loading) return
    set({ loading: true })
    try {
      const res = await fetch("/api/content/faq-items", { cache: "no-store" })
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

  add: async (partial) => {
    const id = `faq-${Date.now().toString(36)}`
    const order = get().items.length
    const full: FaqItem = { ...partial, id, order }
    const row: Row = { id, data: full, order, hidden: Boolean(partial.hidden) }
    const prev = get().items
    set({ items: [...prev, row] })
    try {
      await postRow(row)
    } catch {
      set({ items: prev })
    }
  },

  update: async (id, patch) => {
    const prev = get().items
    const current = prev.find((r) => r.id === id)
    if (!current) return
    const merged: FaqItem = { ...current.data, ...patch }
    const row: Row = {
      id,
      data: merged,
      order: merged.order,
      hidden: Boolean(merged.hidden),
    }
    set({ items: prev.map((r) => (r.id === id ? row : r)) })
    try {
      await patchRow(id, { data: merged, order: row.order, hidden: row.hidden })
    } catch {
      set({ items: prev })
    }
  },

  remove: async (id) => {
    const prev = get().items
    set({ items: prev.filter((r) => r.id !== id) })
    try {
      const res = await authedFetch(`/api/content/faq-items/${encodeURIComponent(id)}`, { method: "DELETE" })
      if (!res.ok) throw new Error("delete failed")
    } catch {
      set({ items: prev })
    }
  },

  setOrder: async (id, order) => {
    const prev = get().items
    const current = prev.find((r) => r.id === id)
    if (!current) return
    const merged: FaqItem = { ...current.data, order }
    set({ items: prev.map((r) => (r.id === id ? { ...r, data: merged, order } : r)) })
    try {
      await patchRow(id, { data: merged, order })
    } catch {
      set({ items: prev })
    }
  },
}))

export function useFaqItems(): FaqItem[] {
  const items = useFaqStore((s) => s.items)
  const hasHydrated = useFaqStore((s) => s.hasHydrated)
  const hydrate = useFaqStore((s) => s.hydrate)
  useEffect(() => {
    hydrate()
  }, [hydrate])
  if (!hasHydrated) return []
  return items
    .filter((r) => !r.hidden)
    .map((r) => r.data)
    .sort((a, b) => a.order - b.order)
}
