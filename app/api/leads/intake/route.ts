import { NextResponse } from "next/server"
import { timingSafeEqual } from "node:crypto"
import { createLeadOrder } from "@/lib/crm/lead-intake"
import { sanitizeAttribution } from "@/lib/attribution"
import { rateLimit, getClientIp } from "@/lib/rate-limit"

/**
 * Server-to-server приймач заявок із зовнішніх джерел.
 *
 * Розділ «Архітектурний камінь» переїхав у цей самий застосунок і пише
 * заявки напряму через lib/crm/lead-intake.ts, тож цей ендпоінт лишається
 * для зовнішніх інтеграцій і сумісності зі старими налаштуваннями.
 *
 * Пише в `orders` (видно на дашборді «Замовлення»), а далі тригер
 * orders_copy_to_deal (supabase/stilnytsi-intake-migration.sql) створює
 * клієнта й угоду в воронці з category='interior'. Нотифікацій звідси не
 * шлемо: сайт-відправник має власний Telegram-канал, а дашборд і лічильник
 * нових заявок покажуть її й так.
 *
 * Авторизація — спільний секрет у заголовку x-intake-key (env LEADS_INTAKE_KEY).
 */

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type IntakePayload = {
  name?: unknown
  phone?: unknown
  city?: unknown
  interest?: unknown
  message?: unknown
  source?: unknown
  locale?: unknown
  utm?: unknown
}

const clip = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : ""

function keyMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(req: Request) {
  const expected = process.env.LEADS_INTAKE_KEY
  if (!expected) {
    return NextResponse.json({ error: "intake not configured" }, { status: 503 })
  }
  if (!keyMatches(req.headers.get("x-intake-key"), expected)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  // Запас на server-to-server: один сайт-відправник, але без ліміту зовсім
  // не лишаємо — ключ може витекти.
  const { allowed } = rateLimit(`intake:${getClientIp(req)}`, 60, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: "too many requests" }, { status: 429 })
  }

  let body: IntakePayload
  try {
    body = (await req.json()) as IntakePayload
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

  const result = await createLeadOrder({
    name: clip(body.name, 80),
    phone: clip(body.phone, 80),
    city: clip(body.city, 80),
    interest: clip(body.interest, 120),
    message: clip(body.message, 2000),
    source: clip(body.source, 40) || "stilnytsi",
    locale: clip(body.locale, 5) || "uk",
    attribution: sanitizeAttribution(body.utm),
  })
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.error === "storage failed" ? 500 : 400 })
  }

  return NextResponse.json({ ok: true, id: result.id }, { status: 201 })
}
