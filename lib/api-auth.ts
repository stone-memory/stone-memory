import "server-only"
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

// Verify the request carries a valid Supabase access token.
// Returns null if OK, or a NextResponse to return immediately if unauthorized.
export async function requireAdmin(req: Request): Promise<NextResponse | null> {
  const header = req.headers.get("authorization") || req.headers.get("Authorization")
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : null
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  return null
}
