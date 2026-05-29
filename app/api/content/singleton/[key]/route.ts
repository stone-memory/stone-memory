import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { guardCapability } from "@/lib/auth/permissions"
import { NAV_SETTINGS_KEY } from "@/lib/nav-settings"

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
  const unauthorized = await guardCapability(req, "content.editorial")
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

  // The nav toggle is read in the root layout (shared by every page), so
  // re-render all pages' layout to apply it promptly.
  if (key === NAV_SETTINGS_KEY) {
    try {
      revalidatePath("/", "layout")
    } catch {
      // best-effort — revalidation is an optimisation, not correctness
    }
  }

  return NextResponse.json({ data: data?.data, updatedAt: data?.updated_at })
}

export async function DELETE(req: Request, ctx: { params: Promise<{ key: string }> }) {
  const unauthorized = await guardCapability(req, "content.editorial")
  if (unauthorized) return unauthorized
  const { key } = await ctx.params
  const { error } = await supabaseAdmin.from("site_content").delete().eq("key", key)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
