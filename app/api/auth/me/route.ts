import { NextResponse } from "next/server"
import { getCurrentCapabilities } from "@/lib/auth/permissions"

export const dynamic = "force-dynamic"

/**
 * GET /api/auth/me
 * Returns the caller's role + email + active flag + effective
 * capabilities array. Used by the client to decide UI gating
 * (password form visibility, integrations link, conditional features).
 *
 * Returns empty capabilities for authed users without a team_members
 * row instead of 403 — the client can still render a useful page
 * (read-only view).
 */
export async function GET(req: Request) {
  const result = await getCurrentCapabilities(req)
  if (result instanceof NextResponse) return result

  return NextResponse.json({
    user_id: result.user.user_id,
    email: result.user.email,
    role: result.user.role,
    active: result.user.active,
    capabilities: result.capabilities,
  })
}
