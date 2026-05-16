import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/api-auth"
import type { PaymentKind, PaymentMethod } from "@/lib/crm/types"

export const dynamic = "force-dynamic"

// GET /api/crm/payments?deal=...&customer=...
export async function GET(req: Request) {
  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const url = new URL(req.url)
  const deal = url.searchParams.get("deal")
  const customer = url.searchParams.get("customer")

  let q = supabaseAdmin.from("payments").select("*").order("paid_at", { ascending: false }).limit(500)
  if (deal) q = q.eq("deal_id", deal)
  if (customer) q = q.eq("customer_id", customer)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ payments: data ?? [] })
}

type CreatePayload = {
  deal_id: string
  customer_id?: string
  kind: PaymentKind
  method: PaymentMethod
  amount_eur: number
  currency?: string
  amount_native?: number
  fx_rate?: number
  reference?: string
  paid_at?: string
  notes?: string
}

// POST — реєстрація платежу. Тригер автоматично оновить deals.paid_eur.
export async function POST(req: Request) {
  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const body = (await req.json().catch(() => null)) as CreatePayload | null
  if (!body?.deal_id || !body?.amount_eur || !body?.kind || !body?.method) {
    return NextResponse.json(
      { error: "deal_id, amount_eur, kind, method обов'язкові" },
      { status: 400 }
    )
  }

  // Якщо customer_id не передано — підтягуємо з deals
  let customerId = body.customer_id
  if (!customerId) {
    const { data: d } = await supabaseAdmin
      .from("deals")
      .select("customer_id")
      .eq("id", body.deal_id)
      .single()
    customerId = d?.customer_id
  }

  if (!customerId) return NextResponse.json({ error: "customer_id не знайдено" }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from("payments")
    .insert({
      deal_id: body.deal_id,
      customer_id: customerId,
      kind: body.kind,
      method: body.method,
      amount_eur: body.amount_eur,
      currency: body.currency || "EUR",
      amount_native: body.amount_native || null,
      fx_rate: body.fx_rate || null,
      reference: body.reference || null,
      paid_at: body.paid_at || new Date().toISOString(),
      notes: body.notes || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Запис у deal_events (timeline)
  await supabaseAdmin.from("deal_events").insert({
    deal_id: body.deal_id,
    kind: "payment",
    message: `${body.kind} ${body.amount_eur} ${body.currency || "EUR"} (${body.method})`,
    data: { payment_id: data.id, amount_eur: body.amount_eur, method: body.method },
  })

  return NextResponse.json({ payment: data }, { status: 201 })
}
