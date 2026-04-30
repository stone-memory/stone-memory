import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/api-auth"

export const dynamic = "force-dynamic"

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("featured_stones")
    .select("stone_id, position")
    .order("position", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ids: (data ?? []).map((r) => r.stone_id) })
}

// PUT { ids: string[] } — replaces the full ordered list. Admin only.
export async function PUT(req: Request) {
  const unauthorized = await requireAdmin(req)
  if (unauthorized) return unauthorized
  const body = (await req.json().catch(() => null)) as { ids?: string[] } | null
  if (!body || !Array.isArray(body.ids)) {
    return NextResponse.json({ error: "ids array required" }, { status: 400 })
  }
  const ids = body.ids.slice(0, 6)

  const { error: delErr } = await supabaseAdmin.from("featured_stones").delete().neq("stone_id", "___none___")
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })

  if (ids.length > 0) {
    const rows = ids.map((id, i) => ({ stone_id: id, position: i }))
    const { error: insErr } = await supabaseAdmin.from("featured_stones").insert(rows)
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })
  }

  return NextResponse.json({ ids })
}
