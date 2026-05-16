import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/api-auth"
import type { CommChannel, CommDirection } from "@/lib/crm/types"

export const dynamic = "force-dynamic"

// GET /api/crm/communications?customer=...&deal=...&channel=...&unread=true
export async function GET(req: Request) {
  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const url = new URL(req.url)
  const customer = url.searchParams.get("customer")
  const deal = url.searchParams.get("deal")
  const channel = url.searchParams.get("channel")
  const unread = url.searchParams.get("unread") === "true"
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "200", 10), 1000)

  let q = supabaseAdmin
    .from("communications")
    .select("*, customers(id, name, phone)")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (customer) q = q.eq("customer_id", customer)
  if (deal) q = q.eq("deal_id", deal)
  if (channel) q = q.eq("channel", channel)
  if (unread) q = q.is("read_at", null).eq("direction", "inbound")

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ communications: data ?? [] })
}

type CreatePayload = {
  customer_id?: string
  deal_id?: string
  channel: CommChannel
  direction: CommDirection
  subject?: string
  body?: string
  external_id?: string
  attachments?: unknown[]
  meta?: Record<string, unknown>
}

// POST — додати запис вручну (наприклад, "клієнт подзвонив")
export async function POST(req: Request) {
  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const body = (await req.json().catch(() => null)) as CreatePayload | null
  if (!body?.channel || !body?.direction) {
    return NextResponse.json({ error: "channel і direction обов'язкові" }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("communications")
    .insert({
      customer_id: body.customer_id || null,
      deal_id: body.deal_id || null,
      channel: body.channel,
      direction: body.direction,
      subject: body.subject || null,
      body: body.body || null,
      external_id: body.external_id || null,
      attachments: body.attachments || null,
      meta: body.meta || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ communication: data }, { status: 201 })
}

// PATCH /api/crm/communications — bulk mark as read.
// Body: { ids: number[] }
export async function PATCH(req: Request) {
  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const body = (await req.json().catch(() => null)) as { ids?: number[] } | null
  if (!body?.ids?.length) return NextResponse.json({ error: "ids required" }, { status: 400 })

  const { error } = await supabaseAdmin
    .from("communications")
    .update({ read_at: new Date().toISOString() })
    .in("id", body.ids)
    .is("read_at", null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, marked: body.ids.length })
}
