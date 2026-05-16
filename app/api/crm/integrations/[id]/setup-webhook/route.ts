import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireSuperAdmin } from "@/lib/auth/permissions"
import { getIntegrationConfig, type IntegrationId } from "@/lib/integrations/config"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type Ctx = { params: Promise<{ id: string }> }

/**
 * POST /api/crm/integrations/[id]/setup-webhook
 *
 * One-click webhook registration for channels whose APIs support it:
 *   - Telegram  → POST /setWebhook with our URL + secret
 *   - Viber     → POST /pa/set_webhook with our URL
 *
 * Saves the admin from the manual curl ritual after entering tokens.
 * Channels whose webhook is registered through a vendor dashboard
 * (WhatsApp, Instagram, Twilio) return 400 with a hint to do it in the
 * vendor UI instead.
 *
 * Body: { baseUrl?: string } — defaults to the request origin.
 * super_admin only.
 */
export async function POST(req: Request, ctx: Ctx) {
  const user = await requireSuperAdmin(req)
  if (user instanceof NextResponse) return user

  const { id } = await ctx.params
  const body = (await req.json().catch(() => ({}))) as { baseUrl?: string }

  // Resolve our public origin. Body override wins (admin can paste
  // production URL when testing from localhost). Falls back to request
  // origin which works for production deploys.
  const origin = body.baseUrl?.trim() || new URL(req.url).origin
  if (!/^https:\/\//.test(origin)) {
    return NextResponse.json(
      { ok: false, error: "Webhook URL must start with https:// — Viber/Telegram refuse insecure URLs" },
      { status: 422 }
    )
  }

  const cfg = await getIntegrationConfig(id as IntegrationId)

  try {
    if (id === "telegram") {
      if (!cfg.bot_token) {
        return NextResponse.json({ ok: false, error: "Спочатку збережи bot_token" }, { status: 412 })
      }
      const webhookUrl = `${origin}/api/telegram`
      const params = new URLSearchParams({ url: webhookUrl })
      if (cfg.webhook_secret) params.set("secret_token", cfg.webhook_secret)
      const r = await fetch(`https://api.telegram.org/bot${cfg.bot_token}/setWebhook?${params}`, { method: "POST" })
      const j = await r.json().catch(() => ({}))
      if (!j.ok) {
        return NextResponse.json({ ok: false, error: j.description || `HTTP ${r.status}` }, { status: 500 })
      }
      await touchIntegration("telegram")
      return NextResponse.json({ ok: true, webhook: webhookUrl, info: j.description })
    }

    if (id === "viber") {
      if (!cfg.auth_token) {
        return NextResponse.json({ ok: false, error: "Спочатку збережи auth_token" }, { status: 412 })
      }
      const webhookUrl = `${origin}/api/viber/webhook`
      const r = await fetch("https://chatapi.viber.com/pa/set_webhook", {
        method: "POST",
        headers: { "X-Viber-Auth-Token": cfg.auth_token, "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          event_types: ["delivered", "seen", "failed", "subscribed", "unsubscribed", "conversation_started", "message"],
          send_name: true,
          send_photo: true,
        }),
      })
      const j = await r.json().catch(() => ({ status: -1 }))
      if (j.status !== 0) {
        return NextResponse.json({ ok: false, error: j.status_message || `status ${j.status}` }, { status: 500 })
      }
      await touchIntegration("viber")
      return NextResponse.json({ ok: true, webhook: webhookUrl, info: j.event_types })
    }

    // Channels whose webhooks must be registered through vendor dashboards.
    if (id === "whatsapp" || id === "instagram") {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Цей канал реєструє webhook через Meta App Dashboard (Webhooks → Add subscription). Скопіюй URL і verify_token у себе у Meta-консолі.",
          webhook: `${origin}/api/${id === "whatsapp" ? "whatsapp" : "instagram"}/webhook`,
          manual: true,
        },
        { status: 400 }
      )
    }
    if (id === "twilio_sms") {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Twilio webhook задається в Console: Phone Numbers → твій номер → Messaging → A message comes in → POST → " +
            `${origin}/api/sms/inbound`,
          webhook: `${origin}/api/sms/inbound`,
          manual: true,
        },
        { status: 400 }
      )
    }
    if (id === "email_inbound") {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Inbound email налаштовується у поштовому провайдері (Cloudflare Email Routing → Worker, Mailgun routes, Postmark inbound). POST на " +
            `${origin}/api/email/inbound`,
          webhook: `${origin}/api/email/inbound`,
          manual: true,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({ ok: false, error: "unknown_integration" }, { status: 404 })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "setup_failed" },
      { status: 500 }
    )
  }
}

async function touchIntegration(id: IntegrationId) {
  await supabaseAdmin
    .from("integrations")
    .update({ last_event_at: new Date().toISOString(), last_error: null })
    .eq("id", id)
}
