import { NextResponse } from "next/server"
import { addOperatorMessage, sessionForRelayMessage } from "@/lib/chat-store"
import { recordIncoming } from "@/lib/crm/comms"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET
const TG_ADMIN_CHAT = process.env.TELEGRAM_ADMIN_CHAT_ID

type TelegramUser = {
  id: number
  is_bot?: boolean
  first_name?: string
  last_name?: string
  username?: string
  language_code?: string
}

type TelegramChat = {
  id: number
  type: "private" | "group" | "supergroup" | "channel"
  title?: string
  username?: string
  first_name?: string
}

type TelegramMessage = {
  message_id: number
  from?: TelegramUser
  chat: TelegramChat
  date: number
  text?: string
  reply_to_message?: {
    message_id: number
    text?: string
  }
  contact?: { phone_number: string; first_name?: string; last_name?: string }
}

type TelegramUpdate = {
  update_id?: number
  message?: TelegramMessage
}

/**
 * Extract sessionId з admin reply (як було).
 */
function extractSessionId(msg: TelegramMessage): { sessionId: string; text: string } | null {
  const text = msg.text
  if (!text) return null

  const tag = text.match(/^\s*\[SM:([^\]]+)\]\s*(.+)$/s)
  if (tag) return { sessionId: tag[1].trim(), text: tag[2].trim() }

  if (msg.reply_to_message?.message_id != null) {
    const sessionId = sessionForRelayMessage(msg.reply_to_message.message_id)
    if (sessionId) return { sessionId, text: text.trim() }
    const original = msg.reply_to_message.text || ""
    const m = original.match(/session:\s*([A-Za-z0-9\-_:.]+)/)
    if (m) return { sessionId: m[1].trim(), text: text.trim() }
  }
  return null
}

export async function POST(req: Request) {
  // Telegram secret token verification
  if (WEBHOOK_SECRET) {
    const header = req.headers.get("x-telegram-bot-api-secret-token")
    if (header !== WEBHOOK_SECRET) {
      return NextResponse.json({ ok: false }, { status: 401 })
    }
  }

  let update: TelegramUpdate
  try {
    update = (await req.json()) as TelegramUpdate
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const msg = update.message
  if (!msg) return NextResponse.json({ ok: true })

  const chatId = String(msg.chat.id)
  const isFromAdminChat = TG_ADMIN_CHAT && chatId === String(TG_ADMIN_CHAT)
  const isPrivateDM = msg.chat.type === "private"

  // ============================================================
  // Шлях 1: Admin відповідає у груповому чаті — relay у site chat (як було)
  // ============================================================
  if (isFromAdminChat) {
    const parsed = extractSessionId(msg)
    if (parsed) {
      await addOperatorMessage(parsed.sessionId, parsed.text)
      return NextResponse.json({ ok: true, mode: "admin-relay" })
    }
    return NextResponse.json({ ok: true, ignored: "admin-no-session" })
  }

  // ============================================================
  // Шлях 2: Клієнт пише прямо в бот — записуємо у CRM communications
  // ============================================================
  if (isPrivateDM && msg.from && !msg.from.is_bot) {
    const fromUser = msg.from
    const name = [fromUser.first_name, fromUser.last_name].filter(Boolean).join(" ") || fromUser.username || "Telegram-користувач"
    const phone = msg.contact?.phone_number  // якщо клієнт надіслав контакт
    const text = msg.text || (msg.contact ? `📞 Поділився контактом: ${msg.contact.phone_number}` : "—")

    try {
      await recordIncoming({
        channel: "telegram",
        identifier: {
          telegramUserId: String(fromUser.id),
          phone,
        },
        name,
        locale: fromUser.language_code === "uk" ? "uk" : fromUser.language_code === "pl" ? "pl" : fromUser.language_code === "de" ? "de" : fromUser.language_code === "lt" ? "lt" : "en",
        body: text,
        externalId: String(msg.message_id),
        // Key by user id (same value sendTg uses for outbound:
        // `telegram:${telegramUserId}`) so inbound+outbound thread by
        // construction, not by the chatId==userId DM coincidence.
        threadKey: `telegram:${String(fromUser.id)}`,
        rawMeta: { telegram_chat: msg.chat, telegram_from: fromUser },
      })
    } catch (e) {
      console.error("[telegram] recordIncoming failed:", e)
    }

    // Auto-reply якщо це /start
    if (text === "/start") {
      const greeting = "Вітаємо у Stone Memory! 👋\n\nЯ перешлю ваше повідомлення менеджеру і він відповість найближчим часом.\n\nЩоб ми могли зв'язатися — натисніть «📎 Поділитися контактом» нижче або просто напишіть телефон."
      await sendTelegramReply(msg.chat.id, greeting)
    }

    return NextResponse.json({ ok: true, mode: "client-dm" })
  }

  return NextResponse.json({ ok: true, ignored: "unknown-chat" })
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    info: "Telegram webhook endpoint — DM від клієнтів пишуться в CRM, відповіді admin у груповому чаті ретранслюються у site chat",
  })
}

async function sendTelegramReply(chatId: number, text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    })
  } catch {
    /* ignore */
  }
}
