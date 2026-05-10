import "server-only"
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { TeamRole } from "@/lib/crm/types"

/**
 * Server-side permission helpers. Mirror their client equivalents in
 * `lib/auth/use-current-role.ts` (UI gating). Anything truly sensitive
 * (credential changes, integration writes) MUST be gated server-side
 * here — client `disabled` is UX, not security.
 *
 * Defense in depth:
 *   1. Postgres trigger blocks auth.users sensitive updates (super_admin
 *      only). See supabase/crm-super-admin-2-policies.sql.
 *   2. RLS policies gate table access by `current_user_role()` /
 *      `is_super_admin()`.
 *   3. THIS file gates API endpoints before they call supabaseAdmin
 *      (which bypasses RLS).
 *   4. UI hides the form (cosmetic only).
 */

export type AuthedUser = {
  user_id: string
  email: string | null
  role: TeamRole | null
  active: boolean
}

/**
 * Resolve the caller from the Authorization header → team_members row.
 * Returns the resolved user, or a 401/403 NextResponse to bail out with.
 *
 * Usage:
 *   const ctx = await getAuthedUser(req)
 *   if (ctx instanceof NextResponse) return ctx
 *   // ctx.role available here
 */
export async function getAuthedUser(
  req: Request
): Promise<AuthedUser | NextResponse> {
  const header = req.headers.get("authorization") || req.headers.get("Authorization")
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : null
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { data: authData, error: authErr } = await supabaseAdmin.auth.getUser(token)
  if (authErr || !authData.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  // Role lives on team_members keyed by user_id. We look it up server-side
  // every request — cheap (indexed by user_id) and guarantees revocation
  // takes effect immediately even on long-lived sessions.
  const { data: tm } = await supabaseAdmin
    .from("team_members")
    .select("role, active, email")
    .eq("user_id", authData.user.id)
    .maybeSingle()

  return {
    user_id: authData.user.id,
    email: authData.user.email ?? tm?.email ?? null,
    role: (tm?.role as TeamRole | null) ?? null,
    active: tm?.active ?? false,
  }
}

/**
 * Convenience: require any active team member. Use for endpoints all
 * authenticated team members may hit (e.g. /api/auth/me).
 */
export async function requireTeamMember(
  req: Request
): Promise<AuthedUser | NextResponse> {
  const ctx = await getAuthedUser(req)
  if (ctx instanceof NextResponse) return ctx
  if (!ctx.role || !ctx.active) {
    return NextResponse.json(
      { error: "forbidden", reason: "no_active_team_membership" },
      { status: 403 }
    )
  }
  return ctx
}

/**
 * Require super_admin. Used for credential changes and integration
 * writes. Returns the user or a 403 NextResponse.
 */
export async function requireSuperAdmin(
  req: Request
): Promise<AuthedUser | NextResponse> {
  const ctx = await requireTeamMember(req)
  if (ctx instanceof NextResponse) return ctx
  if (ctx.role !== "super_admin") {
    return NextResponse.json(
      { error: "forbidden", reason: "super_admin_required" },
      { status: 403 }
    )
  }
  return ctx
}

/**
 * Require admin OR super_admin. Most CRM admin endpoints want this
 * (replaces the old `requireAdmin` pattern that didn't know about
 * super_admin yet).
 */
export async function requireAdminOrSuperAdmin(
  req: Request
): Promise<AuthedUser | NextResponse> {
  const ctx = await requireTeamMember(req)
  if (ctx instanceof NextResponse) return ctx
  if (ctx.role !== "admin" && ctx.role !== "super_admin") {
    return NextResponse.json(
      { error: "forbidden", reason: "admin_required" },
      { status: 403 }
    )
  }
  return ctx
}
