import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireTeamMember } from "@/lib/auth/permissions"

export const dynamic = "force-dynamic"

/**
 * Endpoints for the CURRENT user to read or update their own
 * team_members row. Restricted-by-design:
 *
 *   - GET → returns the caller's own row.
 *   - PATCH → accepts only safe self-editable fields
 *     (display_name, phone). Forbidden fields (role, email, active,
 *     assigned_to scope, etc.) are silently dropped — even if a
 *     malicious client tries to PATCH { role: 'super_admin' }, only
 *     display_name and phone reach the database.
 *
 * Anything sensitive (role changes, deactivation) goes through
 * /api/crm/team/[id] which requires admin or super_admin.
 */

export async function GET(req: Request) {
  const ctx = await requireTeamMember(req)
  if (ctx instanceof NextResponse) return ctx

  const { data, error } = await supabaseAdmin
    .from("team_members")
    .select("*")
    .eq("user_id", ctx.user_id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "no_membership" }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: Request) {
  const ctx = await requireTeamMember(req)
  if (ctx instanceof NextResponse) return ctx

  const body = (await req.json().catch(() => null)) as Partial<{
    display_name: string | null
    phone: string | null
  }> | null
  if (!body) return NextResponse.json({ error: "invalid_json" }, { status: 400 })

  // Whitelist — explicitly drop everything else (role / email / active / etc).
  const safe: { display_name?: string | null; phone?: string | null } = {}
  if ("display_name" in body) safe.display_name = body.display_name?.toString().trim() || null
  if ("phone" in body) safe.phone = body.phone?.toString().trim() || null

  if (Object.keys(safe).length === 0) {
    return NextResponse.json({ error: "no_editable_fields" }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("team_members")
    .update(safe)
    .eq("user_id", ctx.user_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
