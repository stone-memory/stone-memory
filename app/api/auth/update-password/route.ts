import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireSuperAdmin } from "@/lib/auth/permissions"

export const dynamic = "force-dynamic"

/**
 * POST /api/auth/update-password
 * Body: { newPassword: string, targetUserId?: string }
 *
 * - super_admin only (enforced by requireSuperAdmin + Postgres trigger).
 * - If targetUserId is omitted, updates the caller's own password.
 * - If targetUserId is provided, updates that user's password (super_admin
 *   reset-someone-else's-password flow).
 *
 * Uses the service-role client (supabaseAdmin) which bypasses RLS and
 * therefore also bypasses the block_sensitive_auth_updates trigger
 * (auth.uid() is null in that path — see migration comment).
 */
export async function POST(req: Request) {
  const ctx = await requireSuperAdmin(req)
  if (ctx instanceof NextResponse) return ctx

  const body = (await req.json().catch(() => null)) as {
    newPassword?: string
    targetUserId?: string
  } | null
  if (!body || typeof body.newPassword !== "string") {
    return NextResponse.json({ error: "missing_password" }, { status: 400 })
  }
  if (body.newPassword.length < 8) {
    return NextResponse.json({ error: "password_too_short" }, { status: 422 })
  }

  const targetId = body.targetUserId || ctx.user_id

  const { error } = await supabaseAdmin.auth.admin.updateUserById(targetId, {
    password: body.newPassword,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
