import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { guardCapability } from "@/lib/auth/permissions"

export const dynamic = "force-dynamic"

// Standard manufacturing pipeline (enum order in supabase/crm-migration.sql).
export const PROD_STAGE_PIPELINE = [
  "raw_material",
  "cutting",
  "grinding",
  "polishing",
  "engraving",
  "sealing",
  "qc",
  "packaging",
  "transport",
  "foundation",
  "installation",
  "cleanup",
] as const

type Body = {
  deal_id: string
  /** Seed the full standard pipeline (only if the deal has no stages yet). */
  seed?: boolean
  /** Or add a single stage. */
  kind?: string
  due_at?: string | null
  master_id?: string | null
  notes?: string | null
}

// GET /api/crm/production-stages?deal=<id> — list (the deal overview already
// returns these, but this exists for standalone refetch).
export async function GET(req: Request) {
  const unauth = await guardCapability(req, "deals.edit")
  if (unauth) return unauth
  const dealId = new URL(req.url).searchParams.get("deal")
  if (!dealId) return NextResponse.json({ error: "deal обов'язковий" }, { status: 400 })
  const { data, error } = await supabaseAdmin
    .from("production_stages")
    .select("*")
    .eq("deal_id", dealId)
    .order("position")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ stages: data || [] })
}

// POST — seed standard pipeline OR add a single stage.
export async function POST(req: Request) {
  const unauth = await guardCapability(req, "deals.edit")
  if (unauth) return unauth

  const body = (await req.json().catch(() => null)) as Body | null
  if (!body?.deal_id) {
    return NextResponse.json({ error: "deal_id обов'язковий" }, { status: 400 })
  }

  const { data: existing } = await supabaseAdmin
    .from("production_stages")
    .select("position")
    .eq("deal_id", body.deal_id)
    .order("position", { ascending: false })
    .limit(1)
  const nextPos = (existing?.[0]?.position ?? -1) + 1

  if (body.seed) {
    if (nextPos > 0) {
      return NextResponse.json(
        { error: "Етапи вже створені для цієї угоди" },
        { status: 409 }
      )
    }
    const rows = PROD_STAGE_PIPELINE.map((kind, i) => ({
      deal_id: body.deal_id,
      kind,
      status: "pending",
      position: i,
    }))
    const { data, error } = await supabaseAdmin
      .from("production_stages")
      .insert(rows)
      .select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ stages: data }, { status: 201 })
  }

  if (!body.kind) {
    return NextResponse.json({ error: "kind обов'язковий" }, { status: 400 })
  }
  const { data, error } = await supabaseAdmin
    .from("production_stages")
    .insert({
      deal_id: body.deal_id,
      kind: body.kind,
      status: "pending",
      due_at: body.due_at || null,
      master_id: body.master_id || null,
      notes: body.notes || null,
      position: nextPos,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ stage: data }, { status: 201 })
}
