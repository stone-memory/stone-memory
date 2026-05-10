import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/api-auth"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, ctx: { params: Promise<{ key: string }> }) {
  const { key } = await ctx.params
  const { data, error } = await supabaseAdmin
    .from("site_content")
    .select("data, updated_at")
    .eq("key", key)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data?.data ?? null, updatedAt: data?.updated_at ?? null })
}

export async function PUT(req: Request, ctx: { params: Promise<{ key: string }> }) {
  const unauthorized = await requireAdmin(req)
  if (unauthorized) return unauthorized
  const { key } = await ctx.params
  const body = (await req.json().catch(() => null)) as { data?: unknown } | null
  if (!body || typeof body !== "object" || !("data" in body)) {
    return NextResponse.json({ error: "missing data field" }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("site_content")
    .upsert(
      { key, data: body.data, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data?.data, updatedAt: data?.updated_at })
}

export async function DELETE(req: Request, ctx: { params: Promise<{ key: string }> }) {
  const unauthorized = await requireAdmin(req)
  if (unauthorized) return unauthorized
  const { key } = await ctx.params
  const { error } = await supabaseAdmin.from("site_content").delete().eq("key", key)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
