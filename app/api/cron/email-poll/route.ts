import { NextResponse } from "next/server"
import { ImapFlow } from "imapflow"
import { simpleParser } from "mailparser"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getIntegrationConfig } from "@/lib/integrations/config"
import { recordIncoming } from "@/lib/crm/comms"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 60

// Same cron auth as /api/cron/reminders.
async function isAllowed(req: Request): Promise<boolean> {
  const auth = req.headers.get("authorization") || ""
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : ""
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) return token === cronSecret
  if (token) {
    const { data } = await supabaseAdmin.auth.getUser(token)
    if (data.user) return true
  }
  return false
}

async function poll(): Promise<{ ok: boolean; processed?: number; skipped?: string; error?: string }> {
  const mbox = await getIntegrationConfig("email_mailbox")
  if (!mbox.address || !mbox.app_password) {
    return { ok: true, skipped: "email_mailbox not configured" }
  }

  const port = Number(mbox.imap_port) || 993
  const client = new ImapFlow({
    host: mbox.imap_host || "imap.gmail.com",
    port,
    secure: true,
    auth: { user: mbox.address, pass: mbox.app_password },
    logger: false,
  })

  let processed = 0
  await client.connect()
  const lock = await client.getMailboxLock(mbox.imap_folder || "INBOX")
  try {
    const uids = (await client.search({ seen: false }, { uid: true })) || []
    // Process oldest-first, cap the batch so a backlog can't blow maxDuration.
    const batch = uids.slice(0, 25)
    for (const uid of batch) {
      try {
        const msg = await client.fetchOne(String(uid), { source: true }, { uid: true })
        if (!msg || !msg.source) continue
        const parsed = await simpleParser(msg.source as Buffer)
        const fromAddr = parsed.from?.value?.[0]
        const fromEmail = fromAddr?.address?.toLowerCase()
        if (!fromEmail) {
          await client.messageFlagsAdd(String(uid), ["\\Seen"], { uid: true })
          continue
        }
        // Skip bulk/automated mail (newsletters, platform notifications,
        // no-reply senders) so it doesn't flood the Inbox or create junk
        // customers. Real customer/order emails have none of these.
        const hdr = (n: string) => String(parsed.headers.get(n) ?? "").toLowerCase()
        const precedence = hdr("precedence")
        const autoSubmitted = hdr("auto-submitted")
        const localPart = fromEmail.split("@")[0]
        const isAutomated =
          parsed.headers.has("list-unsubscribe") ||
          /^(bulk|list|junk)$/.test(precedence) ||
          (autoSubmitted !== "" && autoSubmitted !== "no") ||
          /^(no-?reply|do-?not-?reply|notif|notify|mailer-daemon|bounce|postmaster|alert|news|noreply)/.test(
            localPart
          )
        if (isAutomated) {
          await client.messageFlagsAdd(String(uid), ["\\Seen"], { uid: true })
          continue
        }

        const subject = (parsed.subject || "").trim()
        const cleanSubject = subject.replace(/^(re|fw|fwd):\s*/gi, "").trim()
        const threadKey = `email:${fromEmail}:${cleanSubject.slice(0, 60)}`
        const body =
          (parsed.text || parsed.html || "")
            .toString()
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+\n/g, "\n")
            .trim()
            .slice(0, 8000)
        await recordIncoming({
          channel: "email",
          identifier: { email: fromEmail },
          name: fromAddr?.name || undefined,
          subject: subject || undefined,
          body,
          externalId: parsed.messageId || String(uid),
          threadKey,
          createdAt: parsed.date ? new Date(parsed.date).toISOString() : undefined,
          rawMeta: { message_id: parsed.messageId, uid: String(uid) },
        })
        await client.messageFlagsAdd(String(uid), ["\\Seen"], { uid: true })
        processed++
      } catch (e) {
        console.error("[email-poll] message failed:", e)
      }
    }
  } finally {
    lock.release()
    await client.logout().catch(() => {})
  }
  return { ok: true, processed }
}

export async function POST(req: Request) {
  if (!(await isAllowed(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  try {
    return NextResponse.json(await poll())
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "poll failed" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, info: "email IMAP poll cron — POST with CRON_SECRET" })
}
