import { NextResponse } from "next/server"
import { timingSafeEqual } from "node:crypto"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { sanitizeAttribution } from "@/lib/attribution"
import { rateLimit, getClientIp } from "@/lib/rate-limit"

/**
 * Server-to-server приймач заявок з інших сайтів бренду.
 *
 * Зараз єдиний клієнт — сайт стільниць (stilnytsi.stonememory.com.ua). Це
 * ЄДИНИЙ дозволений звʼязок між двома сайтами: жодних посилань між ними в
 * навігації чи контенті, лише цей POST з боку сервера.
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

  const name = clip(body.name, 80)
  const phone = clip(body.phone, 80)
  const city = clip(body.city, 80)
  const interest = clip(body.interest, 120)
  const message = clip(body.message, 2000)
  if (name.length < 2 || phone.length < 5) {
    return NextResponse.json({ error: "name and phone required" }, { status: 400 })
  }

  const source = clip(body.source, 40) || "stilnytsi"
  const locale = clip(body.locale, 5) || "uk"
  const attribution = sanitizeAttribution(body.utm)
  // В orders одне текстове поле, тож інтерес (тип виробу) іде першим рядком.
  const text = [interest ? `Виріб: ${interest}` : "", message].filter(Boolean).join("\n\n") || null

  const base = {
    name,
    phone,
    email: null,
    message: text,
    locale,
    source,
    status: "new",
    reference: null,
    items: null,
    stone_id: null,
  }

  let { data, error } = await supabaseAdmin
    .from("orders")
    .insert({ ...base, city: city || null, attribution })
    .select("id")
    .single()

  // 42703 = undefined_column: міграція stilnytsi-intake (city) або
  // attribution-migration ще не виконана. Лід важливіший за колонки —
  // пишемо без них, а місто дописуємо в текст, щоб не загубити.
  if (error?.code === "42703") {
    const fallbackText = [city ? `Місто: ${city}` : "", text].filter(Boolean).join("\n") || null
    ;({ data, error } = await supabaseAdmin
      .from("orders")
      .insert({ ...base, message: fallbackText })
      .select("id")
      .single())
  }

  if (error) {
    console.error("[leads/intake] insert failed:", error.message)
    return NextResponse.json({ error: "storage failed" }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: data?.id ?? null }, { status: 201 })
}
