import { NextResponse } from "next/server"
import { recordIncoming } from "@/lib/crm/comms"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Twilio SMS inbound webhook.
 *
 * НАЛАШТУВАННЯ:
 * 1. Twilio Console → Phone Numbers → активний номер
 * 2. Messaging Configuration → "A message comes in" → Webhook
 * 3. URL: https://stonememory.com.ua/api/sms/inbound
 * 4. HTTP POST
 *
 * ENV змінні:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN  — для validation підпису (опціонально, але рекомендовано)
 *   TWILIO_FROM_NUMBER — наш номер для відправки
 *
 * Відповідь Twilio очікує TwiML XML (можна порожній).
 */

export async function POST(req: Request) {
  // Twilio шле application/x-www-form-urlencoded
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return new Response("<Response/>", { status: 200, headers: { "Content-Type": "text/xml" } })
  }

  const fromPhone = form.get("From") as string | null
  const toPhone = form.get("To") as string | null
  const body = (form.get("Body") as string | null) || ""
  const messageSid = (form.get("MessageSid") as string | null) || undefined
  const fromCity = form.get("FromCity") as string | null
  const fromCountry = form.get("FromCountry") as string | null

  if (!fromPhone) {
    return new Response("<Response/>", { status: 200, headers: { "Content-Type": "text/xml" } })
  }

  // TODO: Валідація Twilio signature (X-Twilio-Signature) — для production важливо
  // https://www.twilio.com/docs/usage/webhooks/webhooks-security#validating-signatures-from-twilio

  try {
    await recordIncoming({
      channel: "sms",
      identifier: { phone: fromPhone },
      name: fromPhone,  // SMS не дає імені; буде "+380…", замінять у CRM
      body,
      externalId: messageSid,
      threadKey: `sms:${fromPhone.replace(/\D/g, "")}`,
      rawMeta: { to: toPhone, from_city: fromCity, from_country: fromCountry },
    })
  } catch (e) {
    console.error("[sms] recordIncoming failed:", e)
  }

  // Twilio чекає TwiML (порожній OK)
  return new Response("<Response/>", {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  })
}

export async function GET() {
  return NextResponse.json({ ok: true, info: "Twilio SMS webhook" })
}
