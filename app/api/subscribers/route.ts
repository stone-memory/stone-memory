import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/api-auth"

export const dynamic = "force-dynamic"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Public — subscribe to the newsletter.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: string; locale?: string } | null
  const email = body?.email?.trim().toLowerCase()
  const locale = body?.locale || "uk"
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 })
  }

  // If already exists — reactivate.
  const { data: existing } = await supabaseAdmin
    .from("subscribers")
    .select("id, status")
    .eq("email", email)
    .maybeSingle()

  if (existing) {
    if (existing.status !== "active") {
      await supabaseAdmin
        .from("subscribers")
        .update({ status: "active", unsubscribed_at: null })
        .eq("id", existing.id)
    }
    return NextResponse.json({ ok: true, existed: true })
  }

  const { error } = await supabaseAdmin.from("subscribers").insert({
    email,
    locale,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, existed: false }, { status: 201 })
}

// Admin — list all subscribers.
export async function GET(req: Request) {
  const unauthorized = await requireAdmin(req)
  if (unauthorized) return unauthorized

  const { data, error } = await supabaseAdmin
    .from("subscribers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ subscribers: data ?? [] })
}
