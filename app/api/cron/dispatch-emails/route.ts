import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import {
  resolveRecipients,
  dispatchBroadcast,
  type BroadcastTarget,
  type SendRequest,
  type MarketingTemplateFields,
} from "@/lib/email-dispatch"

export const dynamic = "force-dynamic"
export const maxDuration = 300

async function allowed(req: Request): Promise<boolean> {
  const header = req.headers.get("authorization") || ""
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : ""

  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && token === cronSecret) return true

  if (token) {
    const { data } = await supabaseAdmin.auth.getUser(token)
    if (data.user) return true
  }
  return false
}

function toSendRequest(row: { subject: string; html: string | null; template: string | null; fields: MarketingTemplateFields | null }): SendRequest | null {
  if (row.template === "marketing" && row.fields) {
    return { kind: "template", template: "marketing", subject: row.subject, fields: row.fields }
  }
  if (row.html) {
    return { kind: "html", subject: row.subject, html: row.html }
  }
  return null
}

async function handle(req: Request): Promise<NextResponse> {
  if (!(await allowed(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const nowIso = new Date().toISOString()
  const { data: due, error } = await supabaseAdmin
    .from("scheduled_emails")
    .select("*")
    .eq("status", "pending")
    .lte("send_at", nowIso)
    .order("send_at", { ascending: true })
    .limit(5)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!due || due.length === 0) return NextResponse.json({ ok: true, processed: 0 })

  const results: Array<{ id: string; sent: number; failed: number; error?: string }> = []
  for (const job of due) {
    try {
      const sendReq = toSendRequest(job)
      if (!sendReq) {
        await supabaseAdmin
          .from("scheduled_emails")
          .update({ status: "failed", error: "invalid content", sent_at: new Date().toISOString() })
          .eq("id", job.id)
        results.push({ id: job.id, sent: 0, failed: 0, error: "invalid content" })
        continue
      }
      const recipients = await resolveRecipients(job.target as BroadcastTarget)
      if (recipients.length === 0) {
        await supabaseAdmin
          .from("scheduled_emails")
          .update({ status: "failed", error: "no recipients", sent_at: new Date().toISOString() })
          .eq("id", job.id)
        results.push({ id: job.id, sent: 0, failed: 0, error: "no recipients" })
        continue
      }
      const { sent, failed } = await dispatchBroadcast({ request: sendReq, recipients })
      await supabaseAdmin
        .from("scheduled_emails")
        .update({
          status: failed > 0 && sent === 0 ? "failed" : "sent",
          sent_count: sent,
          failed_count: failed,
          sent_at: new Date().toISOString(),
          error: null,
        })
        .eq("id", job.id)
      results.push({ id: job.id, sent, failed })
    } catch (e) {
      const msg = e instanceof Error ? e.message : "dispatch failed"
      await supabaseAdmin
        .from("scheduled_emails")
        .update({ status: "failed", error: msg, sent_at: new Date().toISOString() })
        .eq("id", job.id)
      results.push({ id: job.id, sent: 0, failed: 0, error: msg })
    }
  }

  return NextResponse.json({ ok: true, processed: results.length, results })
}

export async function GET(req: Request) {
  return handle(req)
}
export async function POST(req: Request) {
  return handle(req)
}
