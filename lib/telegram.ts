import "server-only"
import { getIntegrationConfig, getIntegrationConfigSync } from "@/lib/integrations/config"

/**
 * `telegramConfigured` answers "is at least env-wired?" — used by
 * call sites that want a sync boolean (e.g. on import). For the
 * authoritative answer including DB-stored tokens, prefer
 * `await isTelegramReady()` below.
 */
export const telegramConfigured = (() => {
  const c = getIntegrationConfigSync("telegram")
  return Boolean(c.bot_token && c.admin_chat_id)
})()

export async function isTelegramReady(): Promise<boolean> {
  const c = await getIntegrationConfig("telegram")
  return Boolean(c.bot_token && c.admin_chat_id)
}

type SendArgs = {
  text: string
  parseMode?: "HTML" | "MarkdownV2"
  disableLinkPreview?: boolean
  chatId?: string | number
}

// Sends a message to the admin chat (or a custom chatId). Non-blocking:
// logs errors but never throws so the caller flow (e.g. order submission)
// isn't interrupted by Telegram outages.
//
// Reads config via getIntegrationConfig — DB-stored tokens take
// precedence over env vars, so super_admin can rotate credentials
// through /admin/integrations without redeploying.
export async function sendTelegram(args: SendArgs): Promise<{ ok: boolean; error?: string }> {
  const cfg = await getIntegrationConfig("telegram")
  const TOKEN = cfg.bot_token
  if (!TOKEN) {
    return { ok: false, error: "TELEGRAM_BOT_TOKEN not set" }
  }
  const chatId = args.chatId ?? cfg.admin_chat_id
  if (!chatId) {
    return { ok: false, error: "TELEGRAM_ADMIN_CHAT_ID not set" }
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: args.text,
        parse_mode: args.parseMode ?? "HTML",
        disable_web_page_preview: args.disableLinkPreview ?? true,
      }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      const desc = typeof data?.description === "string" ? data.description : `status ${res.status}`
      console.error("[telegram] send failed:", desc)
      return { ok: false, error: desc }
    }
    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "network error"
    console.error("[telegram] send error:", msg)
    return { ok: false, error: msg }
  }
}

// Escapes HTML for Telegram's HTML parse mode.
export function tgEscape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}
