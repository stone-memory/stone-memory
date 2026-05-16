/**
 * Форматування для адмінки. На відміну від клієнтського formatPrice, який
 * залежить від обраної локалі/валюти користувача, ці хелпери ВЖЕ ЗАВЖДИ
 * показують ціни у гривні (UAH) і дату в українській локалі — щоб у CRM
 * менеджери бачили однакові цифри незалежно від того, який лангтаг у їхньому
 * браузері.
 *
 * Курс беремо з тієї ж таблиці що й клієнт. Якщо в майбутньому додасте
 * /api/fx з ECB, поміняти потрібно тільки тут.
 */

import { fxFromEUR } from "@/lib/types"

export const ADMIN_LOCALE = "uk-UA"

/** Округлення вгору до 10 ₴ — щоб не показувати "1234,56 ₴" у списках. */
export function formatUAH(eur: number, opts?: { decimals?: boolean }): string {
  const rate = fxFromEUR.UAH
  const uah = eur * rate
  const decimals = opts?.decimals ?? false
  const rounded = decimals ? uah : Math.round(uah / 10) * 10
  const num = rounded.toLocaleString(ADMIN_LOCALE, {
    maximumFractionDigits: decimals ? 2 : 0,
    minimumFractionDigits: decimals ? 2 : 0,
  })
  return `${num} ₴`
}

/** З оригінальною ціною в EUR поряд — корисно для виставлення рахунків іноземним клієнтам. */
export function formatUAHWithEUR(eur: number): string {
  return `${formatUAH(eur)} (€${eur.toLocaleString(ADMIN_LOCALE)})`
}

/** Формат дати "06.05.2026, 14:32". */
export function formatDateTime(d: Date | string | number): string {
  return new Date(d).toLocaleString(ADMIN_LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDate(d: Date | string | number): string {
  return new Date(d).toLocaleDateString(ADMIN_LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

/** "5 хв тому" / "2 год тому" / "06.05" — для списків замовлень. */
export function formatRelative(d: Date | string | number): string {
  const t = new Date(d).getTime()
  const diff = Date.now() - t
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (minutes < 1) return "щойно"
  if (minutes < 60) return `${minutes} хв тому`
  if (hours < 24) return `${hours} год тому`
  if (days < 7) return `${days} дн тому`
  return new Date(t).toLocaleDateString(ADMIN_LOCALE, { month: "short", day: "numeric" })
}

/** Підказка під ціною: "≈ €1 200" — корисно поряд з UAH. */
export function eurHint(eur: number): string {
  return `≈ €${eur.toLocaleString(ADMIN_LOCALE)}`
}

/**
 * Ukrainian noun pluralization. Slavic languages have three plural forms:
 *   - one  (1, 21, 31, …)        → "день"
 *   - few  (2-4, 22-24, …)       → "дні"
 *   - many (0, 5-20, 25-30, …)   → "днів"
 *
 * Single source of truth — don't sprinkle this rule across components.
 *
 *   pluralUk(1, "день", "дні", "днів")    // "день"
 *   pluralUk(2, "день", "дні", "днів")    // "дні"
 *   pluralUk(5, "день", "дні", "днів")    // "днів"
 *   pluralUk(21, "день", "дні", "днів")   // "день"
 */
export function pluralUk(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(Math.round(n))
  const mod10 = abs % 10
  const mod100 = abs % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

/** Convenience: returns "1 день" / "3 дні" / "7 днів". */
export function pluralizeDays(n: number): string {
  return `${n} ${pluralUk(n, "день", "дні", "днів")}`
}
