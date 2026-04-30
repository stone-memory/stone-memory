import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getCollection } from "@/lib/content-schema"
import { requireAdmin } from "@/lib/api-auth"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, ctx: { params: Promise<{ resource: string }> }) {
  const { resource } = await ctx.params
  const cfg = getCollection(resource)
  if (!cfg) return NextResponse.json({ error: "unknown resource" }, { status: 404 })

  const { data, error } = await supabaseAdmin
    .from(cfg.table)
    .select(cfg.selectColumns)
    .order(cfg.orderColumn.replace(/"/g, ""), { ascending: cfg.orderAsc ?? true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data ?? [] })
}

// POST = create or upsert. Body must include the record's id/slug. Admin only.
export async function POST(req: Request, ctx: { params: Promise<{ resource: string }> }) {
  const unauthorized = await requireAdmin(req)
  if (unauthorized) return unauthorized

  const { resource } = await ctx.params
  const cfg = getCollection(resource)
  if (!cfg) return NextResponse.json({ error: "unknown resource" }, { status: 404 })

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: "invalid json" }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from(cfg.table)
    .upsert(body, { onConflict: cfg.idColumn })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ item: data }, { status: 201 })
}
