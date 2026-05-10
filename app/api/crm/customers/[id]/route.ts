import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/api-auth"

export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ id: string }> }

// GET /api/crm/customers/[id] — Customer 360°: всі deals + reminders + comms + payments + docs
export async function GET(req: Request, ctx: Ctx) {
  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const { id } = await ctx.params

  const [customerR, dealsR, remindersR, commsR, docsR, paymentsR] = await Promise.all([
    supabaseAdmin.from("customers").select("*").eq("id", id).single(),
    supabaseAdmin.from("deals").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
    supabaseAdmin
      .from("reminders")
      .select("*")
      .eq("customer_id", id)
      .order("due_at", { ascending: true })
      .limit(50),
    supabaseAdmin
      .from("communications")
      .select("*")
      .eq("customer_id", id)
      .order("created_at", { ascending: false })
      .limit(200),
    supabaseAdmin.from("documents").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
    supabaseAdmin
      .from("payments")
      .select("*")
      .eq("customer_id", id)
      .order("paid_at", { ascending: false }),
  ])

  if (customerR.error) {
    return NextResponse.json({ error: customerR.error.message }, { status: 404 })
  }

  // Fetch deal_events for all of this customer's deals — used by the
  // unified activity timeline. Done as a separate query (not a Supabase
  // foreign-table embed) so deterministic ordering is easy.
  const dealIds = (dealsR.data || []).map((d) => d.id as string)
  const dealEventsR = dealIds.length
    ? await supabaseAdmin
        .from("deal_events")
        .select("*")
        .in("deal_id", dealIds)
        .order("created_at", { ascending: false })
        .limit(200)
    : { data: [], error: null as null | { message: string } }

  const totalLifetimeValue = Number(customerR.data.ltv_eur) || 0
  const openDealsCount =
    dealsR.data?.filter(
      (d) => !["completed", "cancelled", "lost"].includes(d.status as string)
    ).length || 0

  return NextResponse.json({
    customer: customerR.data,
    deals: dealsR.data || [],
    reminders: remindersR.data || [],
    communications: commsR.data || [],
    documents: docsR.data || [],
    payments: paymentsR.data || [],
    dealEvents: dealEventsR.data || [],
    totalLifetimeValue,
    openDealsCount,
  })
}

// PATCH /api/crm/customers/[id] — часткове оновлення
export async function PATCH(req: Request, ctx: Ctx) {
  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const { id } = await ctx.params
  const body = (await req.json().catch(() => null)) as Partial<{
    name: string
    email: string | null
    locale: string
    city: string | null
    country: string | null
    source: string | null
    tags: string[]
    notes: string | null
    do_not_contact: boolean
    assigned_to: string | null
  }> | null

  if (!body) return NextResponse.json({ error: "invalid json" }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from("customers")
    .update(body)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ customer: data })
}

// DELETE — обережно, каскадно знесе всі deals/comms/payments цього клієнта
export async function DELETE(req: Request, ctx: Ctx) {
  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const { id } = await ctx.params
  const { error } = await supabaseAdmin.from("customers").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
