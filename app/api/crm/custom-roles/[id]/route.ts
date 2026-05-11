import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireSuperAdmin, requireTeamMember } from "@/lib/auth/permissions"
import { isCapability } from "@/lib/permissions/capabilities"
import type { TeamRole } from "@/lib/crm/types"

export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ id: string }> }

const BASE_ROLES: TeamRole[] = ["admin", "manager", "master", "sales"]

/**
 * GET /api/crm/custom-roles/[id]
 * Read a single role. Any active team member may read — needed for
 * looking up a member's role label.
 */
export async function GET(req: Request, ctx: Ctx) {
  const user = await requireTeamMember(req)
  if (user instanceof NextResponse) return user
  const { id } = await ctx.params

  const { data, error } = await supabaseAdmin
    .from("custom_roles")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 })
  return NextResponse.json({ role: data })
}

type PatchPayload = Partial<{
  label: string
  description: string | null
  base_role: TeamRole
  capabilities: string[]
}>

/**
 * PATCH /api/crm/custom-roles/[id]
 * super_admin only. Updates label/description/base_role/capabilities.
 * Forbidden on system rows for base_role, label, name — only capability
 * tweaks are allowed for is_system rows so the owner can fine-tune the
 * built-in roles' overlay without breaking enum semantics.
 */
export async function PATCH(req: Request, ctx: Ctx) {
  const user = await requireSuperAdmin(req)
  if (user instanceof NextResponse) return user
  const { id } = await ctx.params

  const body = (await req.json().catch(() => null)) as PatchPayload | null
  if (!body) return NextResponse.json({ error: "invalid_json" }, { status: 400 })

  const { data: existing, error: readErr } = await supabaseAdmin
    .from("custom_roles")
    .select("is_system")
    .eq("id", id)
    .maybeSingle()
  if (readErr) return NextResponse.json({ error: readErr.message }, { status: 500 })
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 })

  // System rows: lock label/base_role to preserve user expectations.
  // Capability overlay is still editable so owners can grant their
  // managers (say) read access to finances.view_company without making
  // a custom role for that.
  const patch: PatchPayload = {}
  if (typeof body.label === "string" && !existing.is_system) {
    patch.label = body.label.trim()
  }
  if ("description" in body) {
    patch.description = body.description?.toString().trim() || null
  }
  if (body.base_role && !existing.is_system) {
    if (!BASE_ROLES.includes(body.base_role)) {
      return NextResponse.json(
        { error: "invalid_base_role", allowed: BASE_ROLES },
        { status: 422 }
      )
    }
    patch.base_role = body.base_role
  }
  if (Array.isArray(body.capabilities)) {
    patch.capabilities = Array.from(
      new Set(body.capabilities.filter(isCapability))
    )
  }

  // updated_at is a default-now() column at insert time only; bump it
  // explicitly on update via a sentinel so audit logs stay accurate.
  const { data, error } = await supabaseAdmin
    .from("custom_roles")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ role: data })
}

/**
 * DELETE /api/crm/custom-roles/[id]
 * super_admin only. System rows can't be deleted.
 * On delete, every team_member.custom_role_id pointing at this row gets
 * NULLed automatically by the foreign key (ON DELETE SET NULL). Those
 * members fall back to their base enum role.
 */
export async function DELETE(req: Request, ctx: Ctx) {
  const user = await requireSuperAdmin(req)
  if (user instanceof NextResponse) return user
  const { id } = await ctx.params

  const { data: existing, error: readErr } = await supabaseAdmin
    .from("custom_roles")
    .select("is_system")
    .eq("id", id)
    .maybeSingle()
  if (readErr) return NextResponse.json({ error: readErr.message }, { status: 500 })
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 })
  if (existing.is_system) {
    return NextResponse.json(
      { error: "cannot_delete_system_role" },
      { status: 422 }
    )
  }

  const { error } = await supabaseAdmin
    .from("custom_roles")
    .delete()
    .eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
