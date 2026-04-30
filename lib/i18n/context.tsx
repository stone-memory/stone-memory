"use client"
import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react"
import { dictionaries, Locale, Dictionary } from "./dictionaries"
import { Currency, localeCurrency, fxFromEUR, countryToLocale } from "@/lib/types"

type LanguageContextValue = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: Dictionary
  currency: Currency
  formatPrice: (eurAmount: number) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const LS_LOCALE = "sm-locale"
const LS_GEO = "sm-geo-resolved"
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

async function countryFromIP(): Promise<Locale | null> {
  try {
    const r = await fetch("https://ipapi.co/json/", { cache: "force-cache" })
    if (!r.ok) return null
    const j = await r.json()
    const code = (j?.country_code || j?.country || "").toUpperCase()
    return countryToLocale[code] || null
  } catch {
    return null
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)

  useEffect(() => {
    const saved = typeof localStorage !== "undefined" ? (localStorage.getItem(LS_LOCALE) as Locale | null) : null
    if (saved && saved in dictionaries) {
      if (saved !== DEFAULT_LOCALE) setLocaleState(saved)
      return
    }
    const nav = localeFromNavigator()
    if (nav && nav !== DEFAULT_LOCALE) setLocaleState(nav)

    if (localStorage.getItem(LS_GEO)) return
    countryFromIP().then((geoLoc) => {
      localStorage.setItem(LS_GEO, "1")
      if (!geoLoc || localStorage.getItem(LS_LOCALE)) return
      setLocaleState(geoLoc)
    })
  }, [])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    localStorage.setItem(LS_LOCALE, l)
    if (typeof document !== "undefined") document.documentElement.lang = l
  }

  const currency = localeCurrency[locale]

  const formatPrice = useMemo(() => {
    const rate = fxFromEUR[currency]
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
      return abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    }
    const placement = currency === "EUR" || currency === "USD" || currency === "GBP" ? "before" : "after"

    return (eur: number) => {
      const converted = eur * rate
      const rounded =
        currency === "UAH" ? Math.round(converted / 10) * 10 :
        currency === "PLN" ? Math.round(converted / 5) * 5 :
        Math.round(converted / 5) * 5
      const num = formatNumber(rounded)
      return placement === "before" ? `${symbol}${num}` : `${num} ${symbol}`
    }
  }, [currency])

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: dictionaries[locale], currency, formatPrice }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useTranslation must be used within LanguageProvider")
  return ctx
}
