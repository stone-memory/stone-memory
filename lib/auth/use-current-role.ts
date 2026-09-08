"use client"

import { useEffect, useState } from "react"
import type { TeamRole } from "@/lib/crm/types"
import type { Capability } from "@/lib/permissions/capabilities"
import { fetchMe, readCachedMe, type Me } from "@/lib/auth/me-cache"

/**
 * Client hook that resolves the current user's team role + effective
 * capabilities via /api/auth/me.
 *
 * Why an API round-trip instead of reading from team_members directly via
 * the supabase client: we want a single, server-vetted source of truth
 * that already filters on `active = true` and resolves custom_role
 * capabilities. Saves cluttering RLS-grant surface area for clients
 * that just want "what can I do?".
 *
 * Стартує з кешу вкладки (lib/auth/me-cache.ts), тому меню й роль
 * зʼявляються одразу, а не після відповіді сервера; свіжі дані підтягуються
 * у фоні.
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

const EMPTY: CurrentRoleState = {
  role: null,
  email: null,
  loading: true,
  isTeamMember: false,
  capabilities: [],
}

function fromMe(me: Me | null): CurrentRoleState {
  if (!me) return { ...EMPTY, loading: false }
  return {
    role: me.role,
    email: me.email,
    loading: false,
    isTeamMember: Boolean(me.role && me.active),
    capabilities: me.capabilities,
  }
}

export function useCurrentRole(): CurrentRoleState {
  const [state, setState] = useState<CurrentRoleState>(() => {
    const cached = typeof window !== "undefined" ? readCachedMe() : null
    return cached ? fromMe(cached) : EMPTY
  })

  useEffect(() => {
    let cancelled = false
    fetchMe().then((me) => {
      if (!cancelled) setState(fromMe(me))
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
