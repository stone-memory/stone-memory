"use client"

import { authedFetch } from "@/lib/authed-fetch"

import { useEffect } from "react"
import { create } from "zustand"

export type ReviewPlacement = "home" | "all" | "hidden"

export type Review = {
  id: string
  name: string
  text: string
  rating: number
  date: string
  photo?: string | null
  source: "google" | "manual"
  placement: ReviewPlacement
  order?: number
}

type Row = {
  id: string
  data: Review
  placement: ReviewPlacement
  order: number
}

interface ReviewsState {
  items: Row[]
  hasHydrated: boolean
  loading: boolean
  hydrate: () => Promise<void>
  add: (r: Omit<Review, "id">) => Promise<void>
  update: (id: string, patch: Partial<Review>) => Promise<void>
  remove: (id: string) => Promise<void>
  setPlacement: (id: string, p: ReviewPlacement) => Promise<void>
}

async function postRow(row: Row) {
  const res = await authedFetch("/api/content/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(row),
  })
  if (!res.ok) throw new Error("review upsert failed")
}

async function patchRow(id: string, patch: Partial<{ data: Review; placement: ReviewPlacement; order: number }>) {
  const res = await authedFetch(`/api/content/reviews/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error("review patch failed")
}

function rowOf(r: Review): Row {
  return { id: r.id, data: r, placement: r.placement, order: r.order ?? 99 }
}

export const useReviewsStore = create<ReviewsState>()((set, get) => ({
  items: [],
  hasHydrated: false,
  loading: false,

  hydrate: async () => {
    if (get().hasHydrated || get().loading) return
    set({ loading: true })
    try {
      const res = await fetch("/api/content/reviews", { cache: "no-store" })
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
    const id = `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    const review: Review = { ...partial, id }
    const row = rowOf(review)
    const prev = get().items
    set({ items: [row, ...prev] })
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
    const merged: Review = { ...current.data, ...patch }
    const row = rowOf(merged)
    set({ items: prev.map((r) => (r.id === id ? row : r)) })
    try {
      await patchRow(id, { data: merged, placement: row.placement, order: row.order })
    } catch {
      set({ items: prev })
    }
  },

  remove: async (id) => {
    const prev = get().items
    set({ items: prev.filter((r) => r.id !== id) })
    try {
      const res = await authedFetch(`/api/content/reviews/${encodeURIComponent(id)}`, { method: "DELETE" })
      if (!res.ok) throw new Error("delete failed")
    } catch {
      set({ items: prev })
    }
  },

  setPlacement: async (id, p) => {
    const prev = get().items
    const current = prev.find((r) => r.id === id)
    if (!current) return
    const merged: Review = { ...current.data, placement: p }
    set({ items: prev.map((r) => (r.id === id ? { ...r, data: merged, placement: p } : r)) })
    try {
      await patchRow(id, { data: merged, placement: p })
    } catch {
      set({ items: prev })
    }
  },
}))

export function useReviewsForPlacement(placement: "home" | "all"): Review[] {
  const items = useReviewsStore((s) => s.items)
  const hasHydrated = useReviewsStore((s) => s.hasHydrated)
  const hydrate = useReviewsStore((s) => s.hydrate)
  useEffect(() => {
    hydrate()
  }, [hydrate])
  if (!hasHydrated) return []
  const reviews = items.map((r) => r.data)
  let list =
    placement === "home"
      ? reviews.filter((r) => r.placement === "home")
      : reviews.filter((r) => r.placement !== "hidden")
  list = [...list].sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
  if (placement === "home") list = list.slice(0, 6)
  return list
}
