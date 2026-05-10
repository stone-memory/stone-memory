import { NextResponse } from "next/server"
import { recordIncoming } from "@/lib/crm/comms"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Універсальний inbound email webhook.
 *
 * Підтримує формати:
 *   - Mailgun routes  (https://documentation.mailgun.com/docs/mailgun/user-manual/receive-forward-store/)
 *   - SendGrid Inbound Parse (https://docs.sendgrid.com/for-developers/parsing-email)
 *   - Postmark Inbound (https://postmarkapp.com/developer/user-guide/inbound)
 *   - Resend Inbound (через Resend Webhook)
 *   - Cloudflare Email Workers (POST з власним JSON форматом)
 *
 * Авторизація через INBOUND_EMAIL_SECRET у заголовку x-webhook-secret.
 *
 * НАЛАШТУВАННЯ найпростіше — Cloudflare Email Routing:
 * 1. У Cloudflare DNS додати MX-record на сайт
 * 2. Email Routing → Routes → Worker → POST на ваш URL
 *
 * Або в Resend:
 * 1. Resend Domains → Receiving (preview)
 * 2. Webhook URL: https://stonememory.com.ua/api/email/inbound
 */

const SHARED_SECRET = process.env.INBOUND_EMAIL_SECRET

type GenericInboundEmail = {
  // Mailgun
  sender?: string
  recipient?: string
  subject?: string
  "stripped-text"?: string
  "body-plain"?: string
  "Message-Id"?: string
  // SendGrid / Postmark
  from?: string | { email?: string; name?: string }
  to?: string | Array<{ Email?: string; Name?: string }>
  Subject?: string
  TextBody?: string
  text?: string
  MessageID?: string
  // Common
  attachments?: Array<{ name?: string; url?: string; content_type?: string; size?: number }>
}

function pickEmail(s: string | undefined | { email?: string; name?: string } | Array<unknown>): { email?: string; name?: string } {
  if (!s) return {}
  if (typeof s === "string") {
    // "Name <email@x.com>" → витягнемо
    const m = s.match(/^([^<]*)<([^>]+)>/) || s.match(/([^\s<>]+@[^\s<>]+)/)
    if (m) return { email: m[2] || m[1], name: m[1]?.trim().replace(/^"|"$/g, "") }
    return { email: s }
  }
  if (Array.isArray(s) && s.length) {
    const first = s[0] as { Email?: string; email?: string; Name?: string; name?: string }
    return { email: first?.Email || first?.email, name: first?.Name || first?.name }
  }
  return { email: (s as { email?: string }).email, name: (s as { name?: string }).name }
}

export async function POST(req: Request) {
  // Перевірка secret (опціонально)
  if (SHARED_SECRET) {
    const provided = req.headers.get("x-webhook-secret")
    if (provided !== SHARED_SECRET) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
    }
  }

  // Читаємо body — може бути JSON або form-data
  const contentType = req.headers.get("content-type") || ""
  let body: GenericInboundEmail = {}

  try {
    if (contentType.includes("application/json")) {
      body = (await req.json()) as GenericInboundEmail
    } else if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const form = await req.formData()
      body = Object.fromEntries(form.entries()) as unknown as GenericInboundEmail
    } else {
      body = (await req.json().catch(async () => {
        const form = await req.formData()
        return Object.fromEntries(form.entries()) as unknown
      })) as GenericInboundEmail
    }
  } catch {
    return NextResponse.json({ ok: false, error: "could not parse body" }, { status: 400 })
  }

  // Витягуємо ключові поля
  const { email: fromEmail, name: fromName } = pickEmail(body.sender || body.from)
  if (!fromEmail) {
    return NextResponse.json({ ok: false, error: "no sender email" }, { status: 400 })
  }

  const subject = (body.subject || body.Subject || "").trim() || null
  const text = (body["stripped-text"] || body["body-plain"] || body.TextBody || body.text || "").trim()
  const messageId = body["Message-Id"] || body.MessageID || null

  // Thread key: для email beste — нормалізована тема (без RE: FW:) + sender domain
  const cleanSubject = subject?.replace(/^(re|fw|fwd):\s*/gi, "").trim() || ""
  const threadKey = `email:${fromEmail.toLowerCase()}:${cleanSubject.slice(0, 60)}`

  try {
    await recordIncoming({
      channel: "email",
      identifier: { email: fromEmail },
      name: fromName,
      subject: subject || undefined,
      body: text || "(порожнє повідомлення)",
      externalId: messageId || undefined,
      threadKey,
      attachments: body.attachments?.map((a) => ({
        name: a.name || "attachment",
        url: a.url || "",
        mime: a.content_type || "application/octet-stream",
        size: a.size || 0,
      })),
      rawMeta: { content_type: contentType },
    })
  } catch (e) {
    console.error("[email/inbound] failed:", e)
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "fail" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    info: "Inbound email endpoint. POST з JSON або form-data. Підтримує Mailgun/SendGrid/Postmark/Resend.",
  })
}
