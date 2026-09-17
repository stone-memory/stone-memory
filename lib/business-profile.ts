/**
 * Профіль бізнесу: єдине джерело контактів сайту.
 *
 * Дані живуть у Supabase (`site_content`, ключ `business_profile`) і
 * редагуються в адмінці «Бізнес-профіль». Усе, що показує телефон, пошту,
 * адресу, графік чи соцмережі — футер, «Про нас», «Контакти», картки товарів,
 * JSON-LD, PDF документів, листи — бере значення звідси, а не з коду.
 *
 * DEFAULT_PROFILE — лише запасний варіант, коли база недоступна або в рядку
 * бракує поля. Модуль без "use client", щоб його могли читати серверні
 * компоненти й API-маршрути; клієнтський стор (lib/store/business-profile.ts)
 * імпортує типи й дефолти звідси.
 */
import { CONTACT } from "@/lib/site-facts"

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"

export type DayHours = {
  open: string
  close: string
  closed: boolean
}

export type Holiday = {
  id: string
  date: string
  label: string
}

export type BusinessProfile = {
  legalName: string
  displayName: string
  email: string
  phone: string
  address: string
  city: string
  region: string
  postalCode: string
  country: string
  vatId: string
  hours: Record<Weekday, DayHours>
  holidays: Holiday[]
  serviceAreas: string[]
  currency: string
  bankingIban?: string
  instagram?: string
  facebook?: string
}

export const BUSINESS_PROFILE_KEY = "business_profile"
/** Тег unstable_cache для серверного читання; скидається при збереженні в адмінці. */
export const BUSINESS_PROFILE_TAG = "business-profile"

export const WEEKDAYS: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]

const DEFAULT_HOURS: Record<Weekday, DayHours> = {
  mon: { open: "09:00", close: "19:00", closed: false },
  tue: { open: "09:00", close: "19:00", closed: false },
  wed: { open: "09:00", close: "19:00", closed: false },
  thu: { open: "09:00", close: "19:00", closed: false },
  fri: { open: "09:00", close: "19:00", closed: false },
  sat: { open: "10:00", close: "16:00", closed: false },
  sun: { open: "00:00", close: "00:00", closed: true },
}

export const DEFAULT_PROFILE: BusinessProfile = {
  legalName: "ФОП Stone Memory",
  displayName: "Stone Memory",
  email: CONTACT.email,
  phone: CONTACT.phoneDisplay,
  address: "провулок Білий, 20",
  city: "Костопіль",
  region: "Рівненська область",
  postalCode: "35000",
  country: "Україна",
  vatId: "",
  hours: DEFAULT_HOURS,
  holidays: [],
  serviceAreas: ["UA", "PL", "DE", "LT", "EU"],
  currency: "EUR",
  bankingIban: "",
  instagram: CONTACT.instagram,
  facebook: CONTACT.facebook,
}

/** Накладає збережене з бази на дефолти, щоб жодне поле не було undefined. */
export function mergeProfile(raw: unknown): BusinessProfile {
  if (!raw || typeof raw !== "object") return DEFAULT_PROFILE
  const r = raw as Partial<BusinessProfile>
  return {
    ...DEFAULT_PROFILE,
    ...r,
    hours: { ...DEFAULT_HOURS, ...(r.hours || {}) },
    holidays: Array.isArray(r.holidays) ? r.holidays : [],
    serviceAreas: Array.isArray(r.serviceAreas) ? r.serviceAreas : DEFAULT_PROFILE.serviceAreas,
  }
}

/** «+380688080222» — для tel:, JSON-LD і месенджерів. */
export function phoneE164(profile: Pick<BusinessProfile, "phone">): string {
  const digits = profile.phone.replace(/\D/g, "")
  return digits ? `+${digits}` : ""
}

export const telHref = (profile: Pick<BusinessProfile, "phone">) => `tel:${phoneE164(profile)}`
export const viberHref = (profile: Pick<BusinessProfile, "phone">) =>
  `viber://chat?number=${encodeURIComponent(phoneE164(profile))}`
export const telegramHref = (profile: Pick<BusinessProfile, "phone">) => `https://t.me/${phoneE164(profile)}`

/** «провулок Білий, 20, Костопіль, Рівненська область, 35000». */
export function fullAddress(profile: BusinessProfile): string {
  return [profile.address, profile.city, profile.region, profile.postalCode].filter(Boolean).join(", ")
}

/** «провулок Білий, 20, Костопіль» — для футера й підписів мап. */
export function shortAddress(profile: BusinessProfile): string {
  return [profile.address, profile.city].filter(Boolean).join(", ")
}

export const DAY_LABELS: Record<string, Record<Weekday, string>> = {
  uk: { mon: "Пн", tue: "Вт", wed: "Ср", thu: "Чт", fri: "Пт", sat: "Сб", sun: "Нд" },
  pl: { mon: "Pn", tue: "Wt", wed: "Śr", thu: "Cz", fri: "Pt", sat: "Sb", sun: "Nd" },
  en: { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" },
  de: { mon: "Mo", tue: "Di", wed: "Mi", thu: "Do", fri: "Fr", sat: "Sa", sun: "So" },
  lt: { mon: "Pr", tue: "An", wed: "Tr", thu: "Kt", fri: "Pn", sat: "Š", sun: "S" },
}

const fmtTime = (t: string) => t.replace(/^0/, "")

type HoursGroup = { first: Weekday; last: Weekday; open: string; close: string }

/** Групує поспіль дні з однаковим графіком: Пн–Пт 9:00–19:00, Сб 10:00–16:00. */
export function hoursGroups(profile: BusinessProfile): HoursGroup[] {
  const groups: HoursGroup[] = []
  for (const day of WEEKDAYS) {
    const h = profile.hours[day]
    if (!h || h.closed) continue
    const prev = groups[groups.length - 1]
    if (prev && prev.open === h.open && prev.close === h.close && WEEKDAYS.indexOf(prev.last) === WEEKDAYS.indexOf(day) - 1) {
      prev.last = day
    } else {
      groups.push({ first: day, last: day, open: h.open, close: h.close })
    }
  }
  return groups
}

/** Рядки для таблиці годин: [{ days: "Пн–Пт", time: "9:00–19:00" }, …, { days: "Нд", time: "за домовленістю" }]. */
export function hoursRows(profile: BusinessProfile, locale = "uk", closedLabel = "за домовленістю") {
  const labels = DAY_LABELS[locale] ?? DAY_LABELS.uk
  const rows = hoursGroups(profile).map((g) => ({
    days: g.first === g.last ? labels[g.first] : `${labels[g.first]}–${labels[g.last]}`,
    time: `${fmtTime(g.open)}–${fmtTime(g.close)}`,
  }))
  const closed = WEEKDAYS.filter((d) => profile.hours[d]?.closed)
  if (closed.length) rows.push({ days: closed.map((d) => labels[d]).join(", "), time: closedLabel })
  return rows
}

/** «Пн–Пт 9:00–19:00 · Сб 10:00–16:00» — один рядок для футера й контактів. */
export function hoursLine(profile: BusinessProfile, locale = "uk"): string {
  const labels = DAY_LABELS[locale] ?? DAY_LABELS.uk
  return hoursGroups(profile)
    .map((g) => {
      const days = g.first === g.last ? labels[g.first] : `${labels[g.first]}–${labels[g.last]}`
      return `${days} ${fmtTime(g.open)}–${fmtTime(g.close)}`
    })
    .join(" · ")
}

const SCHEMA_DAYS: Record<Weekday, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
}

/** openingHoursSpecification для Schema.org LocalBusiness. */
export function openingHoursSpecification(profile: BusinessProfile) {
  return hoursGroups(profile).map((g) => {
    const from = WEEKDAYS.indexOf(g.first)
    const to = WEEKDAYS.indexOf(g.last)
    const days = WEEKDAYS.slice(from, to + 1).map((d) => SCHEMA_DAYS[d])
    return {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: days.length === 1 ? days[0] : days,
      opens: g.open,
      closes: g.close,
    }
  })
}

/** PostalAddress для Schema.org. */
export function postalAddress(profile: BusinessProfile) {
  return {
    "@type": "PostalAddress",
    streetAddress: profile.address,
    addressLocality: profile.city,
    addressRegion: profile.region,
    postalCode: profile.postalCode,
    addressCountry: "UA",
  }
}

/** Посилання на соцмережі без порожніх значень. */
export function socialLinks(profile: BusinessProfile): string[] {
  return [profile.instagram, profile.facebook].filter((x): x is string => Boolean(x && x.trim()))
}
