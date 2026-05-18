import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/api-auth"
import { supabaseAdmin } from "@/lib/supabase/admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin(req)
  if (unauthorized) return unauthorized

  const { id } = await ctx.params
  await supabaseAdmin.from("chat_messages").delete().eq("session_id", id)
  await supabaseAdmin.from("chat_sessions").delete().eq("id", id)

  return NextResponse.json({ ok: true })
}
