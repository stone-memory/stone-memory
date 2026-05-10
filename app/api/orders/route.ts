import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/api-auth"
import { notifyAdminNewOrder, sendCustomerConfirmation } from "@/lib/notifications"

export const dynamic = "force-dynamic"

type OrderPayload = {
  name?: string
  phone?: string
  email?: string
  message?: string
  locale?: string
  source?: string
  reference?: string
  items?: Array<{ id: string; [key: string]: unknown }>
}

export async function POST(req: Request) {
  let body: OrderPayload
  try {
    body = (await req.json()) as OrderPayload
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

  const name = body.name?.trim()
  const phone = body.phone?.trim()

  if (!name || !phone) {
    return NextResponse.json({ error: "name and phone required" }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert({
      name,
      phone,
      email: body.email?.trim() || null,
      message: body.message?.trim() || null,
      locale: body.locale || "uk",
      source: body.source || "selection-form",
      reference: body.reference || null,
      items: body.items || null,
      stone_id: body.items?.[0]?.id || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fire-and-forget notifications. Errors are logged but don't fail the response.
  Promise.allSettled([
    notifyAdminNewOrder(data),
    sendCustomerConfirmation(data),
  ]).catch(() => {})

  return NextResponse.json({ order: data }, { status: 201 })
}

export async function GET(req: Request) {
  const unauthorized = await requireAdmin(req)
  if (unauthorized) return unauthorized
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ orders: data })
}
