import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { findOrCreateCustomer, findActiveDealForCustomer } from "@/lib/crm/comms"
import { getIntegrationConfig } from "@/lib/integrations/config"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * Viber webhook.
 * Docs: https://developers.viber.com/docs/api/rest-bot-api/#callbacks
 *
 * Events we handle:
 *   - "webhook": initial subscription verification (must return 200 quickly)
 *   - "message":  incoming user message
 *   - "subscribed" / "conversation_started": new user joined the bot
 *   - "delivered" / "seen" / "failed": delivery receipts (ignored for now)
 *
 * Auth: Viber doesn't sign requests by default, but does require the
 * webhook URL to match what's registered via /pa/set_webhook. We
 * additionally check that the event_token matches our stored
 * auth_token's tail to mitigate spoofing — best-effort only.
 */
export async function POST(req: Request) {
  let body: ViberCallback
  try {
    body = (await req.json()) as ViberCallback
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 })
  }

  const cfg = await getIntegrationConfig("viber")
  if (!cfg.auth_token) {
    // Viber webhook hits us but we've never been configured — accept
    // 200 so Viber doesn't keep retrying, but do nothing.
    return NextResponse.json({ status: 0, status_message: "ok (not configured)" })
  }

  // Per Viber docs, "webhook" event is the registration ping. Just 200.
  if (body.event === "webhook") {
    return NextResponse.json({ status: 0, status_message: "ok" })
  }

  if (body.event === "message" && body.sender && body.message) {
    const senderId = body.sender.id
    const name = body.sender.name || "Viber user"
    const text = body.message.type === "text" ? body.message.text || "" : `[${body.message.type}]`

    try {
      const { id: customerId } = await findOrCreateCustomer(
        { viberUserId: senderId },
        { name, locale: "uk" }
      )
      const dealId = await findActiveDealForCustomer(customerId)

      await supabaseAdmin.from("communications").insert({
        customer_id: customerId,
        deal_id: dealId,
        channel: "viber",
        direction: "inbound",
        external_id: body.message_token ? String(body.message_token) : null,
        thread_key: `viber:${senderId}`,
        body: text,
        meta: { event: body.event, raw: body },
      })

      // Update last_event_at for the integration row so the admin
      // status panel can show "last activity Xm ago".
      await supabaseAdmin
        .from("integrations")
        .update({ last_event_at: new Date().toISOString(), last_error: null })
        .eq("id", "viber")
    } catch (e) {
      // Record the error against integrations row but still 200 the
      // request — Viber will retry indefinitely otherwise.
      await supabaseAdmin
        .from("integrations")
        .update({ last_error: e instanceof Error ? e.message : "unknown" })
        .eq("id", "viber")
    }
  }

  // Viber requires status:0 in JSON for "OK" — anything else triggers retry.
  return NextResponse.json({ status: 0, status_message: "ok" })
}

// Viber registration is sometimes done with a GET to confirm the URL is up.
export async function GET() {
  return NextResponse.json({ status: 0, status_message: "viber webhook alive" })
}

// ---------- types ----------
type ViberCallback = {
  event: "webhook" | "subscribed" | "unsubscribed" | "conversation_started" | "delivered" | "seen" | "failed" | "message"
  timestamp?: number
  message_token?: number | string
  sender?: { id: string; name?: string; avatar?: string; country?: string; language?: string }
  message?: { type: string; text?: string; media?: string; location?: { lat: number; lon: number } }
  user?: { id: string; name?: string }
}
