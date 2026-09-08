import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { guardCapability } from "@/lib/auth/permissions"
import { notifyStilnytsi } from "@/lib/seo/revalidate"

export const dynamic = "force-dynamic"

const KEYS = new Set(["contacts", "calculator", "faq", "support", "comparisons", "geo", "professional", "service"])

/**
 * Налаштування сайту стільниць (таблиця stilnytsi_settings): контакти,
 * ставки калькулятора, FAQ, тексти службових сторінок, порівняння, міста,
 * B2B, сервісні обіцянки. Один ключ — один jsonb-документ.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ key: string }> }) {
  const { key } = await ctx.params
  if (!KEYS.has(key)) return NextResponse.json({ error: "unknown key" }, { status: 404 })
  const { data, error } = await supabaseAdmin
    .from("stilnytsi_settings")
    .select("data, updated_at")
    .eq("key", key)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data?.data ?? null, updatedAt: data?.updated_at ?? null })
}

export async function PUT(req: Request, ctx: { params: Promise<{ key: string }> }) {
  const unauthorized = await guardCapability(req, "content.editorial")
  if (unauthorized) return unauthorized
  const { key } = await ctx.params
  if (!KEYS.has(key)) return NextResponse.json({ error: "unknown key" }, { status: 404 })
  const body = (await req.json().catch(() => null)) as { data?: unknown } | null
  if (!body || typeof body !== "object" || !("data" in body) || body.data === null) {
    return NextResponse.json({ error: "missing data field" }, { status: 400 })
  }
  const { data, error } = await supabaseAdmin
    .from("stilnytsi_settings")
    .upsert({ key, data: body.data, updated_at: new Date().toISOString() }, { onConflict: "key" })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  notifyStilnytsi()
  return NextResponse.json({ data: data?.data, updatedAt: data?.updated_at })
}
