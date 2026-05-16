import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/api-auth"

export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ id: string }> }

// PATCH — можна: змінити title/description/due_at, complete (status=sent + completed_at),
// snooze (status=snoozed + snoozed_to), cancel (status=cancelled).
type Patch = Partial<{
  title: string
  description: string | null
  due_at: string
  status: "pending" | "sent" | "snoozed" | "cancelled"
  snoozed_to: string | null
  completed_at: string | null
  assigned_to: string | null
  /** action shortcut: 'complete' | 'snooze' | 'cancel' */
  action: "complete" | "snooze" | "cancel"
  /** для snooze — на скільки хвилин */
  snoozeMinutes: number
}>

export async function PATCH(req: Request, ctx: Ctx) {
  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const { id } = await ctx.params
  const body = (await req.json().catch(() => null)) as Patch | null
  if (!body) return NextResponse.json({ error: "invalid json" }, { status: 400 })

  // Перетворюємо action в конкретні поля
  const update: Record<string, unknown> = { ...body }
  delete update.action
  delete update.snoozeMinutes

  if (body.action === "complete") {
    update.status = "sent"
    update.completed_at = new Date().toISOString()
  } else if (body.action === "cancel") {
    update.status = "cancelled"
    update.completed_at = new Date().toISOString()
  } else if (body.action === "snooze") {
    const minutes = body.snoozeMinutes ?? 60
    update.status = "snoozed"
    update.snoozed_to = new Date(Date.now() + minutes * 60_000).toISOString()
    update.due_at = update.snoozed_to // продовжуємо ланцюжок
  }

  const { data, error } = await supabaseAdmin
    .from("reminders")
    .update(update)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reminder: data })
}

export async function DELETE(req: Request, ctx: Ctx) {
  const unauth = await requireAdmin(req)
  if (unauth) return unauth
  const { id } = await ctx.params
  const { error } = await supabaseAdmin.from("reminders").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
