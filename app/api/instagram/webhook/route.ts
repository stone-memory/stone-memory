import { NextResponse } from "next/server"
import { recordIncoming } from "@/lib/crm/comms"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Instagram Messaging webhook (через Meta Graph API).
 *
 * НАЛАШТУВАННЯ:
 * 1. Той самий Meta App що і для WhatsApp/Facebook
 * 2. Підключити Instagram Business account через Facebook Page
 * 3. Додати продукт "Webhooks", subscribe до сторінки
 * 4. Subscribe to fields: messages, messaging_postbacks, message_reactions
 * 5. Webhook URL: https://stonememory.com.ua/api/instagram/webhook
 * 6. Verify token: INSTAGRAM_VERIFY_TOKEN
 *
 * ENV змінні:
 *   INSTAGRAM_VERIFY_TOKEN — для верифікації webhook
 *   INSTAGRAM_PAGE_ACCESS_TOKEN — токен сторінки Facebook (long-lived)
 *   INSTAGRAM_PAGE_ID — ID сторінки Facebook
 */

const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN

export async function GET(req: Request) {
  const url = new URL(req.url)
  const mode = url.searchParams.get("hub.mode")
  const token = url.searchParams.get("hub.verify_token")
  const challenge = url.searchParams.get("hub.challenge")
  if (mode === "subscribe" && token && VERIFY_TOKEN && token === VERIFY_TOKEN) {
    return new Response(challenge || "", { status: 200 })
  }
  return NextResponse.json({ ok: false }, { status: 403 })
}

type IGWebhookBody = {
  object?: string  // 'instagram' or 'page'
  entry?: Array<{
    id?: string
    time?: number
    messaging?: Array<{
      sender?: { id?: string }
      recipient?: { id?: string }
      timestamp?: number
      message?: {
        mid?: string
        text?: string
        attachments?: Array<{ type?: string; payload?: { url?: string } }>
        is_echo?: boolean  // true коли це наше власне повідомлення
      }
      postback?: { mid?: string; payload?: string; title?: string }
    }>
  }>
}

export async function POST(req: Request) {
  let body: IGWebhookBody
  try {
    body = (await req.json()) as IGWebhookBody
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  if (body.object !== "instagram" && body.object !== "page") {
    return NextResponse.json({ ok: true, ignored: "not_meta" })
  }

  let processed = 0

  for (const entry of body.entry || []) {
    for (const event of entry.messaging || []) {
      // Ігноруємо echo (це наші ж повідомлення)
      if (event.message?.is_echo) continue

      const senderId = event.sender?.id
      const text = event.message?.text || event.postback?.title || "(вкладення)"
      const externalId = event.message?.mid || event.postback?.mid

      if (!senderId) continue

      // Спробуємо отримати ім'я через Graph API (опціонально)
      let name: string | undefined
      const token = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN
      if (token) {
        try {
          const r = await fetch(`https://graph.facebook.com/v21.0/${senderId}?fields=name&access_token=${encodeURIComponent(token)}`)
          if (r.ok) {
            const j = (await r.json()) as { name?: string }
            name = j.name
          }
        } catch { /* ignore */ }
      }

      try {
        await recordIncoming({
          channel: "instagram",
          identifier: { instagramPsid: senderId },
          name: name || `Instagram ${senderId.slice(0, 6)}`,
          body: text,
          externalId,
          threadKey: `instagram:${senderId}`,
          rawMeta: { sender_id: senderId, timestamp: event.timestamp },
        })
        processed++
      } catch (e) {
        console.error("[instagram] recordIncoming failed:", e)
      }
    }
  }

  return NextResponse.json({ ok: true, processed })
}
