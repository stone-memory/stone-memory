import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { guardCapability } from "@/lib/auth/permissions"

export const dynamic = "force-dynamic"

// GET /api/crm/customers?q=...&assigned=... — список з пошуком і фільтрацією.
export async function GET(req: Request) {
  const unauth = await guardCapability(req, "customers.view_all")
  if (unauth) return unauth

  const url = new URL(req.url)
  const q = url.searchParams.get("q")?.trim().toLowerCase()
  const assigned = url.searchParams.get("assigned")
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "100", 10), 500)

  let query = supabaseAdmin
    .from("customers")
    .select("*")
    .order("last_contact_at", { ascending: false, nullsFirst: false })
    .limit(limit)

  if (q) {
    // ILIKE по name, phone (без знаків), email
    const norm = q.replace(/\D/g, "")
    if (norm.length >= 3) {
      query = query.or(`phone_norm.ilike.%${norm}%,name.ilike.%${q}%,email.ilike.%${q}%`)
    } else {
      query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`)
    }
  }
  if (assigned) query = query.eq("assigned_to", assigned)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ customers: data ?? [] })
}

type CreatePayload = {
  phone: string
  name: string
  email?: string
  locale?: string
  city?: string
  country?: string
  source?: string
  tags?: string[]
  notes?: string
  assigned_to?: string
}

// POST /api/crm/customers — створити (або upsert по phone_norm)
export async function POST(req: Request) {
  const unauth = await guardCapability(req, "customers.edit")
  if (unauth) return unauth

  const body = (await req.json().catch(() => null)) as CreatePayload | null
  if (!body?.phone || !body?.name) {
    return NextResponse.json({ error: "phone і name обов'язкові" }, { status: 400 })
  }

  const phoneNorm = body.phone.replace(/\D/g, "")
  if (phoneNorm.length < 6) {
    return NextResponse.json({ error: "невалідний телефон" }, { status: 400 })
  }

  // Upsert по phone_norm (не дозволяємо дублів)
  const { data: existing } = await supabaseAdmin
    .from("customers")
    .select("id")
    .eq("phone_norm", phoneNorm)
    .maybeSingle()

  if (existing) {
    // Оновлюємо name/email/notes але не перезаписуємо tags
    const { data, error } = await supabaseAdmin
      .from("customers")
      .update({
        name: body.name,
        email: body.email || null,
        locale: body.locale || "uk",
        city: body.city || null,
        country: body.country || null,
        source: body.source || null,
        notes: body.notes || null,
        assigned_to: body.assigned_to || null,
      })
      .eq("id", existing.id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ customer: data, existed: true })
  }

  const { data, error } = await supabaseAdmin
    .from("customers")
    .insert({
      phone: body.phone,
      name: body.name,
      email: body.email || null,
      locale: body.locale || "uk",
      city: body.city || null,
      country: body.country || null,
      source: body.source || null,
      tags: body.tags || [],
      notes: body.notes || null,
      assigned_to: body.assigned_to || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ customer: data, existed: false }, { status: 201 })
}
