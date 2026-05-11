"use client"

import { useEffect, useState } from "react"
import { authedFetch } from "@/lib/authed-fetch"
import type { TeamRole } from "@/lib/crm/types"
import type { Capability } from "@/lib/permissions/capabilities"

/**
 * Client hook that resolves the current user's team role + effective
 * capabilities via /api/auth/me.
 *
 * Why an API round-trip instead of reading from team_members directly via
 * the supabase client: we want a single, server-vetted source of truth
 * that already filters on `active = true` and resolves custom_role
 * capabilities. Saves cluttering RLS-grant surface area for clients
 * that just want "what can I do?".
 */
export type CurrentRoleState = {
  role: TeamRole | null
  email: string | null
  loading: boolean
  /** False if the user is authed but has no active team_members row. */
  isTeamMember: boolean
  /** Effective capabilities — base role + custom role overlay. */
  capabilities: Capability[]
}

export function useCurrentRole(): CurrentRoleState {
  const [state, setState] = useState<CurrentRoleState>({
    role: null,
    email: null,
    loading: true,
    isTeamMember: false,
    capabilities: [],
  })

  useEffect(() => {
    let cancelled = false
    authedFetch("/api/auth/me", { cache: "no-store" })
      .then(async (r) => {
        if (cancelled) return
        if (!r.ok) {
          setState({ role: null, email: null, loading: false, isTeamMember: false, capabilities: [] })
          return
        }
        const j = (await r.json()) as {
          role: TeamRole | null
          email: string | null
          active: boolean
          capabilities: Capability[]
        }
        setState({
          role: j.role,
          email: j.email,
          loading: false,
          isTeamMember: Boolean(j.role && j.active),
          capabilities: Array.isArray(j.capabilities) ? j.capabilities : [],
        })
      })
      .catch(() => {
        if (cancelled) return
        setState({ role: null, email: null, loading: false, isTeamMember: false, capabilities: [] })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}

export function isSuperAdmin(role: TeamRole | null): boolean {
  return role === "super_admin"
}

export function isAdminOrAbove(role: TeamRole | null): boolean {
  return role === "admin" || role === "super_admin"
}

/** Check whether a capability is present in the supplied list. */
export function hasCapability(caps: Capability[], cap: Capability): boolean {
  return caps.includes(cap)
}
