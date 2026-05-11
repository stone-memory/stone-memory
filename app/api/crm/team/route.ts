import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/api-auth"
import type { TeamRole } from "@/lib/crm/types"

export const dynamic = "force-dynamic"

// GET /api/crm/team?active=true
export async function GET(req: Request) {
  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const url = new URL(req.url)
  const activeOnly = url.searchParams.get("active") === "true"

  let q = supabaseAdmin.from("team_members").select("*").order("display_name", { ascending: true })
  if (activeOnly) q = q.eq("active", true)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ team: data ?? [] })
}

type CreatePayload = {
  email: string
  display_name?: string
  role: TeamRole
  phone?: string
  user_id?: string
  /** Optional custom role assignment. If set, the trigger
   *  sync_team_member_role_from_custom will overwrite `role` with the
   *  custom role's base_role automatically — UI sends both to keep the
   *  intent explicit. */
  custom_role_id?: string | null
}

// POST — додати члена команди.
// Зверни увагу: user_id заповнюється тільки після того як людина зареєструвалась
// у Supabase Auth. До цього — записуємо лише email і role.
export async function POST(req: Request) {
  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const body = (await req.json().catch(() => null)) as CreatePayload | null
  if (!body?.email || !body?.role) {
    return NextResponse.json({ error: "email і role обов'язкові" }, { status: 400 })
  }

  // Спробуємо знайти user_id по email серед auth.users (якщо є)
  let userId: string | null = body.user_id || null
  if (!userId) {
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
    const found = authUsers.users.find((u) => u.email?.toLowerCase() === body.email.toLowerCase())
    if (found) userId = found.id
  }

  const { data, error } = await supabaseAdmin
    .from("team_members")
    .insert({
      user_id: userId,
      email: body.email.toLowerCase(),
      display_name: body.display_name || null,
      role: body.role,
      phone: body.phone || null,
      custom_role_id: body.custom_role_id || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ member: data }, { status: 201 })
}
