import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/api-auth"

export const dynamic = "force-dynamic"

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin(req)
  if (unauthorized) return unauthorized
  const { id } = await ctx.params
  const { error } = await supabaseAdmin.from("subscribers").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
