import "server-only"
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { TeamRole } from "@/lib/crm/types"
import { resolveCapabilities, type Capability } from "@/lib/permissions/capabilities"

/**
 * Owner email allow-list. The owner of the business is always treated
 * as super_admin regardless of what team_members says — protects
 * against the bootstrap chicken-and-egg case (no super_admin migration
 * applied yet → owner can't reach /admin/integrations to do anything).
 *
 * Configurable via env (OWNER_EMAILS=a@b.com,c@d.com), with a single
 * hardcoded default that matches the SQL migration's bootstrap row.
 *
 * SECURITY note: Supabase Auth controls who can sign in with a given
 * email. Adding an email here doesn't grant access to anyone who isn't
 * already authenticated as that user.
 */
const OWNER_EMAILS: string[] = (process.env.OWNER_EMAILS || "sttonememory@gmail.com")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)

function isOwnerEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return OWNER_EMAILS.includes(email.toLowerCase())
}

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

  const email = authData.user.email ?? tm?.email ?? null
  const rawRole = (tm?.role as TeamRole | null) ?? null
  const rawActive = tm?.active ?? false

  // Owner-email override: if the caller's email is in OWNER_EMAILS,
  // treat them as super_admin even when:
  //   - team_members row doesn't exist yet, or
  //   - the row has role='admin' (super_admin migration not applied), or
  //   - active is somehow false on the owner row (data corruption).
  // This is the bootstrap safety net so the business owner can never
  // get locked out of their own CRM by partially-applied migrations.
  if (isOwnerEmail(email)) {
    return {
      user_id: authData.user.id,
      email,
      role: "super_admin",
      active: true,
    }
  }

  return {
    user_id: authData.user.id,
    email,
    role: rawRole,
    active: rawActive,
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

/**
 * Resolve the caller's effective capability set — base role caps
 * merged with any custom_role overlay. Returns [] for anon / inactive
 * users. Mirrors the SQL `current_user_capabilities()` function so
 * server-side JS gates and SQL gates produce identical answers.
 */
export async function getCurrentCapabilities(
  req: Request
): Promise<{ user: AuthedUser; capabilities: Capability[] } | NextResponse> {
  const ctx = await getAuthedUser(req)
  if (ctx instanceof NextResponse) return ctx
  if (!ctx.role || !ctx.active) {
    return { user: ctx, capabilities: [] }
  }

  let extra: string[] = []
  // Pull custom_role.capabilities if the member has one assigned. We
  // do this with the admin client because RLS on team_members already
  // permits the caller to read their own row, but for code simplicity
  // we use admin client which bypasses RLS.
  const { data: tm } = await supabaseAdmin
    .from("team_members")
    .select("custom_role_id")
    .eq("user_id", ctx.user_id)
    .maybeSingle()
  if (tm?.custom_role_id) {
    const { data: cr } = await supabaseAdmin
      .from("custom_roles")
      .select("capabilities")
      .eq("id", tm.custom_role_id)
      .maybeSingle()
    if (cr?.capabilities && Array.isArray(cr.capabilities)) {
      extra = cr.capabilities as string[]
    }
  }

  return {
    user: ctx,
    capabilities: resolveCapabilities(ctx.role, extra),
  }
}

/**
 * Require a specific capability. Returns the user + capabilities or a
 * 403 NextResponse if the cap isn't present.
 *
 *   const ctx = await requireCapability(req, "finances.view_company")
 *   if (ctx instanceof NextResponse) return ctx
 */
export async function requireCapability(
  req: Request,
  cap: Capability
): Promise<{ user: AuthedUser; capabilities: Capability[] } | NextResponse> {
  const result = await getCurrentCapabilities(req)
  if (result instanceof NextResponse) return result
  if (!result.capabilities.includes(cap)) {
    return NextResponse.json(
      { error: "forbidden", reason: "missing_capability", capability: cap },
      { status: 403 }
    )
  }
  return result
}

/**
 * Capability guard with the same return contract as the legacy
 * `requireAdmin` (NextResponse to bail out, or null to proceed). Lets
 * existing routes swap `requireAdmin` → `guardCapability` mechanically:
 *
 *   const unauth = await guardCapability(req, "deals.edit")
 *   if (unauth) return unauth
 *
 * Accepts a single capability or an array — array means "any of these"
 * (e.g. a list endpoint that both content.catalog and content.editorial
 * roles may read). Use requireCapability() instead when the handler
 * needs the resolved user / capability set.
 */
export async function guardCapability(
  req: Request,
  cap: Capability | Capability[]
): Promise<NextResponse | null> {
  const result = await getCurrentCapabilities(req)
  if (result instanceof NextResponse) return result
  const needed = Array.isArray(cap) ? cap : [cap]
  const ok = needed.some((c) => result.capabilities.includes(c))
  if (!ok) {
    return NextResponse.json(
      { error: "forbidden", reason: "missing_capability", capability: needed.join("|") },
      { status: 403 }
    )
  }
  return null
}

/**
 * Guard form of requireTeamMember: any active team member passes.
 * Same NextResponse|null contract for mechanical route swaps. Use for
 * endpoints every authenticated member legitimately needs (own
 * notification counts, own profile, shared read-only lookups).
 */
export async function guardTeamMember(req: Request): Promise<NextResponse | null> {
  const ctx = await requireTeamMember(req)
  if (ctx instanceof NextResponse) return ctx
  return null
}

/**
 * Guard for the generic /api/content/[resource] mutations. The required
 * capability depends on which collection is being written, so it's
 * resolved per-request from content-schema. `null` means the resource
 * isn't role-gated (e.g. personal tasks) → any active member may write.
 */
export async function guardContentMutation(
  req: Request,
  writeCapability: Capability | null
): Promise<NextResponse | null> {
  if (writeCapability === null) return guardTeamMember(req)
  return guardCapability(req, writeCapability)
}
