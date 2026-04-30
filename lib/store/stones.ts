"use client"

import { authedFetch } from "@/lib/authed-fetch"

import { useEffect } from "react"
import { create } from "zustand"
import { stones as baseStones } from "@/lib/data/stones"
import type { StoneItem } from "@/lib/types"

type Row = { id: string; data: StoneItem; hidden: boolean; position: number }

interface StonesAdminState {
  items: Row[]
  hasHydrated: boolean
  loading: boolean
  hydrate: () => Promise<void>
  upsert: (s: StoneItem) => Promise<void>
  softDelete: (id: string) => Promise<void>
  restore: (id: string) => Promise<void>
  remove: (id: string) => Promise<void>
}

async function putRow(row: { id: string; data: StoneItem; hidden: boolean; position: number }) {
  const res = await authedFetch("/api/content/stones", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(row),
  })
  if (!res.ok) throw new Error("stones upsert failed")
  return res
}

async function patchRow(id: string, patch: Partial<{ data: StoneItem; hidden: boolean; position: number }>) {
  const res = await authedFetch(`/api/content/stones/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error("stones patch failed")
  return res
}

export const useStonesAdminStore = create<StonesAdminState>()((set, get) => ({
  items: [],
  hasHydrated: false,
  loading: false,

  hydrate: async () => {
    if (get().hasHydrated || get().loading) return
    set({ loading: true })
    try {
      const res = await fetch("/api/content/stones", { cache: "no-store" })
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

  upsert: async (stone) => {
    const existing = get().items.find((r) => r.id === stone.id)
    const position = existing?.position ?? get().items.length
    const row: Row = { id: stone.id, data: stone, hidden: existing?.hidden ?? false, position }
    const prev = get().items
    set({
      items: existing
        ? prev.map((r) => (r.id === stone.id ? row : r))
        : [...prev, row],
    })
    try {
      await putRow(row)
    } catch {
      set({ items: prev })
    }
  },

  softDelete: async (id) => {
    const prev = get().items
    set({ items: prev.map((r) => (r.id === id ? { ...r, hidden: true } : r)) })
    try {
      await patchRow(id, { hidden: true })
    } catch {
      set({ items: prev })
    }
  },

  restore: async (id) => {
    const prev = get().items
    set({ items: prev.map((r) => (r.id === id ? { ...r, hidden: false } : r)) })
    try {
      await patchRow(id, { hidden: false })
    } catch {
      set({ items: prev })
    }
  },

  remove: async (id) => {
    const prev = get().items
    set({ items: prev.filter((r) => r.id !== id) })
    try {
      const res = await authedFetch(`/api/content/stones/${encodeURIComponent(id)}`, { method: "DELETE" })
      if (!res.ok) throw new Error("delete failed")
    } catch {
      set({ items: prev })
    }
  },
}))

// Returns the visible stones list. Auto-hydrates on first render.
// Falls back to base mock while hydrating, so SSR/first-paint isn't empty.
export function useStones(): StoneItem[] {
  const items = useStonesAdminStore((s) => s.items)
  const hasHydrated = useStonesAdminStore((s) => s.hasHydrated)
  const hydrate = useStonesAdminStore((s) => s.hydrate)
  useEffect(() => {
    hydrate()
  }, [hydrate])
  if (!hasHydrated) return baseStones
  return items.filter((r) => !r.hidden).map((r) => r.data)
}
