"use client"

import { useEffect } from "react"
import { create } from "zustand"
import { authedFetch } from "@/lib/authed-fetch"
import type { CustomRole, TeamRole } from "@/lib/crm/types"

/**
 * Custom roles store. Centralized so the team page, role editor, and
 * new-member modal all read from the same in-memory list and reflect
 * mutations immediately.
 *
 * Hydration is on-demand: every consumer calls `useCustomRolesHydrate()`
 * which hits /api/crm/custom-roles once per session.
 */

interface CustomRolesState {
  roles: CustomRole[]
  hasHydrated: boolean
  loading: boolean
  hydrate: () => Promise<void>
  refresh: () => Promise<void>
  create: (payload: {
    name: string
    label: string
    description: string | null
    base_role: TeamRole
    capabilities: string[]
  }) => Promise<{ ok: boolean; error?: string; role?: CustomRole }>
  update: (
    id: string,
    patch: Partial<{
      label: string
      description: string | null
      base_role: TeamRole
      capabilities: string[]
    }>
  ) => Promise<{ ok: boolean; error?: string; role?: CustomRole }>
  remove: (id: string) => Promise<{ ok: boolean; error?: string }>
}

export const useCustomRolesStore = create<CustomRolesState>()((set, get) => ({
  roles: [],
  hasHydrated: false,
  loading: false,

  hydrate: async () => {
    if (get().hasHydrated || get().loading) return
    await get().refresh()
  },

  refresh: async () => {
    set({ loading: true })
    try {
      const r = await authedFetch("/api/crm/custom-roles", { cache: "no-store" })
      if (!r.ok) {
        set({ hasHydrated: true })
        return
      }
      const j = (await r.json()) as { roles?: CustomRole[] }
      set({ roles: j.roles || [], hasHydrated: true })
    } finally {
      set({ loading: false })
    }
  },

  create: async (payload) => {
    const r = await authedFetch("/api/crm/custom-roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const j = await r.json()
    if (!r.ok) return { ok: false, error: j.error || "помилка" }
    set({ roles: [...get().roles, j.role as CustomRole] })
    return { ok: true, role: j.role as CustomRole }
  },

  update: async (id, patch) => {
    const r = await authedFetch(`/api/crm/custom-roles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
    const j = await r.json()
    if (!r.ok) return { ok: false, error: j.error || "помилка" }
    set({
      roles: get().roles.map((r) => (r.id === id ? (j.role as CustomRole) : r)),
    })
    return { ok: true, role: j.role as CustomRole }
  },

  remove: async (id) => {
    const r = await authedFetch(`/api/crm/custom-roles/${id}`, { method: "DELETE" })
    if (!r.ok) {
      const j = await r.json().catch(() => ({}))
      return { ok: false, error: j.error || "помилка" }
    }
    set({ roles: get().roles.filter((r) => r.id !== id) })
    return { ok: true }
  },
}))

/** Convenience hook: hydrate on mount, return the list. */
export function useCustomRoles(): CustomRole[] {
  const roles = useCustomRolesStore((s) => s.roles)
  const hydrate = useCustomRolesStore((s) => s.hydrate)
  useEffect(() => {
    hydrate()
  }, [hydrate])
  return roles
}
