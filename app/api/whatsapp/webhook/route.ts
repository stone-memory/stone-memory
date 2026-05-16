import { NextResponse } from "next/server"
import { recordIncoming } from "@/lib/crm/comms"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * WhatsApp Cloud API webhook.
 *
 * НАЛАШТУВАННЯ:
 * 1. Створити Meta App: https://developers.facebook.com/apps
 * 2. Додати продукт "WhatsApp"
 * 3. Webhook URL: https://stonememory.com.ua/api/whatsapp/webhook
 * 4. Verify token: значення з ENV WHATSAPP_VERIFY_TOKEN (будь-який рядок)
 * 5. Subscribe to fields: messages, message_status
 * 6. Token + Phone Number ID — у Meta App dashboard
 *
 * ENV змінні:
 *   WHATSAPP_VERIFY_TOKEN — будь-який secret для верифікації webhook
 *   WHATSAPP_TOKEN — Permanent access token (System User)
 *   WHATSAPP_PHONE_NUMBER_ID — ID номера від Meta
 */

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN

// GET — Meta verify (одноразово при налаштуванні)
export async function GET(req: Request) {
  const url = new URL(req.url)
  const mode = url.searchParams.get("hub.mode")
  const token = url.searchParams.get("hub.verify_token")
  const challenge = url.searchParams.get("hub.challenge")

  if (mode === "subscribe" && token && VERIFY_TOKEN && token === VERIFY_TOKEN) {
    return new Response(challenge || "", { status: 200 })
  }
  return NextResponse.json({ ok: false, info: "WhatsApp webhook" }, { status: 403 })
}

type WhatsAppWebhookBody = {
  object?: string
  entry?: Array<{
    id?: string
    changes?: Array<{
      field?: string
      value?: {
        messaging_product?: string
        metadata?: { display_phone_number?: string; phone_number_id?: string }
        contacts?: Array<{ profile?: { name?: string }; wa_id?: string }>
        messages?: Array<{
          from?: string
          id?: string
          timestamp?: string
          type?: "text" | "image" | "audio" | "video" | "document" | "voice" | "sticker" | "location" | "contacts"
          text?: { body?: string }
          image?: { caption?: string; mime_type?: string; sha256?: string; id?: string }
          audio?: { id?: string; mime_type?: string }
          document?: { caption?: string; filename?: string; id?: string }
          // ...
        }>
        statuses?: Array<{ id?: string; status?: string; timestamp?: string }>
      }
    }>
  }>
}

// POST — приходить нове повідомлення
export async function POST(req: Request) {
  let body: WhatsAppWebhookBody
  try {
    body = (await req.json()) as WhatsAppWebhookBody
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  if (body.object !== "whatsapp_business_account") {
    return NextResponse.json({ ok: true, ignored: "not_whatsapp" })
  }

  const processed: number[] = []

  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field !== "messages") continue
      const value = change.value
      if (!value) continue

      const contact = value.contacts?.[0]
      const name = contact?.profile?.name
      const wa_id = contact?.wa_id  // = phone number without +

      for (const msg of value.messages || []) {
        if (!msg.from || !msg.id) continue
        const phone = `+${msg.from}`  // WhatsApp дає number без +

        // Витягнемо текст залежно від типу
        let text = ""
        if (msg.type === "text") text = msg.text?.body || ""
        else if (msg.type === "image") text = `📷 ${msg.image?.caption || "Зображення"}`
        else if (msg.type === "audio" || msg.type === "voice") text = "🎤 Голосове повідомлення"
        else if (msg.type === "video") text = "🎬 Відео"
        else if (msg.type === "document") text = `📄 ${msg.document?.filename || msg.document?.caption || "Документ"}`
        else if (msg.type === "location") text = "📍 Геолокація"
        else if (msg.type === "contacts") text = "👤 Контакт"
        else text = `[${msg.type || "unknown"}]`

        try {
          await recordIncoming({
            channel: "whatsapp",
            identifier: { phone },
            name: name || phone,
            body: text,
            externalId: msg.id,
            threadKey: `whatsapp:${msg.from}`,
            rawMeta: { wa_id, type: msg.type, timestamp: msg.timestamp },
          })
          processed.push(1)
        } catch (e) {
          console.error("[whatsapp] recordIncoming failed:", e)
        }
      }

      // Status updates (delivered/read) — не пишемо у comms, тільки логуємо
      if (value.statuses?.length) {
        // TODO: оновити replied_at або delivered_at у communications за external_id
      }
    }
  }

  return NextResponse.json({ ok: true, processed: processed.length })
}
