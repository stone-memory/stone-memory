import { NextResponse } from "next/server"
import { guardCapability } from "@/lib/auth/permissions"
import { supabaseAdmin } from "@/lib/supabase/admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const unauthorized = await guardCapability(req, "customers.message")
  if (unauthorized) return unauthorized

  const { id } = await ctx.params
  await supabaseAdmin.from("chat_messages").delete().eq("session_id", id)
  await supabaseAdmin.from("chat_sessions").delete().eq("id", id)

  return NextResponse.json({ ok: true })
}
