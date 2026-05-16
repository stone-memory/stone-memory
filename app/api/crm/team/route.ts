import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireAdminOrSuperAdmin, requireSuperAdmin } from "@/lib/auth/permissions"
import type { TeamRole } from "@/lib/crm/types"

export const dynamic = "force-dynamic"

// GET /api/crm/team?active=true
export async function GET(req: Request) {
  const ctx = await requireAdminOrSuperAdmin(req)
  if (ctx instanceof NextResponse) return ctx

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
  /** Optional initial password. When present, the API provisions the
   *  Supabase Auth user with admin SDK and links the resulting user_id
   *  to the team_members row in one step — so the teammate can log in
   *  immediately. When omitted, only the team_members row is created
   *  and the user has to register themselves later. */
  password?: string
  /** Optional custom role assignment. If set, the trigger
   *  sync_team_member_role_from_custom will overwrite `role` with the
   *  custom role's base_role automatically — UI sends both to keep the
   *  intent explicit. */
  custom_role_id?: string | null
}

// POST — додати члена команди.
// - Без `password` → запис у team_members з user_id=null (або, якщо такий
//   email уже зареєстрований в Supabase Auth, з існуючим user_id).
// - З `password` → провіжимо нового Supabase Auth юзера через admin SDK
//   і прив'язуємо id до team_members. Створення auth-юзера — це
//   super_admin-only дія (захист від адміна, який провіжить собі бекдор).
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as CreatePayload | null
  if (!body?.email || !body?.role) {
    return NextResponse.json({ error: "email і role обов'язкові" }, { status: 400 })
  }

  const willProvisionAuth = typeof body.password === "string" && body.password.length > 0

  // Permissions: setting a password = creating an auth user = owner-only.
  // The plain team_members insert is still admin-allowed.
  const ctx = willProvisionAuth
    ? await requireSuperAdmin(req)
    : await requireAdminOrSuperAdmin(req)
  if (ctx instanceof NextResponse) return ctx

  if (willProvisionAuth && (body.password as string).length < 8) {
    return NextResponse.json({ error: "password_too_short", min: 8 }, { status: 422 })
  }

  // Resolve user_id either from existing auth, password provisioning, or leave null
  let userId: string | null = body.user_id || null
  if (!userId) {
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
    const found = authUsers.users.find((u) => u.email?.toLowerCase() === body.email.toLowerCase())
    if (found) userId = found.id
  }

  if (willProvisionAuth && !userId) {
    // Create a fresh Supabase Auth user with email_confirm=true so they
    // can sign in straight away without a verification round-trip.
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: body.email.toLowerCase(),
      password: body.password,
      email_confirm: true,
    })
    if (createErr || !created.user) {
      return NextResponse.json(
        { error: createErr?.message || "create_auth_user_failed" },
        { status: 500 }
      )
    }
    userId = created.user.id
  } else if (willProvisionAuth && userId) {
    // Email already had an auth row — just rotate the password to the
    // one the admin typed so they can hand it over to the teammate.
    const { error: pwErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: body.password,
    })
    if (pwErr) {
      return NextResponse.json({ error: pwErr.message }, { status: 500 })
    }
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
