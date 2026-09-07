import type { Attribution } from "@/lib/attribution"

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
  /**
   * Catalogue number shown to customers ("001") and used in the product URL.
   *
   * Split out from `name`, which used to hold both. Once names became real
   * words the two could no longer share a field: the URL needs a stable,
   * URL-safe token, while the name is free text an admin may re-edit at will.
   */
  code?: string
  /** Display name ("Ангел Скорботи"). Falls back to the code when empty. */
  name?: string
  /**
   * URL segment ("anhel-skorboty"). Generated once from the name and then
   * frozen: renaming a product in the admin must not silently move its page.
   * Falls back to `code` while empty.
   */
  slug?: string
  /**
   * Попередня адреса, якщо товар уже переїжджав ("anhel-skorboty").
   *
   * Заповнюється при кожній зміні `slug` і накопичується списком, бо товар
   * може переїжджати не один раз, а кожна з попередніх адрес мусить
   * лишатись робочою. `findStoneByCode`
   * шукає і за нею, тож старе посилання не падає в 404 — сторінка знаходить
   * товар і віддає 301 на його нинішню адресу.
   */
  legacySlug?: string | string[]
  category: Category
  imagePath: string
  priceFrom?: number
  material?: string
  origin?: string
  nameKey?: string
  // Known keys keep autocomplete; `(string & {})` lets admins store custom
  // values added in the product form. Always render via the *Label()
  // resolvers in lib/i18n/filters.ts (they fall back to the raw value).
  color?: StoneColor | (string & {})
  shape?: StoneShape | (string & {})
  finish?: StoneFinish | (string & {})
  materialType?: StoneMaterial | (string & {})
  /**
   * Контрастний камінь на двоколірних роботах: чорна стела на червоній основі
   * і подібне — таких у каталозі половина.
   *
   * Навмисно ОКРЕМЕ поле, а не мікс усередині `materialType`: той лишається
   * канонічним, бо на нього спираються фасет «гранітні» (точне порівняння
   * з "granite") і дефолт селектора каменю. Значення `"Габро + Капустинський"`
   * зламало б обидва.
   *
   * Порожнє — нічого не рендериться, як і `sizeCm`. Тому заповнювати можна
   * поступово, лише там, де другий камінь на фото очевидний.
   */
  accentMaterial?: StoneMaterial | (string & {})
  gallery?: string[]
  /**
   * Камінь, який клієнт обрав на сторінці товару, і перерахована під нього ціна.
   *
   * Ставляться ТІЛЬКИ на позицію замовлення, ніколи на рядок каталогу: у базі
   * лишається камінь із фотографії, а вибір клієнта живе в заявці. Порожні —
   * значить клієнт погодився з дефолтом, тобто з тим, що на знімку.
   */
  selectedMaterial?: string
  selectedPrice?: number
  sizeCm?: string
  weightKg?: number
  isFeatured?: boolean
  // Manual per-locale labels for CUSTOM option values (admin-entered).
  // Keyed by field; each maps locale → label. Missing locale falls back
  // to the raw stored value. Canonical values ignore this (use the maps).
  i18n?: {
    materialType?: Partial<Record<Locale, string>>
    color?: Partial<Record<Locale, string>>
    shape?: Partial<Record<Locale, string>>
    finish?: Partial<Record<Locale, string>>
  }
}

export function toneFromColor(color?: StoneColor | (string & {})): StoneTone | undefined {
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
  /** First-touch campaign tags; null for direct traffic. See lib/attribution.ts. */
  attribution?: Attribution | null
  /** Звідки заявка: 'stilnytsi' = сайт стільниць; null/'site' = сайт памʼятників. */
  source?: string | null
  city?: string | null
  /** Текст запиту клієнта; у заявок зі стільниць першим рядком іде «Виріб: …». */
  message?: string | null
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

// UAH per 1 unit of each currency (static fallback).
// Live rates are fetched from /api/fx-rates (NBU) and update daily.
export const fxFromUAH: Record<Currency, number> = {
  UAH: 1,
  EUR: 45,
  PLN: 10.5,
  USD: 41.7,
  GBP: 53,
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
