import "server-only"
import { supabaseAdmin } from "@/lib/supabase/admin"

/**
 * Per-channel integration config. Two-tier:
 *   1. Supabase `integrations` row (set via /admin/integrations UI by
 *      the owner) — preferred.
 *   2. Process env var fallback — for legacy deployments and bootstrap
 *      (before super_admin even sets foot in the UI).
 *
 * `getIntegrationConfig` merges them with DB taking precedence per key.
 * All channel runtime code (lib/telegram.ts, lib/crm/send.ts, webhook
 * handlers) should call this helper instead of reading process.env
 * directly so the same config surfaces whether it was set via Vercel
 * env or the in-app UI.
 *
 * Result is cached per request for ~5s to avoid hammering the DB on
 * hot send-paths. Cache is process-local and bounded to a tiny TTL —
 * acceptable lag for credential changes.
 */

export type IntegrationId =
  | "telegram"
  | "whatsapp"
  | "instagram"
  | "viber"
  | "email_inbound"
  | "email_mailbox"
  | "twilio_sms"

/** Canonical key → env var name. Keys mirror what the UI form uses. */
const ENV_MAP: Record<IntegrationId, Record<string, string>> = {
  telegram: {
    bot_token: "TELEGRAM_BOT_TOKEN",
    admin_chat_id: "TELEGRAM_ADMIN_CHAT_ID",
    webhook_secret: "TELEGRAM_WEBHOOK_SECRET",
  },
  whatsapp: {
    token: "WHATSAPP_TOKEN",
    phone_number_id: "WHATSAPP_PHONE_NUMBER_ID",
    verify_token: "WHATSAPP_VERIFY_TOKEN",
  },
  instagram: {
    page_access_token: "INSTAGRAM_PAGE_ACCESS_TOKEN",
    page_id: "INSTAGRAM_PAGE_ID",
    verify_token: "INSTAGRAM_VERIFY_TOKEN",
  },
  viber: {
    auth_token: "VIBER_AUTH_TOKEN",
    sender_name: "VIBER_SENDER_NAME",
    sender_avatar: "VIBER_SENDER_AVATAR",
  },
  email_inbound: {
    resend_api_key: "RESEND_API_KEY",
    email_from: "EMAIL_FROM",
    email_from_name: "EMAIL_FROM_NAME",
    email_reply_to: "EMAIL_REPLY_TO",
    inbound_secret: "INBOUND_EMAIL_SECRET",
  },
  twilio_sms: {
    account_sid: "TWILIO_ACCOUNT_SID",
    auth_token: "TWILIO_AUTH_TOKEN",
    from_number: "TWILIO_FROM_NUMBER",
  },
  // Two-way conversational email via the business mailbox itself
  // (Gmail/Workspace): IMAP poll for inbound + SMTP for replies/new.
  // Defaults target Gmail; override host/port for other providers.
  email_mailbox: {
    address: "EMAIL_MAILBOX_ADDRESS",
    app_password: "EMAIL_MAILBOX_APP_PASSWORD",
    imap_host: "EMAIL_IMAP_HOST",
    imap_port: "EMAIL_IMAP_PORT",
    // Gmail label to poll (label = IMAP folder). Set a Gmail filter to
    // apply this label to order/customer mail; poller reads ONLY this
    // folder so newsletters/notifications never enter. Default INBOX.
    imap_folder: "EMAIL_IMAP_FOLDER",
    smtp_host: "EMAIL_SMTP_HOST",
    smtp_port: "EMAIL_SMTP_PORT",
    // Business domain used to filter forwarded mail. Only emails where
    // To: ends with this domain are imported into CRM. Set to e.g.
    // "stonememory.com.ua" so personal Gmail messages are ignored.
    inbound_domain: "EMAIL_INBOUND_DOMAIN",
  },
}

const CACHE = new Map<IntegrationId, { value: Record<string, string>; expires: number }>()
const TTL_MS = 5000

function fromEnv(id: IntegrationId): Record<string, string> {
  const map = ENV_MAP[id]
  const out: Record<string, string> = {}
  for (const [key, envKey] of Object.entries(map)) {
    const v = process.env[envKey]
    if (v) out[key] = v
  }
  return out
}

async function fromDb(id: IntegrationId): Promise<Record<string, string>> {
  const { data, error } = await supabaseAdmin
    .from("integrations")
    .select("config, enabled")
    .eq("id", id)
    .maybeSingle()
  if (error || !data) return {}
  // Treat enabled=false the same as "nothing in DB" — UI saved a draft
  // but explicitly turned the channel off, so we fall through to env
  // (admins who want to disable should clear the value, not toggle).
  if (data.enabled === false) return {}
  const cfg = (data.config || {}) as Record<string, unknown>
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(cfg)) {
    if (typeof v === "string" && v.length > 0) out[k] = v
  }
  return out
}

/**
 * Resolve the effective config for a channel: DB overrides env per key.
 * Caches the result for TTL_MS to amortize DB hits across batches of
 * messages within a single webhook invocation.
 */
export async function getIntegrationConfig(
  id: IntegrationId
): Promise<Record<string, string>> {
  const cached = CACHE.get(id)
  if (cached && cached.expires > Date.now()) return cached.value

  const env = fromEnv(id)
  const db = await fromDb(id)
  const merged: Record<string, string> = { ...env, ...db }
  CACHE.set(id, { value: merged, expires: Date.now() + TTL_MS })
  return merged
}

/** Invalidate the in-process cache — call after admin saves new tokens. */
export function invalidateIntegrationConfig(id?: IntegrationId): void {
  if (id) CACHE.delete(id)
  else CACHE.clear()
}

/**
 * Synchronous fallback path for code that runs in tight loops or
 * non-async contexts. Reads env only — DB lookup must use the async
 * version. Most runtime code should prefer getIntegrationConfig().
 */
export function getIntegrationConfigSync(id: IntegrationId): Record<string, string> {
  return fromEnv(id)
}

/** Helper for UI: returns the list of canonical keys for a channel. */
export function getKeysFor(id: IntegrationId): string[] {
  return Object.keys(ENV_MAP[id])
}
