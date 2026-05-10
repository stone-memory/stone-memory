import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/api-auth"
import type { TeamRole } from "@/lib/crm/types"

export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, ctx: Ctx) {
  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const { id } = await ctx.params
  const body = (await req.json().catch(() => null)) as Partial<{
    display_name: string
    role: TeamRole
    phone: string | null
    active: boolean
    notes: string | null
  }> | null
  if (!body) return NextResponse.json({ error: "invalid json" }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from("team_members")
    .update(body)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ member: data })
}

export async function DELETE(req: Request, ctx: Ctx) {
  const unauth = await requireAdmin(req)
  if (unauth) return unauth
  const { id } = await ctx.params
  // Soft-delete через active=false щоб зберегти історію assignment-ів
  const { error } = await supabaseAdmin
    .from("team_members")
    .update({ active: false })
    .eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
