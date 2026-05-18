import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getCollection } from "@/lib/content-schema"
import { guardContentMutation } from "@/lib/auth/permissions"
import { revalidateForResource } from "@/lib/seo/revalidate"

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

// POST = create or upsert. Body must include the record's id/slug.
// Gated by the collection's writeCapability (content.catalog /
// content.editorial / finances.view_company / customers.message / …).
export async function POST(req: Request, ctx: { params: Promise<{ resource: string }> }) {
  const { resource } = await ctx.params
  const cfg = getCollection(resource)
  if (!cfg) return NextResponse.json({ error: "unknown resource" }, { status: 404 })

  const unauthorized = await guardContentMutation(req, cfg.writeCapability)
  if (unauthorized) return unauthorized

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: "invalid json" }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from(cfg.table)
    .upsert(body, { onConflict: cfg.idColumn })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidateForResource(resource)
  return NextResponse.json({ item: data }, { status: 201 })
}
