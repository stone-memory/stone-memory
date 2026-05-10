import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/api-auth"
import { supabaseAdmin } from "@/lib/supabase/admin"
import {
  resolveRecipients,
  dispatchBroadcast,
  type BroadcastTarget,
  type MarketingTemplateFields,
  type SendRequest,
} from "@/lib/email-dispatch"

export const dynamic = "force-dynamic"

type Body = {
  subject: string
  // Either raw html OR a named template + fields.
  html?: string
  template?: "marketing"
  fields?: MarketingTemplateFields
  target: BroadcastTarget
  scope?: "broadcast" | "individual"
  scheduleAt?: string
}

function parseRequest(body: Body): SendRequest | { error: string } {
  const subject = body.subject?.trim()
  if (!subject) return { error: "subject required" }
  if (body.template === "marketing" && body.fields) {
    const f = body.fields
    if (!f.headline || !f.intro || !f.ctaLabel || !f.ctaUrl) {
      return { error: "marketing template requires headline, intro, ctaLabel, ctaUrl" }
    }
    return { kind: "template", template: "marketing", subject, fields: f }
  }
  const html = body.html?.trim()
  if (!html) return { error: "either html or template+fields required" }
  return { kind: "html", subject, html }
}

export async function POST(req: Request) {
  const unauthorized = await requireAdmin(req)
  if (unauthorized) return unauthorized

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

  const request = parseRequest(body)
  if ("error" in request) {
    return NextResponse.json({ error: request.error }, { status: 400 })
  }

  // Schedule path.
  if (body.scheduleAt) {
    const sendAt = new Date(body.scheduleAt)
    if (isNaN(sendAt.getTime())) return NextResponse.json({ error: "invalid scheduleAt" }, { status: 400 })
    if (sendAt.getTime() < Date.now() - 60_000) {
      return NextResponse.json({ error: "scheduleAt is in the past" }, { status: 400 })
    }
    const row = {
      subject: request.subject,
      html: request.kind === "html" ? request.html : null,
      template: request.kind === "template" ? request.template : null,
      fields: request.kind === "template" ? request.fields : null,
      target: body.target,
      send_at: sendAt.toISOString(),
      status: "pending",
    }
    const { data, error } = await supabaseAdmin.from("scheduled_emails").insert(row).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, scheduled: true, id: data.id, sendAt: data.send_at })
  }

  // Immediate send.
  let recipients
  try {
    recipients = await resolveRecipients(body.target)
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "resolve failed" }, { status: 500 })
  }
  if (recipients.length === 0) {
    return NextResponse.json({ error: "no recipients found" }, { status: 400 })
  }

  const result = await dispatchBroadcast({ request, recipients, scope: body.scope })
  return NextResponse.json({ ok: true, ...result })
}
