"use client"

import { create } from "zustand"
import { authedFetch } from "@/lib/authed-fetch"

interface FeaturedState {
  ids: string[]
  hasHydrated: boolean
  loading: boolean
  hydrate: () => Promise<void>
  setIds: (ids: string[]) => Promise<void>
  toggle: (id: string) => Promise<void>
  clear: () => Promise<void>
}

async function putIds(ids: string[]) {
  const res = await authedFetch("/api/content/featured", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  })
  if (!res.ok) throw new Error("featured put failed")
}

export const useFeaturedStore = create<FeaturedState>()((set, get) => ({
  ids: [],
  hasHydrated: false,
  loading: false,

  hydrate: async () => {
    if (get().hasHydrated || get().loading) return
    set({ loading: true })
    try {
      const res = await fetch("/api/content/featured", { cache: "no-store" })
      const data = await res.json()
      if (res.ok && Array.isArray(data.ids)) {
        set({ ids: data.ids, hasHydrated: true })
      } else {
        set({ hasHydrated: true })
      }
    } catch {
      set({ hasHydrated: true })
    } finally {
      set({ loading: false })
    }
  },

  setIds: async (ids) => {
    const prev = get().ids
    set({ ids })
    try {
      await putIds(ids)
    } catch {
      set({ ids: prev })
    }
  },

  toggle: async (id) => {
    const current = get().ids
    let next: string[]
    if (current.includes(id)) {
      next = current.filter((x) => x !== id)
    } else if (current.length < 6) {
      next = [...current, id]
    } else {
      return
    }
    set({ ids: next })
    try {
      await putIds(next)
    } catch {
      set({ ids: current })
    }
  },

  clear: async () => {
    const prev = get().ids
    set({ ids: [] })
    try {
      await putIds([])
    } catch {
      set({ ids: prev })
    }
  },
}))
