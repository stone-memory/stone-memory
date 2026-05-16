import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireTeamMember, requireSuperAdmin } from "@/lib/auth/permissions"
import { isCapability } from "@/lib/permissions/capabilities"
import type { TeamRole } from "@/lib/crm/types"

export const dynamic = "force-dynamic"

const BASE_ROLES: TeamRole[] = ["admin", "manager", "master", "sales"]

/**
 * GET /api/crm/custom-roles
 * Returns every role (system + user-defined) ordered for stable UI.
 * Any active team member can read — needed to render role labels in
 * the team table and the new-member modal.
 */
export async function GET(req: Request) {
  const ctx = await requireTeamMember(req)
  if (ctx instanceof NextResponse) return ctx

  const { data, error } = await supabaseAdmin
    .from("custom_roles")
    .select("*")
    .order("is_system", { ascending: false }) // system rows first
    .order("base_role", { ascending: true })
    .order("created_at", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ roles: data ?? [] })
}

type CreatePayload = {
  name?: string
  label?: string
  description?: string | null
  base_role?: TeamRole
  capabilities?: string[]
}

/**
 * POST /api/crm/custom-roles
 * super_admin only. Creates a new user-defined role. The capabilities
 * array is filtered against the canonical CAPABILITIES list so a
 * malicious client can't inject arbitrary strings that look like
 * permissions.
 *
 * super_admin is intentionally NOT a valid base_role here — that role
 * is single-owner and provisioned only via SQL. Choosing it from the
 * UI would create a backdoor "everyone gets god mode" exploit.
 */
export async function POST(req: Request) {
  const ctx = await requireSuperAdmin(req)
  if (ctx instanceof NextResponse) return ctx

  const body = (await req.json().catch(() => null)) as CreatePayload | null
  if (!body) return NextResponse.json({ error: "invalid_json" }, { status: 400 })

  if (!body.name || !body.label || !body.base_role) {
    return NextResponse.json(
      { error: "missing_fields", required: ["name", "label", "base_role"] },
      { status: 400 }
    )
  }
  if (!BASE_ROLES.includes(body.base_role)) {
    return NextResponse.json(
      { error: "invalid_base_role", allowed: BASE_ROLES },
      { status: 422 }
    )
  }

  // Whitelist capabilities: drop anything not in our canonical taxonomy.
  // Cheaper than 400-ing — saves a round-trip if the client sent an
  // outdated capability name during a deploy.
  const safeCaps = Array.from(
    new Set((body.capabilities || []).filter(isCapability))
  )

  // Normalize the slug. Forbid `system_*` prefix because that's our
  // reserved namespace for is_system rows.
  const slug = body.name.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_")
  if (slug.startsWith("system_")) {
    return NextResponse.json(
      { error: "reserved_name", reason: "`system_*` is reserved for built-in roles" },
      { status: 422 }
    )
  }

  const { data, error } = await supabaseAdmin
    .from("custom_roles")
    .insert({
      name: slug,
      label: body.label.trim(),
      description: body.description?.toString().trim() || null,
      base_role: body.base_role,
      capabilities: safeCaps,
      is_system: false,
      created_by: ctx.user_id,
    })
    .select()
    .single()

  if (error) {
    // 23505 unique violation → friendlier message than raw Postgres
    if (error.code === "23505") {
      return NextResponse.json({ error: "name_already_exists" }, { status: 409 })
    }
    return NextResponse.json({ error: error.message, code: error.code }, { status: 500 })
  }
  return NextResponse.json({ role: data })
}

