import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/api-auth"
import type { DealStatus, DealPriority } from "@/lib/crm/types"

export const dynamic = "force-dynamic"

// GET /api/crm/deals?status=...&assigned=...&customer=... — список з фільтрацією
export async function GET(req: Request) {
  const unauth = await requireAdmin(req)
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
  return NextResponse.json({ deals: data ?? [] })
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
  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const body = (await req.json().catch(() => null)) as CreatePayload | null
  if (!body?.customer_id) {
    return NextResponse.json({ error: "customer_id обов'язковий" }, { status: 400 })
  }

  const { data: deal, error } = await supabaseAdmin
    .from("deals")
    .insert({
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
    .select()
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
