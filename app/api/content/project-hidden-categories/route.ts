import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/api-auth"

export const dynamic = "force-dynamic"

export async function GET() {
  const { data, error } = await supabaseAdmin.from("project_hidden_categories").select("category")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ categories: (data ?? []).map((r) => r.category) })
}

// PUT { categories: string[] } — replaces the full set. Admin only.
export async function PUT(req: Request) {
  const unauthorized = await requireAdmin(req)
  if (unauthorized) return unauthorized
  const body = (await req.json().catch(() => null)) as { categories?: string[] } | null
  if (!body || !Array.isArray(body.categories)) {
    return NextResponse.json({ error: "categories array required" }, { status: 400 })
  }

  const { error: delErr } = await supabaseAdmin
    .from("project_hidden_categories")
    .delete()
    .neq("category", "___none___")
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })

  if (body.categories.length > 0) {
    const rows = body.categories.map((c) => ({ category: c }))
    const { error: insErr } = await supabaseAdmin.from("project_hidden_categories").insert(rows)
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })
  }

  return NextResponse.json({ categories: body.categories })
}
