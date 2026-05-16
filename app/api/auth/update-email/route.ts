import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireSuperAdmin } from "@/lib/auth/permissions"

export const dynamic = "force-dynamic"

/**
 * POST /api/auth/update-email
 * Body: { newEmail: string, targetUserId?: string }
 *
 * super_admin only. Uses admin SDK so trigger bypass + RLS bypass apply.
 * Note: Supabase will send a confirmation email to the new address per
 * project settings — caller should warn the user that login will switch
 * after they click the link.
 */
export async function POST(req: Request) {
  const ctx = await requireSuperAdmin(req)
  if (ctx instanceof NextResponse) return ctx

  const body = (await req.json().catch(() => null)) as {
    newEmail?: string
    targetUserId?: string
  } | null
  if (!body || typeof body.newEmail !== "string") {
    return NextResponse.json({ error: "missing_email" }, { status: 400 })
  }
  const trimmed = body.newEmail.trim().toLowerCase()
  if (!trimmed.includes("@") || trimmed.length < 5) {
    return NextResponse.json({ error: "invalid_email" }, { status: 422 })
  }

  const targetId = body.targetUserId || ctx.user_id

  const { error } = await supabaseAdmin.auth.admin.updateUserById(targetId, {
    email: trimmed,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  // Mirror to team_members.email so the table stays in sync.
  await supabaseAdmin.from("team_members").update({ email: trimmed }).eq("user_id", targetId)

  return NextResponse.json({ ok: true })
}
