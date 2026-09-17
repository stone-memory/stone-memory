"use client"

import { create } from "zustand"
import { fail, httpError, type SaveResult } from "@/lib/store/result"
import { authedFetch } from "@/lib/authed-fetch"

interface FeaturedState {
  ids: string[]
  hasHydrated: boolean
  loading: boolean
  error: string | null
  hydrate: () => Promise<void>
  setIds: (ids: string[]) => Promise<SaveResult>
  toggle: (id: string) => Promise<SaveResult>
  clear: () => Promise<SaveResult>
}

async function putIds(ids: string[]) {
  const res = await authedFetch("/api/content/featured", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  })
  if (!res.ok) throw await httpError(res, "featured put failed")
}

export const useFeaturedStore = create<FeaturedState>()((set, get) => ({
  ids: [],
  hasHydrated: false,
  loading: false,
  error: null,

  hydrate: async () => {
    if (get().hasHydrated || get().loading) return
    set({ loading: true })
    try {
      const res = await fetch("/api/content/featured", { cache: "no-store" })
      const data = await res.json()
      if (res.ok && Array.isArray(data.ids)) {
        set({ ids: data.ids, hasHydrated: true })
      } else {
        set({ hasHydrated: true, error: res.ok ? "Неочікувана відповідь" : `HTTP ${res.status}` })
      }
    } catch (e) {
      set({ hasHydrated: true, error: e instanceof Error ? e.message : "Не вдалось завантажити" })
    } finally {
      set({ loading: false })
    }
  },

  setIds: async (ids) => {
    const prev = get().ids
    set({ ids })
    try {
      await putIds(ids)
    } catch (e) {
      set({ ids: prev })
      return fail(e)
    }
    return { ok: true }
  },

  toggle: async (id) => {
    const current = get().ids
    let next: string[]
    if (current.includes(id)) {
      next = current.filter((x) => x !== id)
    } else if (current.length < 6) {
      next = [...current, id]
    } else {
      return fail(new Error("Максимум 6 позицій у «Популярному»"))
    }
    set({ ids: next })
    try {
      await putIds(next)
    } catch (e) {
      set({ ids: current })
      return fail(e)
    }
    return { ok: true }
  },

  clear: async () => {
    const prev = get().ids
    set({ ids: [] })
    try {
      await putIds([])
    } catch (e) {
      set({ ids: prev })
      return fail(e)
    }
    return { ok: true }
  },
}))
