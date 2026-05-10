import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/api-auth"
import { notifyCustomerStatusChange } from "@/lib/notifications"

export const dynamic = "force-dynamic"

type PatchPayload = {
  status?: "new" | "in_progress" | "completed"
  contacted?: boolean
  note?: { id?: string; author: string; text: string; createdAt?: string | Date }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin(req)
  if (unauthorized) return unauthorized
  const { id } = await ctx.params
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  let body: PatchPayload
  try {
    body = (await req.json()) as PatchPayload
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

  // Read current row so we can detect status transitions before patching.
  const { data: before, error: readErr } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", id)
    .single()
  if (readErr) {
    return NextResponse.json({ error: readErr.message }, { status: 404 })
  }

  const updates: Record<string, unknown> = {}
  if (body.status) updates.status = body.status
  if (typeof body.contacted === "boolean") updates.contacted = body.contacted

  if (body.note) {
    const current = Array.isArray(before?.notes) ? (before!.notes as unknown[]) : []
    const newNote = {
      id: body.note.id ?? `note-${Date.now()}`,
      author: body.note.author,
      text: body.note.text,
      createdAt:
        body.note.createdAt instanceof Date
          ? body.note.createdAt.toISOString()
          : body.note.createdAt || new Date().toISOString(),
    }
    updates.notes = [...current, newNote]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If the admin moved the order into a new customer-facing stage — send them
  // an email. Fire-and-forget so the API response isn't delayed by Resend.
  if (
    body.status &&
    body.status !== before.status &&
    (body.status === "in_progress" || body.status === "completed")
  ) {
    Promise.resolve(notifyCustomerStatusChange(data, body.status)).catch((e) =>
      console.error("[orders] notifyCustomerStatusChange failed:", e)
    )
  }

  return NextResponse.json({ order: data })
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin(req)
  if (unauthorized) return unauthorized
  const { id } = await ctx.params
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  const { error } = await supabaseAdmin.from("orders").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
