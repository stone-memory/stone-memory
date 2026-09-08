import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { ReminderKind } from "@/lib/crm/types"
import { isOwn, resolveReminderActor } from "@/lib/crm/reminders-access"

export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ id: string }> }

// PATCH — поля: title, description, due_at, kind, notify_via, assigned_to
// (останнє — лише з deals.view_all), або action:
//   complete — виконано (completed_at); статус лишається, щоб cron не чіпав
//   cancel   — скасовано
//   snooze   — перенести на snoozeMinutes; статус знову pending, щоб cron
//              нагадав ще раз (раніше snoozed випадав із cron назавжди)
//   reopen   — повернути виконану/скасовану в роботу
type Patch = Partial<{
  title: string
  description: string | null
  due_at: string
  kind: ReminderKind
  notify_via: string[]
  assigned_to: string | null
  action: "complete" | "snooze" | "cancel" | "reopen"
  snoozeMinutes: number
}>

async function loadOwned(req: Request, id: string) {
  const actor = await resolveReminderActor(req)
  if (actor instanceof NextResponse) return actor
  const { data: row, error } = await supabaseAdmin
    .from("reminders")
    .select("id, assigned_to, created_by, due_at")
    .eq("id", id)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 })
  if (!isOwn(actor, row)) {
    return NextResponse.json({ error: "forbidden", reason: "not_your_task" }, { status: 403 })
  }
  return { actor, row }
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const owned = await loadOwned(req, id)
  if (owned instanceof NextResponse) return owned
  const { actor } = owned

  const body = (await req.json().catch(() => null)) as Patch | null
  if (!body) return NextResponse.json({ error: "invalid json" }, { status: 400 })

  const update: Record<string, unknown> = {}
  if (typeof body.title === "string" && body.title.trim()) update.title = body.title.trim()
  if ("description" in body) update.description = body.description?.trim() || null
  if (body.due_at) {
    if (Number.isNaN(new Date(body.due_at).getTime())) {
      return NextResponse.json({ error: "due_at має бути датою" }, { status: 400 })
    }
    update.due_at = body.due_at
    // Перенесена вручну — має нагадати знову.
    update.status = "pending"
  }
  if (body.kind) update.kind = body.kind
  if (Array.isArray(body.notify_via)) {
    update.notify_via = body.notify_via.filter((c) => c === "telegram" || c === "email")
  }
  if ("assigned_to" in body && actor.seesAll) update.assigned_to = body.assigned_to || null

  const now = new Date().toISOString()
  if (body.action === "complete") {
    update.completed_at = now
  } else if (body.action === "cancel") {
    update.status = "cancelled"
    update.completed_at = now
  } else if (body.action === "snooze") {
    const minutes = Math.max(1, body.snoozeMinutes ?? 60)
    const to = new Date(Date.now() + minutes * 60_000).toISOString()
    update.status = "pending"
    update.snoozed_to = to
    update.due_at = to
    update.completed_at = null
  } else if (body.action === "reopen") {
    update.status = "pending"
    update.completed_at = null
    update.snoozed_to = null
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("reminders")
    .update(update)
    .eq("id", id)
    .select("*, deals(reference, status, customers(name, phone))")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reminder: data })
}

export async function DELETE(req: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const owned = await loadOwned(req, id)
  if (owned instanceof NextResponse) return owned
  const { error } = await supabaseAdmin.from("reminders").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
