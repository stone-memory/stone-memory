"use client"
import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react"
import { dictionaries, Locale, Dictionary } from "./dictionaries"
import { Currency, localeCurrency, fxFromUAH } from "@/lib/types"

type LanguageContextValue = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: Dictionary
  currency: Currency
  currencyRate: number
  formatPrice: (uahAmount: number) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const LS_LOCALE = "sm-locale"
const DEFAULT_LOCALE: Locale = "uk"

function localeFromNavigator(): Locale | null {
  if (typeof navigator === "undefined") return null
  const langs = [navigator.language, ...(navigator.languages || [])].filter(Boolean)
  for (const raw of langs) {
    const lang = raw.toLowerCase().slice(0, 2)
    if (lang === "uk") return "uk"
    if (lang === "pl") return "pl"
    if (lang === "de") return "de"
    if (lang === "lt") return "lt"
    if (lang === "en") return "en"
  }
  return null
}

/**
 * Locale detection is navigator-only by design.
 *
 * There used to be a countryFromIP() lookup against ipapi.co here. It was dead
 * weight twice over: the CSP blocked the request outright for as long as it
 * existed, and once unblocked the free quota answered
 * `429 {"reason": "RateLimited"}` on every call. It bought no accuracy over
 * navigator.language — a visitor's browser language is normally their country's
 * language — while costing a round-trip, a third-party IP disclosure and a
 * dependency that fails silently.
 *
 * The server-side alternative (Vercel's x-vercel-ip-country) is not free
 * either: reading headers() in the root layout would opt every page out of
 * static generation. Revisit with i18n Phase 3, which routes by path anyway.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [liveRates, setLiveRates] = useState<Record<string, number>>({})

  useEffect(() => {
    const saved = typeof localStorage !== "undefined" ? (localStorage.getItem(LS_LOCALE) as Locale | null) : null
    if (saved && saved in dictionaries) {
      if (saved !== DEFAULT_LOCALE) setLocaleState(saved)
      return
    }
    const nav = localeFromNavigator()
    if (nav && nav !== DEFAULT_LOCALE) setLocaleState(nav)
  }, [])

  useEffect(() => {
    fetch("/api/fx-rates")
      .then((r) => r.json())
      .then((data: Record<string, number>) => setLiveRates(data))
      .catch(() => {})
  }, [])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    localStorage.setItem(LS_LOCALE, l)
    if (typeof document !== "undefined") document.documentElement.lang = l
  }

  const currency = localeCurrency[locale]
  // UAH per 1 unit of locale currency. Live rate preferred; fallback to static.
  const currencyRate = liveRates[currency] ?? fxFromUAH[currency]

  const formatPrice = useMemo(() => {
    const rate = currencyRate
    // Deterministic formatter — avoids Intl.NumberFormat drift between Node (SSR)
    // and browser ICU (e.g. UAH shows "₴" on server vs "грн" on client).
    const currencySymbol: Record<Currency, string> = {
      EUR: "€",
      UAH: "₴",
      PLN: "zł",
      USD: "$",
      GBP: "£",
    }
    const symbol = currencySymbol[currency] ?? currency
    const formatNumber = (n: number) => {
      const abs = Math.abs(Math.round(n))
      // Group thousands with a non-breaking space, consistent everywhere.
      return abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    }
    const placement = currency === "EUR" || currency === "USD" || currency === "GBP" ? "before" : "after"

    return (uah: number) => {
      // Prices are stored in UAH; divide by rate to get target currency amount.
      const converted = currency === "UAH" ? uah : uah / rate
      const rounded =
        currency === "UAH" ? Math.round(converted / 10) * 10 :
        currency === "PLN" ? Math.round(converted / 5) * 5 :
        Math.round(converted / 5) * 5
      const num = formatNumber(rounded)
      return placement === "before" ? `${symbol}${num}` : `${num} ${symbol}`
    }
  }, [currency, liveRates])

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: dictionaries[locale], currency, currencyRate, formatPrice }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useTranslation must be used within LanguageProvider")
  return ctx
}
