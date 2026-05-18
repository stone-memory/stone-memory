import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getCollection } from "@/lib/content-schema"
import { guardContentMutation } from "@/lib/auth/permissions"
import { revalidateForResource } from "@/lib/seo/revalidate"

export const dynamic = "force-dynamic"

// PATCH /api/content/[resource]/reorder
// Body: { ids: string[] } — full ordered list of IDs
// Sets position = index for each ID
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ resource: string }> }
) {
  const { resource } = await ctx.params
  const cfg = getCollection(resource)
  if (!cfg) return NextResponse.json({ error: "unknown resource" }, { status: 404 })

  const unauthorized = await guardContentMutation(req, cfg.writeCapability)
  if (unauthorized) return unauthorized

  const body = (await req.json().catch(() => null)) as { ids?: unknown } | null
  if (!Array.isArray(body?.ids)) {
    return NextResponse.json({ error: "ids array required" }, { status: 400 })
  }

  const ids = body.ids as string[]
  const results = await Promise.all(
    ids.map((id, i) =>
      supabaseAdmin.from(cfg.table).update({ position: i }).eq(cfg.idColumn, id)
    )
  )

  const firstError = results.find((r) => r.error)
  if (firstError?.error) {
    return NextResponse.json({ error: firstError.error.message }, { status: 500 })
  }

  revalidateForResource(resource)
  return NextResponse.json({ ok: true })
}
