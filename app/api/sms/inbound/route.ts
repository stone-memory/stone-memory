import { NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "node:crypto"
import { recordIncoming } from "@/lib/crm/comms"
import { getIntegrationConfig } from "@/lib/integrations/config"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Twilio request signature: base64(HMAC-SHA1(authToken, fullUrl + sorted
// concatenated POST params)). See
// https://www.twilio.com/docs/usage/webhooks/webhooks-security
function twilioSignatureValid(
  authToken: string,
  url: string,
  params: Record<string, string>,
  header: string | null
): boolean {
  if (!header) return false
  let data = url
  for (const key of Object.keys(params).sort()) data += key + params[key]
  const expected = createHmac("sha1", authToken).update(data, "utf8").digest("base64")
  const a = Buffer.from(expected)
  const b = Buffer.from(header)
  return a.length === b.length && timingSafeEqual(a, b)
}

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

  // Validate X-Twilio-Signature — enforced only when an auth token is
  // configured (so unconfigured/dev deployments don't break). Without it
  // anyone could POST fake SMS into a customer's inbox.
  const cfg = await getIntegrationConfig("twilio_sms")
  const authToken = cfg.auth_token
  if (authToken) {
    const proto = req.headers.get("x-forwarded-proto") || "https"
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || ""
    const fullUrl = `${proto}://${host}${new URL(req.url).pathname}`
    const params: Record<string, string> = {}
    for (const [k, v] of form.entries()) params[k] = typeof v === "string" ? v : ""
    if (!twilioSignatureValid(authToken, fullUrl, params, req.headers.get("x-twilio-signature"))) {
      console.warn("[sms] rejected: invalid Twilio signature")
      return new Response("<Response/>", { status: 403, headers: { "Content-Type": "text/xml" } })
    }
  }

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
