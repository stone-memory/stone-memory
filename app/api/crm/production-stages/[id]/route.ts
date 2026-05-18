import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { guardCapability } from "@/lib/auth/permissions"

export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ id: string }> }

type Patch = Partial<{
  status: "pending" | "in_progress" | "done" | "failed"
  master_id: string | null
  due_at: string | null
  notes: string | null
}>

// PATCH — change status / master / notes / due date. started_at and
// completed_at are derived from the status transition so the timeline
// stays consistent without the client having to manage them.
export async function PATCH(req: Request, ctx: Ctx) {
  const unauth = await guardCapability(req, "deals.edit")
  if (unauth) return unauth

  const { id } = await ctx.params
  const body = (await req.json().catch(() => null)) as Patch | null
  if (!body) return NextResponse.json({ error: "invalid json" }, { status: 400 })

  const update: Record<string, unknown> = {}
  if (body.master_id !== undefined) update.master_id = body.master_id
  if (body.due_at !== undefined) update.due_at = body.due_at
  if (body.notes !== undefined) update.notes = body.notes

  if (body.status) {
    update.status = body.status
    const now = new Date().toISOString()
    if (body.status === "in_progress") {
      // set started_at only if not already started
      const { data: cur } = await supabaseAdmin
        .from("production_stages")
        .select("started_at")
        .eq("id", id)
        .single()
      if (!cur?.started_at) update.started_at = now
      update.completed_at = null
    } else if (body.status === "done" || body.status === "failed") {
      update.completed_at = now
    } else if (body.status === "pending") {
      update.started_at = null
      update.completed_at = null
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "нічого оновлювати" }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("production_stages")
    .update(update)
    .eq("id", id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ stage: data })
}

export async function DELETE(req: Request, ctx: Ctx) {
  const unauth = await guardCapability(req, "deals.edit")
  if (unauth) return unauth
  const { id } = await ctx.params
  const { error } = await supabaseAdmin.from("production_stages").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
