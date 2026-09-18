import type { Locale } from "@/lib/types"

/**
 * Спільні підписи для клієнтських компонентів, які раніше були захардкоджені
 * українською. Ключі — українські назви, як вони лежать у даних (родини
 * каменю в stilnytsi_materials, `rock` у довіднику, slug міст), щоб не чіпати
 * саму модель даних: переклад накладається лише при рендері.
 */
export type LocaleText = Record<Locale, string>

export const pick = <T,>(map: Record<Locale, T>, locale: Locale): T => map[locale] ?? map.uk

/** Родини каменю: і `rock` довідника пам'ятників, і `family` колекцій. */
export const ROCK_FAMILY: Record<string, LocaleText> = {
  Граніт: { uk: "Граніт", pl: "Granit", en: "Granite", de: "Granit", lt: "Granitas" },
  Габро: { uk: "Габро", pl: "Gabro", en: "Gabbro", de: "Gabbro", lt: "Gabras" },
  Лабрадорит: { uk: "Лабрадорит", pl: "Labradoryt", en: "Labradorite", de: "Labradorit", lt: "Labradoritas" },
  Базальт: { uk: "Базальт", pl: "Bazalt", en: "Basalt", de: "Basalt", lt: "Bazaltas" },
  Мармур: { uk: "Мармур", pl: "Marmur", en: "Marble", de: "Marmor", lt: "Marmuras" },
  Пісковик: { uk: "Пісковик", pl: "Piaskowiec", en: "Sandstone", de: "Sandstein", lt: "Smiltainis" },
  Кварцит: { uk: "Кварцит", pl: "Kwarcyt", en: "Quartzite", de: "Quarzit", lt: "Kvarcitas" },
  Онікс: { uk: "Онікс", pl: "Onyks", en: "Onyx", de: "Onyx", lt: "Oniksas" },
  Травертин: { uk: "Травертин", pl: "Trawertyn", en: "Travertine", de: "Travertin", lt: "Travertinas" },
  Вапняк: { uk: "Вапняк", pl: "Wapień", en: "Limestone", de: "Kalkstein", lt: "Klintis" },
  Кварц: { uk: "Кварц", pl: "Kwarc", en: "Quartz", de: "Quarz", lt: "Kvarcas" },
  Керамограніт: { uk: "Керамограніт", pl: "Gres", en: "Porcelain stoneware", de: "Feinsteinzeug", lt: "Keraminis granitas" },
}

export const rockFamilyLabel = (family: string, locale: Locale): string =>
  ROCK_FAMILY[family]?.[locale] ?? family

/** Рівень ціни каменю з довідника (`priceLevel`). */
export const PRICE_LEVEL: Record<string, LocaleText> = {
  Найдоступніший: { uk: "Найдоступніший", pl: "Najtańszy", en: "Most affordable", de: "Am günstigsten", lt: "Pigiausias" },
  Середній: { uk: "Середній", pl: "Średni", en: "Mid-range", de: "Mittel", lt: "Vidutinis" },
  Вищий: { uk: "Вищий", pl: "Wyższy", en: "Upper", de: "Gehoben", lt: "Aukštesnis" },
  Преміум: { uk: "Преміум", pl: "Premium", en: "Premium", de: "Premium", lt: "Premium" },
}

export const priceLevelLabel = (level: string, locale: Locale): string =>
  PRICE_LEVEL[level]?.[locale] ?? level

/** Назви міст за slug із lib/site-facts. Латиниця однакова для pl/en/de/lt. */
const CITY_LATIN: Record<string, string> = {
  kostopil: "Kostopil",
  rivne: "Rivne",
  sarny: "Sarny",
  lutsk: "Lutsk",
  zhytomyr: "Zhytomyr",
  kyiv: "Kyiv",
  zdolbuniv: "Zdolbuniv",
  ostroh: "Ostroh",
  dubno: "Dubno",
  varash: "Varash",
  kovel: "Kovel",
  novovolynsk: "Novovolynsk",
}

export const cityName = (slug: string, ukName: string, locale: Locale): string =>
  locale === "uk" ? ukName : CITY_LATIN[slug] ?? ukName

/** Заголовки h1 фасетів каталогу (lib/catalog-taxonomy) — для інших мов. */
export const FACET_H1: Record<string, LocaleText> = {
  hranitni: { uk: "Гранітні пам'ятники", pl: "Pomniki granitowe", en: "Granite monuments", de: "Grabmale aus Granit", lt: "Granito paminklai" },
  odynochni: { uk: "Одиночні пам'ятники", pl: "Pomniki pojedyncze", en: "Single monuments", de: "Einzelgrabmale", lt: "Vienviečiai paminklai" },
  chorni: { uk: "Чорні пам'ятники", pl: "Czarne pomniki", en: "Black monuments", de: "Schwarze Grabmale", lt: "Juodi paminklai" },
  chervoni: { uk: "Червоні пам'ятники", pl: "Czerwone pomniki", en: "Red monuments", de: "Rote Grabmale", lt: "Raudoni paminklai" },
  viyskovi: { uk: "Військові пам'ятники", pl: "Pomniki wojskowe", en: "Military monuments", de: "Soldatengrabmale", lt: "Kariniai paminklai" },
  kompleksy: { uk: "Меморіальні комплекси", pl: "Kompleksy nagrobne", en: "Memorial complexes", de: "Grabanlagen", lt: "Memorialiniai kompleksai" },
  podviyni: { uk: "Подвійні пам'ятники", pl: "Pomniki podwójne", en: "Double monuments", de: "Doppelgrabmale", lt: "Dviviečiai paminklai" },
  yevropeiski: { uk: "Європейські пам'ятники", pl: "Pomniki europejskie", en: "European-style monuments", de: "Grabmale im europäischen Stil", lt: "Europietiški paminklai" },
  khresty: { uk: "Гранітні хрести", pl: "Krzyże granitowe", en: "Granite crosses", de: "Granitkreuze", lt: "Granito kryžiai" },
  dytyachi: { uk: "Дитячі пам'ятники", pl: "Pomniki dziecięce", en: "Children's monuments", de: "Kindergrabmale", lt: "Vaikų paminklai" },
  habro: { uk: "Пам'ятники з габро", pl: "Pomniki z gabro", en: "Gabbro monuments", de: "Grabmale aus Gabbro", lt: "Gabro paminklai" },
  labradoryt: { uk: "Пам'ятники з лабрадориту", pl: "Pomniki z labradorytu", en: "Labradorite monuments", de: "Grabmale aus Labradorit", lt: "Labradorito paminklai" },
  siri: { uk: "Сірі пам'ятники", pl: "Szare pomniki", en: "Grey monuments", de: "Graue Grabmale", lt: "Pilki paminklai" },
}

export const facetH1 = (slug: string, ukH1: string, locale: Locale): string =>
  locale === "uk" ? ukH1 : FACET_H1[slug]?.[locale] ?? ukH1

/** Кількість моделей: «12 моделей», «1 model», «2 modele». */
export function modelsCount(count: number, locale: Locale): string {
  switch (locale) {
    case "uk": {
      const m10 = count % 10
      const m100 = count % 100
      const word = m10 === 1 && m100 !== 11 ? "модель" : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? "моделі" : "моделей"
      return `${count} ${word}`
    }
    case "pl": {
      const m10 = count % 10
      const m100 = count % 100
      const word = count === 1 ? "model" : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? "modele" : "modeli"
      return `${count} ${word}`
    }
    case "en":
      return `${count} ${count === 1 ? "model" : "models"}`
    case "de":
      return `${count} ${count === 1 ? "Modell" : "Modelle"}`
    case "lt": {
      const m10 = count % 10
      const m100 = count % 100
      const word = m10 === 1 && m100 !== 11 ? "modelis" : m10 >= 2 && m10 <= 9 && (m100 < 10 || m100 >= 20) ? "modeliai" : "modelių"
      return `${count} ${word}`
    }
  }
}

/** «5 років», «5 lat», «5 years»… для гарантії. */
export function yearsLabel(n: number, locale: Locale): string {
  switch (locale) {
    case "uk": {
      const m10 = n % 10
      const m100 = n % 100
      return `${n} ${m10 === 1 && m100 !== 11 ? "рік" : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? "роки" : "років"}`
    }
    case "pl":
      return `${n} ${n === 1 ? "rok" : n >= 2 && n <= 4 ? "lata" : "lat"}`
    case "en":
      return `${n} ${n === 1 ? "year" : "years"}`
    case "de":
      return `${n} ${n === 1 ? "Jahr" : "Jahre"}`
    case "lt":
      return `${n} ${n % 10 === 1 && n % 100 !== 11 ? "metai" : "metai"}`
  }
}

/**
 * Терміни з lib/site-facts («5–7 тижнів», «7–10 днів») для інших мов.
 * Самі факти лишаються українськими рядками — це єдине місце правди для
 * інфосторінок; тут лише підмінюється слово.
 */
const DURATION_WORDS: Record<"weeks" | "days", LocaleText> = {
  weeks: { uk: "тижнів", pl: "tygodni", en: "weeks", de: "Wochen", lt: "sav." },
  days: { uk: "днів", pl: "dni", en: "days", de: "Tage", lt: "d." },
}

export function localizeDuration(value: string, locale: Locale): string {
  if (locale === "uk") return value
  return value.replace(/тижн\S*/u, DURATION_WORDS.weeks[locale]).replace(/дн\S*/u, DURATION_WORDS.days[locale])
}
