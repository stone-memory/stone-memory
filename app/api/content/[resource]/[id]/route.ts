import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getCollection } from "@/lib/content-schema"
import { guardContentMutation } from "@/lib/auth/permissions"
import { revalidateForResource } from "@/lib/seo/revalidate"

export const dynamic = "force-dynamic"

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ resource: string; id: string }> }
) {
  const { resource, id } = await ctx.params
  const cfg = getCollection(resource)
  if (!cfg) return NextResponse.json({ error: "unknown resource" }, { status: 404 })

  const { data, error } = await supabaseAdmin
    .from(cfg.table)
    .select(cfg.selectColumns)
    .eq(cfg.idColumn, id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ item: data })
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ resource: string; id: string }> }
) {
  const { resource, id } = await ctx.params
  const cfg = getCollection(resource)
  if (!cfg) return NextResponse.json({ error: "unknown resource" }, { status: 404 })

  const unauthorized = await guardContentMutation(req, cfg.writeCapability)
  if (unauthorized) return unauthorized

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: "invalid json" }, { status: 400 })

  const patch: Record<string, unknown> = { ...body, updated_at: new Date().toISOString() }

  const { data, error } = await supabaseAdmin
    .from(cfg.table)
    .update(patch)
    .eq(cfg.idColumn, id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidateForResource(resource)
  return NextResponse.json({ item: data })
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ resource: string; id: string }> }
) {
  const { resource, id } = await ctx.params
  const cfg = getCollection(resource)
  if (!cfg) return NextResponse.json({ error: "unknown resource" }, { status: 404 })

  const unauthorized = await guardContentMutation(req, cfg.writeCapability)
  if (unauthorized) return unauthorized

  const { error } = await supabaseAdmin.from(cfg.table).delete().eq(cfg.idColumn, id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidateForResource(resource)
  return NextResponse.json({ ok: true })
}
