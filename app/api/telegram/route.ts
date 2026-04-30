import { NextResponse } from "next/server"
import { addOperatorMessage, sessionForRelayMessage } from "@/lib/chat-store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET
const TG_CHAT = process.env.TELEGRAM_ADMIN_CHAT_ID

// Extract session id from a "Reply to bot message that contains `session: <code>...</code>`" pattern
// or from an inline marker the operator includes: "[SM:<sessionId>] reply text"
function extractSessionId(update: TelegramUpdate): { sessionId: string; text: string } | null {
  const msg = update.message
  if (!msg || typeof msg.text !== "string") return null
  const text = msg.text

  // Pattern 1: operator typed "[SM:xxx] actual reply"
  const tag = text.match(/^\s*\[SM:([^\]]+)\]\s*(.+)$/s)
  if (tag) return { sessionId: tag[1].trim(), text: tag[2].trim() }

  // Pattern 2: reply_to_message has session line
  if (msg.reply_to_message?.message_id != null) {
    const sessionId = sessionForRelayMessage(msg.reply_to_message.message_id)
    if (sessionId) return { sessionId, text: text.trim() }
    // Fallback: parse "session: abc" line from the original text
    const original = msg.reply_to_message.text || ""
    const m = original.match(/session:\s*([A-Za-z0-9\-_:.]+)/)
    if (m) return { sessionId: m[1].trim(), text: text.trim() }
  }

  return null
}

export async function POST(req: Request) {
  // Telegram sends a secret header when configured
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

  // Only accept messages from the configured admin chat
  const chatId = update.message?.chat?.id
  if (TG_CHAT && chatId != null && String(chatId) !== String(TG_CHAT)) {
    return NextResponse.json({ ok: true, ignored: "chat" })
  }

  const parsed = extractSessionId(update)
  if (!parsed) return NextResponse.json({ ok: true, ignored: "no-session" })

  await addOperatorMessage(parsed.sessionId, parsed.text)
  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json({ ok: true, info: "Telegram webhook endpoint" })
}

type TelegramUpdate = {
  update_id?: number
  message?: {
    message_id: number
    chat?: { id: number }
    text?: string
    reply_to_message?: {
      message_id: number
      text?: string
    }
  }
}
