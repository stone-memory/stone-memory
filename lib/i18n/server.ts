import "server-only"
import { cookies } from "next/headers"
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n/config"

/**
 * Мова відвідувача для серверних компонентів.
 *
 * Перемикач мови (LanguageProvider) пише вибір у cookie `sm-locale` разом із
 * localStorage. Сторінки, що читають цей cookie, стають динамічними (SSR на
 * кожен запит), зате віддають одразу перекладений HTML — без «стрибка» з
 * української після гідратації. Використовується в розділі архітектурного
 * каменю, де весь контент рендериться на сервері з бази.
 */
export async function getServerLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value
  return value && isLocale(value) ? value : defaultLocale
}
