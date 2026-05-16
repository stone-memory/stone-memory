import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/api-auth"
import {
  renderQuoteHTML,
  renderContractHTML,
  renderInvoiceHTML,
} from "@/lib/crm/pdf-templates"
import type { DocumentKind } from "@/lib/crm/types"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "stone-images"

type Payload = {
  deal_id: string
  kind: DocumentKind
  number?: string
  depositPercent?: number
}

// POST /api/crm/documents/generate — генерує HTML-документ і зберігає у Supabase Storage
export async function POST(req: Request) {
  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  const body = (await req.json().catch(() => null)) as Payload | null
  if (!body?.deal_id || !body?.kind) {
    return NextResponse.json({ error: "deal_id, kind обов'язкові" }, { status: 400 })
  }

  // Тягнемо все потрібне про угоду
  const [dealR, itemsR, paymentsR] = await Promise.all([
    supabaseAdmin
      .from("deals")
      .select("*, customers(*)")
      .eq("id", body.deal_id)
      .single(),
    supabaseAdmin.from("deal_items").select("*").eq("deal_id", body.deal_id).order("position"),
    supabaseAdmin.from("payments").select("*").eq("deal_id", body.deal_id).order("paid_at"),
  ])

  if (dealR.error || !dealR.data) {
    return NextResponse.json({ error: "deal not found" }, { status: 404 })
  }

  const deal = dealR.data
  const customer = deal.customers
  if (!customer) {
    return NextResponse.json({ error: "customer not found" }, { status: 404 })
  }

  const items = itemsR.data || []
  const payments = paymentsR.data || []

  let html: string
  if (body.kind === "quote") {
    html = renderQuoteHTML({ deal, customer, items, number: body.number })
  } else if (body.kind === "contract") {
    html = renderContractHTML({
      deal,
      customer,
      items,
      number: body.number,
      depositPercent: body.depositPercent,
    })
  } else if (body.kind === "invoice") {
    html = renderInvoiceHTML({ deal, customer, items, payments, number: body.number })
  } else {
    return NextResponse.json({ error: `kind ${body.kind} ще не підтримується` }, { status: 400 })
  }

  // Версіонування: рахуємо існуючі документи цього виду для угоди
  const { count } = await supabaseAdmin
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("deal_id", body.deal_id)
    .eq("kind", body.kind)
  const version = (count || 0) + 1

  // Завантажуємо в Storage як HTML (можна друкувати в PDF з браузера)
  const filename = `documents/${body.deal_id}/${body.kind}-v${version}.html`
  const { error: upErr } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(filename, html, {
      contentType: "text/html; charset=utf-8",
      upsert: true,
    })

  if (upErr) {
    return NextResponse.json({ error: `upload failed: ${upErr.message}` }, { status: 500 })
  }

  const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filename)

  const docNumber =
    body.number ||
    `${
      body.kind === "quote" ? "КП" : body.kind === "contract" ? "ДОГ" : "РФ"
    }-${deal.reference || deal.id.slice(0, 8)}`

  // Реєструємо в documents
  const { data: doc, error: docErr } = await supabaseAdmin
    .from("documents")
    .insert({
      deal_id: body.deal_id,
      customer_id: customer.id,
      kind: body.kind,
      number: docNumber,
      title: `${body.kind === "quote" ? "Комерційна пропозиція" : body.kind === "contract" ? "Договір" : "Рахунок-фактура"} ${docNumber}`,
      storage_path: filename,
      public_url: pub.publicUrl,
      size_bytes: Buffer.byteLength(html, "utf8"),
      version,
      meta: {
        amount_eur: Number(deal.amount_eur),
        items_count: items.length,
      },
    })
    .select()
    .single()

  if (docErr) return NextResponse.json({ error: docErr.message }, { status: 500 })

  // Подія в timeline
  await supabaseAdmin.from("deal_events").insert({
    deal_id: body.deal_id,
    kind: "document",
    message: `Створено ${doc.title}`,
    data: { document_id: doc.id, kind: body.kind, version },
  })

  return NextResponse.json({ document: doc, url: pub.publicUrl }, { status: 201 })
}
