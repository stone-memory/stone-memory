"use client"

import { useEffect, useState } from "react"
import { authedFetch } from "@/lib/authed-fetch"
import type { TeamRole } from "@/lib/crm/types"

/**
 * Client hook that resolves the current user's team role via /api/auth/me.
 *
 * Why an API round-trip instead of reading from team_members directly via
 * the supabase client: we want a single, server-vetted source of truth
 * that already filters on `active = true`. Saves cluttering RLS-grant
 * surface area for clients that just want "what role am I?".
 *
 * Returned role is null until hydrated, then either the role or null
 * (no team_members row → not a team member, but might still be an
 * authenticated user — UI should treat this as "no admin access").
 */
export type CurrentRoleState = {
  role: TeamRole | null
  email: string | null
  loading: boolean
  /** False if the user is authed but has no active team_members row. */
  isTeamMember: boolean
}

export function useCurrentRole(): CurrentRoleState {
  const [state, setState] = useState<CurrentRoleState>({
    role: null,
    email: null,
    loading: true,
    isTeamMember: false,
  })

  useEffect(() => {
    let cancelled = false
    authedFetch("/api/auth/me", { cache: "no-store" })
      .then(async (r) => {
        if (cancelled) return
        if (!r.ok) {
          setState({ role: null, email: null, loading: false, isTeamMember: false })
          return
        }
        const j = (await r.json()) as { role: TeamRole | null; email: string | null; active: boolean }
        setState({
          role: j.role,
          email: j.email,
          loading: false,
          isTeamMember: Boolean(j.role && j.active),
        })
      })
      .catch(() => {
        if (cancelled) return
        setState({ role: null, email: null, loading: false, isTeamMember: false })
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
