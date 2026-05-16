import { NextResponse } from "next/server"
import { addOperatorMessage } from "@/lib/chat-store"
import { rateLimit, getClientIp } from "@/lib/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Endpoint щоб chat-widget міг зберігати власні bot-репліки в DB.
 *
 * Без auth (бо викликається з анонімного віджета), але:
 *   - rate-limit 60 повідомлень за хв per IP
 *   - тіло обмежено 4000 символів
 *   - sessionId обовʼязковий
 *
 * Записує як from_role='operator' (з точки зору клієнта це й є оператор;
 * меню чату /admin/chat показуватиме все коректно).
 */
export async function POST(req: Request) {
  const ip = getClientIp(req)
  const rl = rateLimit(`chatbot:${ip}`, 60, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    )
  }

  try {
    const body = (await req.json()) as { sessionId?: string; text?: string }
    const { sessionId, text } = body
    if (!sessionId || !text) {
      return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 })
    }
    if (text.length > 4000) {
      return NextResponse.json({ ok: false, error: "too_long" }, { status: 413 })
    }

    const msg = await addOperatorMessage(sessionId, text)
    if (!msg) return NextResponse.json({ ok: false }, { status: 500 })

    return NextResponse.json({ ok: true, message: msg })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
