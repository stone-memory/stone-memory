/**
 * Single source of truth for locale configuration.
 *
 * NOTE: this file replaces inline locale arrays previously in
 * `lib/i18n/context.tsx`. The Context provider continues to import its
 * `Locale` type from here so a downstream consolidation does not require
 * touching every callsite.
 */

export const locales = ["uk", "pl", "en", "de", "lt"] as const
export const defaultLocale = "uk" as const

export type Locale = (typeof locales)[number]

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

export const localeNames: Record<Locale, string> = {
  uk: "Українська",
  pl: "Polski",
  en: "English",
  de: "Deutsch",
  lt: "Lietuvių",
}

export const localeFlags: Record<Locale, string> = {
  uk: "🇺🇦",
  pl: "🇵🇱",
  en: "🇬🇧",
  de: "🇩🇪",
  lt: "🇱🇹",
}

/**
 * Hreflang country codes — ISO 639-1 + ISO 3166-1 alpha-2 where appropriate.
 * `en` stays language-only because we serve all English-speaking regions equally.
 */
export const hreflangMap: Record<Locale, string> = {
  uk: "uk-UA",
  pl: "pl-PL",
  en: "en",
  de: "de-DE",
  lt: "lt-LT",
}

/** HTML `lang` attribute. Not always identical to hreflang. */
export const htmlLangMap: Record<Locale, string> = {
  uk: "uk",
  pl: "pl",
  en: "en",
  de: "de",
  lt: "lt",
}

/** Cookie name used by middleware and Context to remember the choice. */
export const LOCALE_COOKIE = "sm-locale"
