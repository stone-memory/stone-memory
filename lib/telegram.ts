import "server-only"

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID

export const telegramConfigured = Boolean(TOKEN && CHAT_ID)

type SendArgs = {
  text: string
  parseMode?: "HTML" | "MarkdownV2"
  disableLinkPreview?: boolean
  chatId?: string | number
}

// Sends a message to the admin chat (or a custom chatId). Non-blocking: logs
// errors but never throws so the caller flow (e.g. order submission) is not
// interrupted by Telegram outages.
export async function sendTelegram(args: SendArgs): Promise<{ ok: boolean; error?: string }> {
  if (!TOKEN) {
    return { ok: false, error: "TELEGRAM_BOT_TOKEN not set" }
  }
  const chatId = args.chatId ?? CHAT_ID
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
