import "server-only"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { Attribution } from "@/lib/attribution"

/**
 * Запис заявки в `orders` — спільний шлях для всіх джерел.
 *
 * Використовують двоє: форма розділу «Архітектурний камінь» (/api/lead) і
 * зовнішній приймач /api/leads/intake, що лишився для сумісності. Далі
 * тригер orders_copy_to_deal створює клієнта й угоду у воронці, а лічильник
 * нових заявок і дашборд показують її без окремих сповіщень.
 */
export type LeadInput = {
  name: string
  phone: string
  email?: string | null
  city?: string
  interest?: string
  message?: string
  source?: string
  locale?: string
  attribution?: Attribution | null
}

export type LeadResult = { ok: true; id: string | null } | { ok: false; error: string }

export async function createLeadOrder(input: LeadInput): Promise<LeadResult> {
  const name = input.name.trim().slice(0, 80)
  const phone = input.phone.trim().slice(0, 80)
  if (name.length < 2 || phone.length < 5) return { ok: false, error: "name and phone required" }

  const city = (input.city ?? "").trim().slice(0, 80)
  const interest = (input.interest ?? "").trim().slice(0, 120)
  const message = (input.message ?? "").trim().slice(0, 2000)
  // В orders одне текстове поле, тож інтерес (тип виробу) іде першим рядком.
  const text = [interest ? `Виріб: ${interest}` : "", message].filter(Boolean).join("\n\n") || null

  const base = {
    name,
    phone,
    email: (input.email ?? "").trim().slice(0, 120) || null,
    message: text,
    locale: (input.locale ?? "uk").slice(0, 5),
    source: (input.source ?? "stilnytsi").slice(0, 40),
    status: "new",
    reference: null,
    items: null,
    stone_id: null,
  }

  let { data, error } = await supabaseAdmin
    .from("orders")
    .insert({ ...base, city: city || null, attribution: input.attribution ?? null })
    .select("id")
    .single()

  // 42703 = undefined_column: міграція з колонками city/attribution ще не
  // виконана. Лід важливіший за колонки — пишемо без них, а місто дописуємо
  // в текст, щоб не загубити.
  if (error?.code === "42703") {
    const fallbackText = [city ? `Місто: ${city}` : "", text].filter(Boolean).join("\n") || null
    ;({ data, error } = await supabaseAdmin
      .from("orders")
      .insert({ ...base, message: fallbackText })
      .select("id")
      .single())
  }

  if (error) {
    console.error("[lead-intake] insert failed:", error.message)
    return { ok: false, error: "storage failed" }
  }
  return { ok: true, id: data?.id ?? null }
}
