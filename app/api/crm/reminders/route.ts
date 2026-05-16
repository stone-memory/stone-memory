import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/api-auth"
import type { ReminderKind } from "@/lib/crm/types"

export const dynamic = "force-dynamic"

// GET /api/crm/reminders?status=pending&assigned=...&due_before=ISO
export async function GET(req: Request) {
  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const url = new URL(req.url)
  const status = url.searchParams.get("status") || "pending"
  const assigned = url.searchParams.get("assigned")
  const dueBefore = url.searchParams.get("due_before")
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "100", 10), 500)

  let query = supabaseAdmin
    .from("reminders")
    .select("*, deals(reference, status, customers(name, phone))")
    .order("due_at", { ascending: true })
    .limit(limit)

  if (status) query = query.eq("status", status)
  if (assigned) query = query.eq("assigned_to", assigned)
  if (dueBefore) query = query.lte("due_at", dueBefore)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reminders: data ?? [] })
}

type CreatePayload = {
  deal_id?: string
  customer_id?: string
  assigned_to?: string
  kind?: ReminderKind
  title: string
  description?: string
  due_at: string
  notify_via?: string[]
  recurrence?: string
}

// POST /api/crm/reminders
export async function POST(req: Request) {
  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const body = (await req.json().catch(() => null)) as CreatePayload | null
  if (!body?.title || !body?.due_at) {
    return NextResponse.json({ error: "title і due_at обов'язкові" }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("reminders")
    .insert({
      deal_id: body.deal_id || null,
      customer_id: body.customer_id || null,
      assigned_to: body.assigned_to || null,
      kind: body.kind || "follow_up",
      title: body.title,
      description: body.description || null,
      due_at: body.due_at,
      notify_via: body.notify_via || ["telegram"],
      recurrence: body.recurrence || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Записуємо подію в deal_events якщо прив'язано до угоди
  if (body.deal_id) {
    await supabaseAdmin.from("deal_events").insert({
      deal_id: body.deal_id,
      kind: "reminder_set",
      message: body.title,
      data: { due_at: body.due_at, reminder_id: data.id },
    })
  }

  return NextResponse.json({ reminder: data }, { status: 201 })
}
