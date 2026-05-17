import { NextResponse } from "next/server"
import { requireSuperAdmin } from "@/lib/auth/permissions"
import { getIntegrationConfig, type IntegrationId } from "@/lib/integrations/config"

export const dynamic = "force-dynamic"

/**
 * Returns per-channel status — `configured` reflects the effective
 * config (DB-stored values take precedence over env). Secrets are
 * never returned in plaintext, only set/unset booleans.
 *
 * Access: super_admin only (Fix 6 + integrations storage migration).
 */
export async function GET(req: Request) {
  const unauth = await requireSuperAdmin(req)
  if (unauth instanceof NextResponse) return unauth

  // Resolve effective config for every channel once — cheap (in-process
  // 5s cache + tiny DB queries).
  const [tg, wa, ig, vb, em, sm] = await Promise.all([
    getIntegrationConfig("telegram"),
    getIntegrationConfig("whatsapp"),
    getIntegrationConfig("instagram"),
    getIntegrationConfig("viber"),
    getIntegrationConfig("email_inbound"),
    getIntegrationConfig("twilio_sms"),
  ])

  const setFlag = (cfg: Record<string, string>, key: string) =>
    typeof cfg[key] === "string" && cfg[key].length > 0

  const envVarsFor = (id: IntegrationId, cfg: Record<string, string>): { key: string; set: boolean }[] => {
    const map: Record<IntegrationId, string[]> = {
      telegram: ["bot_token", "admin_chat_id", "webhook_secret"],
      whatsapp: ["token", "phone_number_id", "verify_token"],
      instagram: ["page_access_token", "page_id", "verify_token"],
      viber: ["auth_token", "sender_name"],
      email_inbound: ["resend_api_key", "email_from", "inbound_secret"],
      email_mailbox: ["address", "app_password"],
      twilio_sms: ["account_sid", "auth_token", "from_number"],
    }
    return map[id].map((k) => ({ key: k, set: setFlag(cfg, k) }))
  }

  return NextResponse.json({
    integrations: [
      {
        id: "site_chat",
        name: "Сайт-чат",
        configured: true,
        webhookUrl: null,
        envVars: [],
        canSend: true,
        canReceive: true,
      },
      {
        id: "telegram",
        name: "Telegram",
        configured: setFlag(tg, "bot_token") && setFlag(tg, "admin_chat_id"),
        webhookUrl: "/api/telegram",
        envVars: envVarsFor("telegram", tg),
        canSend: setFlag(tg, "bot_token"),
        canReceive: setFlag(tg, "bot_token") && setFlag(tg, "webhook_secret"),
      },
      {
        id: "whatsapp",
        name: "WhatsApp",
        configured: setFlag(wa, "token") && setFlag(wa, "phone_number_id"),
        webhookUrl: "/api/whatsapp/webhook",
        envVars: envVarsFor("whatsapp", wa),
        canSend: setFlag(wa, "token") && setFlag(wa, "phone_number_id"),
        canReceive: setFlag(wa, "verify_token"),
      },
      {
        id: "instagram",
        name: "Instagram",
        configured: setFlag(ig, "page_access_token") && setFlag(ig, "page_id"),
        webhookUrl: "/api/instagram/webhook",
        envVars: envVarsFor("instagram", ig),
        canSend: setFlag(ig, "page_access_token") && setFlag(ig, "page_id"),
        canReceive: setFlag(ig, "verify_token"),
      },
      {
        id: "viber",
        name: "Viber",
        configured: setFlag(vb, "auth_token"),
        webhookUrl: "/api/viber/webhook",
        envVars: envVarsFor("viber", vb),
        canSend: setFlag(vb, "auth_token"),
        // Viber webhook is the same auth_token — once it's set + we
        // called /pa/set_webhook once, both directions work.
        canReceive: setFlag(vb, "auth_token"),
      },
      {
        id: "email",
        name: "Email",
        configured: setFlag(em, "resend_api_key"),
        webhookUrl: "/api/email/inbound",
        envVars: envVarsFor("email_inbound", em),
        canSend: setFlag(em, "resend_api_key"),
        // Inbound webhook itself always works — Mailgun/Postmark posts in
        canReceive: true,
      },
      {
        id: "sms",
        name: "SMS (Twilio)",
        configured: setFlag(sm, "account_sid") && setFlag(sm, "auth_token") && setFlag(sm, "from_number"),
        webhookUrl: "/api/sms/inbound",
        envVars: envVarsFor("twilio_sms", sm),
        canSend: setFlag(sm, "account_sid") && setFlag(sm, "auth_token") && setFlag(sm, "from_number"),
        canReceive: setFlag(sm, "account_sid"),
      },
    ],
  })
}
