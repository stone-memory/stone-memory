import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { guardTeamMember } from "@/lib/auth/permissions"

export const dynamic = "force-dynamic"

/**
 * GET /api/crm/documents?order_id=<uuid> — документи, прив'язані до заявки
 * сайту (вкладення з форми). Сторінка угоди отримує документи разом з угодою
 * (/api/crm/deals/[id]); цей список потрібен картці заявки в /admin, де угоди
 * під рукою немає, а є лише id рядка в orders.
 */
export async function GET(req: Request) {
  const unauthorized = await guardTeamMember(req)
  if (unauthorized) return unauthorized

  const orderId = new URL(req.url).searchParams.get("order_id")?.trim()
  if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) {
    return NextResponse.json({ error: "order_id (uuid) required" }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("documents")
    .select("*")
    .eq("meta->>order_id", orderId)
    .order("created_at", { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ documents: data ?? [] })
}
