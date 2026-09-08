import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { ReminderKind } from "@/lib/crm/types"
import { OPEN_STATUSES, ownFilter, resolveReminderActor } from "@/lib/crm/reminders-access"

export const dynamic = "force-dynamic"

const NO_ROWS = "00000000-0000-0000-0000-000000000000"

// GET /api/crm/reminders?status=open|done|<raw>&scope=mine|all&assigned=<member>&due_before=ISO
//   status=open  — не виконані й не скасовані (за замовчуванням)
//   status=done  — виконані або скасовані
//   scope=all    — уся команда, лише з правом deals.view_all
export async function GET(req: Request) {
  const actor = await resolveReminderActor(req)
  if (actor instanceof NextResponse) return actor

  const url = new URL(req.url)
  const status = url.searchParams.get("status") || "open"
  const scope = url.searchParams.get("scope") || "mine"
  const assigned = url.searchParams.get("assigned")
  const dueBefore = url.searchParams.get("due_before")
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "200", 10), 500)

  let query = supabaseAdmin
    .from("reminders")
    .select("*, deals(reference, status, customers(name, phone))")
    .order("due_at", { ascending: status !== "done" })
    .limit(limit)

  if (status === "open") {
    query = query.is("completed_at", null).in("status", [...OPEN_STATUSES])
  } else if (status === "done") {
    query = query.or("completed_at.not.is.null,status.eq.cancelled")
  } else {
    query = query.eq("status", status)
  }

  if (!actor.seesAll || scope !== "all") {
    query = actor.memberId ? query.or(ownFilter(actor.memberId)) : query.eq("id", NO_ROWS)
  }
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

// POST /api/crm/reminders — нова задача або нагадування по угоді.
// Без assigned_to призначається автору; призначати іншим може лише той,
// хто бачить усю команду (deals.view_all).
export async function POST(req: Request) {
  const actor = await resolveReminderActor(req)
  if (actor instanceof NextResponse) return actor

  const body = (await req.json().catch(() => null)) as CreatePayload | null
  if (!body?.title?.trim() || !body?.due_at) {
    return NextResponse.json({ error: "title і due_at обов'язкові" }, { status: 400 })
  }
  if (Number.isNaN(new Date(body.due_at).getTime())) {
    return NextResponse.json({ error: "due_at має бути датою" }, { status: 400 })
  }

  const assignedTo =
    actor.seesAll && body.assigned_to ? body.assigned_to : actor.memberId
  const notifyVia = Array.isArray(body.notify_via)
    ? body.notify_via.filter((c) => c === "telegram" || c === "email")
    : ["telegram"]

  const { data, error } = await supabaseAdmin
    .from("reminders")
    .insert({
      deal_id: body.deal_id || null,
      customer_id: body.customer_id || null,
      assigned_to: assignedTo,
      created_by: actor.memberId,
      kind: body.kind || (body.deal_id ? "follow_up" : "custom"),
      title: body.title.trim(),
      description: body.description?.trim() || null,
      due_at: body.due_at,
      notify_via: notifyVia,
      recurrence: body.recurrence || null,
    })
    .select("*, deals(reference, status, customers(name, phone))")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (body.deal_id) {
    await supabaseAdmin.from("deal_events").insert({
      deal_id: body.deal_id,
      kind: "reminder_set",
      message: body.title.trim(),
      data: { due_at: body.due_at, reminder_id: data.id },
    })
  }

  return NextResponse.json({ reminder: data }, { status: 201 })
}
