import { NextResponse } from "next/server"
import { getAuthedUser } from "@/lib/auth/permissions"

export const dynamic = "force-dynamic"

/**
 * GET /api/auth/me
 * Returns the caller's role + email + active flag. Used by the client
 * to decide UI gating (e.g. show password form, hide integrations).
 *
 * Returns null role for authed users without a team_members row instead
 * of 403 — the client can still render a useful page (read-only view).
 */
export async function GET(req: Request) {
  const ctx = await getAuthedUser(req)
  if (ctx instanceof NextResponse) return ctx

  return NextResponse.json({
    user_id: ctx.user_id,
    email: ctx.email,
    role: ctx.role,
    active: ctx.active,
  })
}
