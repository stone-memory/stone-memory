import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { guardCapability } from "@/lib/auth/permissions"
import { canTransition, type DealStatus } from "@/lib/crm/types"

export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ id: string }> }

// GET /api/crm/deals/[id] — повний overview угоди (всі зв'язані сутності)
export async function GET(req: Request, ctx: Ctx) {
  const unauth = await guardCapability(req, "deals.view_all")
  if (unauth) return unauth

  const { id } = await ctx.params

  const [dealR, itemsR, eventsR, remindersR, commsR, docsR, prodR, paymentsR] = await Promise.all([
    supabaseAdmin
      .from("deals")
      .select("*, customers(*), assigned:team_members!deals_assigned_to_fkey(*), master:team_members!deals_master_id_fkey(*)")
      .eq("id", id)
      .single(),
    supabaseAdmin.from("deal_items").select("*").eq("deal_id", id).order("position"),
    supabaseAdmin.from("deal_events").select("*").eq("deal_id", id).order("created_at", { ascending: false }).limit(100),
    supabaseAdmin.from("reminders").select("*").eq("deal_id", id).order("due_at"),
    supabaseAdmin.from("communications").select("*").eq("deal_id", id).order("created_at", { ascending: false }).limit(100),
    supabaseAdmin.from("documents").select("*").eq("deal_id", id).order("created_at", { ascending: false }),
    supabaseAdmin.from("production_stages").select("*").eq("deal_id", id).order("position"),
    supabaseAdmin.from("payments").select("*").eq("deal_id", id).order("paid_at", { ascending: false }),
  ])

  if (dealR.error) return NextResponse.json({ error: dealR.error.message }, { status: 404 })

  return NextResponse.json({
    deal: dealR.data,
    items: itemsR.data || [],
    events: eventsR.data || [],
    reminders: remindersR.data || [],
    communications: commsR.data || [],
    documents: docsR.data || [],
    productionStages: prodR.data || [],
    payments: paymentsR.data || [],
  })
}

type PatchPayload = Partial<{
  status: DealStatus
  priority: "low" | "normal" | "high" | "urgent"
  amount_eur: number
  description: string | null
  notes: string | null
  internal_notes: string | null
  assigned_to: string | null
  master_id: string | null
  expected_install: string | null
  expected_delivery: string | null
  install_address: string | null
  install_city: string | null
  category: "memorial" | null
  /** Categorical reason for closing as cancelled/lost. See lib/crm/types.ts
   *  → LOST_REASON_OPTIONS for the canonical list (just text values, no
   *  enum constraint at the DB level so taxonomy can evolve freely). */
  lost_reason: string | null
  lost_reason_note: string | null
}>

// PATCH /api/crm/deals/[id] — змінити поля. При зміні status — валідація переходу.
export async function PATCH(req: Request, ctx: Ctx) {
  const unauth = await guardCapability(req, "deals.edit")
  if (unauth) return unauth

  const { id } = await ctx.params
  const body = (await req.json().catch(() => null)) as PatchPayload | null
  if (!body) return NextResponse.json({ error: "invalid json" }, { status: 400 })

  // Якщо змінюємо status — перевіряємо legal transition
  if (body.status) {
    const { data: current, error: readErr } = await supabaseAdmin
      .from("deals")
      .select("status")
      .eq("id", id)
      .single()
    if (readErr) return NextResponse.json({ error: readErr.message }, { status: 404 })

    const from = current.status as DealStatus
    if (!canTransition(from, body.status)) {
      return NextResponse.json(
        {
          error: `Заборонений перехід: ${from} → ${body.status}`,
          hint: "Дозволені стани переходу описані в lib/crm/types.ts → DEAL_TRANSITIONS",
        },
        { status: 422 }
      )
    }
  }

  const { data, error } = await supabaseAdmin
    .from("deals")
    .update(body)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deal: data })
}

// DELETE — повне видалення (каскадно зносить items, events, reminders, payments, docs)
export async function DELETE(req: Request, ctx: Ctx) {
  const unauth = await guardCapability(req, "deals.delete_permanent")
  if (unauth) return unauth

  const { id } = await ctx.params
  const { error } = await supabaseAdmin.from("deals").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
