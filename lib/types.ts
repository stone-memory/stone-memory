export type Category = "memorial" | "home"
export type OrderStatus = "new" | "in_progress" | "completed"

export type StoneColor =
  | "black"
  | "grey"
  | "white"
  | "red"
  | "green"
  | "blue"
  | "brown"
  | "beige"
  | "multi"

export type StoneShape =
  | "classic"
  | "arch"
  | "heart"
  | "cross"
  | "modern"
  | "obelisk"
  | "natural"

export type StoneFinish =
  | "polished"
  | "honed"
  | "flamed"
  | "antique"
  | "natural"
  | "split"

export type StoneTone = "light" | "grey" | "dark" | "brown" | "coloured"

export type StoneMaterial =
  | "granite"
  | "marble"
  | "quartzite"
  | "gabbro"
  | "labradorite"
  | "limestone"
  | "sandstone"
  | "onyx"

export type StoneItem = {
  id: string
  category: Category
  imagePath: string
  priceFrom: number
  material?: string
  origin?: string
  nameKey?: string
  color?: StoneColor
  shape?: StoneShape
  finish?: StoneFinish
  materialType?: StoneMaterial
  gallery?: string[]
  sizeCm?: string
  weightKg?: number
  isFeatured?: boolean
}

export function toneFromColor(color?: StoneColor): StoneTone | undefined {
  if (!color) return undefined
  if (color === "white" || color === "beige") return "light"
  if (color === "grey") return "grey"
  if (color === "black") return "dark"
  if (color === "brown") return "brown"
  return "coloured" // red, blue, green, multi
}

export type OrderNote = {
  id: string
  author: string
  text: string
  createdAt: Date
}

export type Order = {
  id: string
  items: StoneItem[]
  name: string
  phone: string
  createdAt: Date
  reference: string
  status?: OrderStatus
  contacted?: boolean
  notes?: OrderNote[]
}

export type Locale = "uk" | "pl" | "en" | "de" | "lt"
export type Currency = "UAH" | "PLN" | "EUR" | "USD" | "GBP"

export const locales: Locale[] = ["en", "uk", "pl", "de", "lt"]
export const defaultLocale: Locale = "uk"

export const localeNames: Record<Locale, string> = {
  en: "English",
  uk: "Українська",
  pl: "Polski",
  de: "Deutsch",
  lt: "Lietuvių",
}

export const localeFlags: Record<Locale, string> = {
  en: "GB",
  uk: "UA",
  pl: "PL",
  de: "DE",
  lt: "LT",
}

export const localeCurrency: Record<Locale, Currency> = {
  uk: "UAH",
  pl: "PLN",
  en: "EUR",
  de: "EUR",
  lt: "EUR",
}

export const fxFromEUR: Record<Currency, number> = {
  EUR: 1,
  UAH: 45,
  PLN: 4.3,
  USD: 1.08,
  GBP: 0.85,
}

export const countryToLocale: Record<string, Locale> = {
  UA: "uk",
  PL: "pl",
  DE: "de",
  AT: "de",
  CH: "de",
  LT: "lt",
  LV: "lt",
  EE: "lt",
  GB: "en",
  US: "en",
  IE: "en",
}
