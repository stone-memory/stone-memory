import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

// Public. GET /api/unsubscribe?token=xxx — marks subscriber as unsubscribed.
export async function GET(req: Request) {
  return handle(req)
}
export async function POST(req: Request) {
  return handle(req)
}

async function handle(req: Request): Promise<NextResponse> {
  const url = new URL(req.url)
  const token = url.searchParams.get("token")?.trim()
  if (!token) return NextResponse.json({ ok: false, error: "token required" }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from("subscribers")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    .eq("unsubscribe_token", token)
    .select("email")
    .maybeSingle()

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ ok: false, error: "invalid token" }, { status: 404 })

  return NextResponse.json({ ok: true, email: data.email })
}
