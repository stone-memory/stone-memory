import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { guardCapability } from "@/lib/auth/permissions"
import type { DealStatus, DealPriority } from "@/lib/crm/types"

export const dynamic = "force-dynamic"

// GET /api/crm/deals?status=...&assigned=...&customer=... — список з фільтрацією
export async function GET(req: Request) {
  const unauth = await guardCapability(req, "deals.view_all")
  if (unauth) return unauth

  const url = new URL(req.url)
  const status = url.searchParams.getAll("status")
  const assigned = url.searchParams.get("assigned")
  const master = url.searchParams.get("master")
  const customer = url.searchParams.get("customer")
  const priority = url.searchParams.get("priority")
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "200", 10), 500)

  let query = supabaseAdmin
    .from("deals")
    .select("*, customers(id, name, phone, email, locale, city)")
    .order("updated_at", { ascending: false })
    .limit(limit)

  if (status.length) query = query.in("status", status)
  if (assigned) query = query.eq("assigned_to", assigned)
  if (master) query = query.eq("master_id", master)
  if (customer) query = query.eq("customer_id", customer)
  if (priority) query = query.eq("priority", priority)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Enrich each deal with last_inbound_at / last_outbound_at so the kanban
  // can render an SLA badge ("Х днів без відповіді"). One extra round-trip
  // total — acceptable up to ~500 deals. If the page ever needs to render
  // 1000+ deals, replace with a Postgres view that pre-aggregates.
  const deals = data ?? []
  const dealIds = deals.map((d) => d.id as string)
  if (dealIds.length) {
    const { data: comms } = await supabaseAdmin
      .from("communications")
      .select("deal_id, direction, created_at")
      .in("deal_id", dealIds)
      .order("created_at", { ascending: false })

    const lastInbound = new Map<string, string>()
    const lastOutbound = new Map<string, string>()
    for (const c of comms ?? []) {
      const dealId = c.deal_id as string | null
      if (!dealId) continue
      if (c.direction === "inbound" && !lastInbound.has(dealId)) {
        lastInbound.set(dealId, c.created_at as string)
      } else if (c.direction === "outbound" && !lastOutbound.has(dealId)) {
        lastOutbound.set(dealId, c.created_at as string)
      }
    }
    for (const deal of deals) {
      const d = deal as Record<string, unknown>
      d.last_inbound_at = lastInbound.get(deal.id as string) || null
      d.last_outbound_at = lastOutbound.get(deal.id as string) || null
    }
  }

  return NextResponse.json({ deals })
}

type CreatePayload = {
  customer_id: string
  status?: DealStatus
  priority?: DealPriority
  category?: "memorial" | "home"
  description?: string
  amount_eur?: number
  source?: string
  notes?: string
  internal_notes?: string
  assigned_to?: string
  master_id?: string
  expected_install?: string
  install_address?: string
  install_city?: string
  items?: Array<{ kind?: string; ref_id?: string; title: string; qty?: number; unit_price_eur?: number }>
}

// POST /api/crm/deals — створити нову угоду + опціонально позиції
export async function POST(req: Request) {
  const unauth = await guardCapability(req, "deals.create")
  if (unauth) return unauth

  const body = (await req.json().catch(() => null)) as CreatePayload | null
  if (!body?.customer_id) {
    return NextResponse.json({ error: "customer_id обов'язковий" }, { status: 400 })
  }

  // Carry the customer's first-touch campaign onto the deal, so revenue can be
  // grouped by campaign without a join. deals.utm has existed since the CRM
  // migration but nothing ever wrote to it.
  //
  // Deals are created by hand from a customer, so this is the only moment the
  // link can be made. Best-effort: a failed lookup must not block deal
  // creation, it just leaves utm null as before.
  let utm: Record<string, string> | null = null
  try {
    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("attribution")
      .eq("id", body.customer_id)
      .maybeSingle()
    utm = (customer?.attribution as Record<string, string> | null) ?? null
  } catch {
    /* attribution is metadata — never fail a deal over it */
  }

  const { data: deal, error } = await supabaseAdmin
    .from("deals")
    .insert({
      utm,
      customer_id: body.customer_id,
      status: body.status || "new",
      priority: body.priority || "normal",
      category: body.category || null,
      description: body.description || null,
      amount_eur: body.amount_eur || 0,
      source: body.source || null,
      notes: body.notes || null,
      internal_notes: body.internal_notes || null,
      assigned_to: body.assigned_to || null,
      master_id: body.master_id || null,
      expected_install: body.expected_install || null,
      install_address: body.install_address || null,
      install_city: body.install_city || null,
    })
    .select("*, customers(id, name, phone, email, locale, city)")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Додаємо позиції якщо передано
  if (body.items?.length) {
    const itemsRows = body.items.map((it, i) => ({
      deal_id: deal.id,
      kind: it.kind || "stone",
      ref_id: it.ref_id || null,
      title: it.title,
      qty: it.qty || 1,
      unit_price_eur: it.unit_price_eur || 0,
      position: i,
    }))
    await supabaseAdmin.from("deal_items").insert(itemsRows)
  }

  return NextResponse.json({ deal }, { status: 201 })
}
