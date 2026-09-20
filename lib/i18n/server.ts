import "server-only"
import { cache } from "react"
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config"

/**
 * Мова відвідувача для серверних компонентів розділу архітектурного каменю.
 *
 * Розділ лежить у app/l/[lang]/…, а rewrite у next.config.mjs підставляє
 * [lang] із cookie `sm-locale` ще на CDN — адреса для відвідувача лишається
 * /arkhitekturnyi-kamin/…. Так сторінки статичні для кожної мови й віддаються
 * з кешу. До 20.09.2026 мову читали через cookies(): це робило весь розділ
 * динамічним (SSR на кожен перехід, без prefetch), і навігація в ньому
 * відчутно гальмувала.
 *
 * Сховище живе в межах одного рендера (React cache). Мову виставляють layout
 * розділу і withLocale() на кожній сторінці: під час клієнтського переходу
 * Next рендерить лише сторінку, без layout.
 */
const requestStore = cache(() => ({ locale: defaultLocale as Locale }))

export function setRequestLocale(lang: string): Locale {
  const locale = isLocale(lang) ? lang : defaultLocale
  requestStore().locale = locale
  return locale
}

export async function getServerLocale(): Promise<Locale> {
  return requestStore().locale
}
