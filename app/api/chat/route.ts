import { NextResponse } from "next/server"
import {
  upsertSession,
  getOperatorMessages,
  rememberRelayMessage,
  addUserMessage,
} from "@/lib/chat-store"
import { rateLimit, getClientIp } from "@/lib/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TG_CHAT = process.env.TELEGRAM_ADMIN_CHAT_ID

async function sendTelegram(text: string): Promise<number | null> {
  if (!TG_TOKEN || !TG_CHAT) return null
  try {
    const r = await fetch(
      `https://api.telegram.org/bot${TG_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TG_CHAT,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }
    )
    const data = (await r.json()) as { ok?: boolean; result?: { message_id?: number } }
    if (!data.ok) return null
    return data.result?.message_id ?? null
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    const rl = rateLimit(`chat:${ip}`, 20, 60_000) // 20 per minute per IP
    if (!rl.allowed) {
      return NextResponse.json(
        { ok: false, error: "rate_limited" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        }
      )
    }

    const body = (await req.json()) as {
      sessionId?: string
      name?: string
      phone?: string
      text?: string
      locale?: string
    }
    const { sessionId, name, phone, text, locale } = body
    if (!sessionId || !text) {
      return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 })
    }
    if (text.length > 4000) {
      return NextResponse.json({ ok: false, error: "too_long" }, { status: 413 })
    }
    // Phone sanity (E.164-ish, lenient)
    if (phone && !/^[+\d\s()-]{6,25}$/.test(phone)) {
      return NextResponse.json({ ok: false, error: "bad_phone" }, { status: 400 })
    }
    // Name max length
    if (name && name.length > 100) {
      return NextResponse.json({ ok: false, error: "bad_name" }, { status: 400 })
    }
    // Locale whitelist
    if (locale && !["uk", "pl", "en", "de", "lt"].includes(locale)) {
      return NextResponse.json({ ok: false, error: "bad_locale" }, { status: 400 })
    }

    await upsertSession(sessionId, {
      name: name || undefined,
      phone: phone || undefined,
      locale: locale || "uk",
      lastUserAt: Date.now(),
    })
    await addUserMessage(sessionId, text)

    const header = phone
      ? `<b>${escapeHtml(name || "Гість")}</b> · ${escapeHtml(phone)} · ${escapeHtml(locale || "uk")}`
      : `<b>${escapeHtml(name || "Гість")}</b> · ${escapeHtml(locale || "uk")}`

    const relay = [
      header,
      `<i>session</i>: <code>${escapeHtml(sessionId)}</code>`,
      "",
      escapeHtml(text),
      "",
      `<i>Reply to this message to answer the client.</i>`,
    ].join("\n")

    const msgId = await sendTelegram(relay)
    if (msgId !== null) rememberRelayMessage(msgId, sessionId)

    return NextResponse.json({ ok: true, relayed: msgId !== null })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const sessionId = url.searchParams.get("session")
  if (!sessionId) return NextResponse.json({ messages: [] })
  const messages = await getOperatorMessages(sessionId)
  return NextResponse.json({ messages })
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
