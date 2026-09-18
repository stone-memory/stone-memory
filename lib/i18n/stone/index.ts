import type { Locale } from "@/lib/types"
import { STONE_UI } from "./ui"
import { STONE_VOCAB } from "./vocab"
import { STONE_CONTENT } from "./content"

/**
 * Переклад розділу «Архітектурний камінь» за українським рядком-джерелом.
 *
 * Розділ рендериться на сервері з бази, а мова живе в cookie/localStorage, тому
 * замість словника з ключами тут один плоский словник «український рядок →
 * переклад». Невідомий рядок (нове значення з адмінки, назва каменю) віддається
 * як є — сторінка ніколи не ламається, просто лишає українську.
 */
const ORDER: Record<Exclude<Locale, "uk">, 0 | 1 | 2 | 3> = { pl: 0, en: 1, de: 2, lt: 3 }

const DICT: Record<string, [string, string, string, string]> = { ...STONE_CONTENT, ...STONE_VOCAB, ...STONE_UI }

export type StoneT = (text: string) => string

export function stoneT(locale: Locale): StoneT {
  if (locale === "uk") return (text) => text
  const i = ORDER[locale]
  return (text) => {
    const hit = DICT[text] ?? DICT[text.trim()]
    return hit ? hit[i] : text
  }
}

/** Рядок із кількох словникових частин: «Граніт · чорний» → кожну частину окремо. */
export function stoneTParts(locale: Locale, text: string, sep = " · "): string {
  const t = stoneT(locale)
  return text.split(sep).map((p) => t(p)).join(sep)
}

/** Ціна колекції «від 3 640 грн/пог.м» за мовою; валюта грн → UAH, одиниці локалізуються. */
const UNITS: Record<string, [string, string, string, string]> = {
  "пог.м": ["mb", "lin. m", "lfm", "m"],
  "м²": ["m²", "m²", "m²", "m²"],
}
export function stonePrice(locale: Locale, p: { value: number; unit: string; currency: string } | undefined | null): string {
  const t = stoneT(locale)
  if (!p?.value) return t("ціна за запитом")
  const value = new Intl.NumberFormat("uk-UA").format(p.value).replace(/\s/g, " ")
  const currency = p.currency === "грн" ? t("грн") : p.currency
  const unit = locale === "uk" ? p.unit : UNITS[p.unit]?.[ORDER[locale]] ?? p.unit
  return `${t("від")} ${value} ${currency}/${unit}`
}

export function hasStoneTranslation(text: string): boolean {
  return text in DICT
}

/**
 * Опис колекції мовою відвідувача. Довгі описи в базі існують лише українською,
 * тож для інших мов збираємо короткий опис зі словникових полів: порода, тон,
 * походження, застосування. Українська віддає оригінальний текст.
 */
export function collectionSummary(
  locale: Locale,
  c: { family: string; tone: string; origin: string; applications: string[]; description: string }
): string {
  if (locale === "uk") return c.description
  const t = stoneT(locale)
  const apps = c.applications.map(t).join(", ")
  const head = `${t(c.family)}, ${t(c.tone)}. ${t("Походження:")} ${t(c.origin)}.`
  return apps ? `${head} ${t("Застосування")}: ${apps}.` : head
}

/**
 * Назва колекції для інших мов: словникові слова (Граніт, Мармур, Габро…)
 * перекладаються, решта кирилиці транслітерується за офіційним стандартом
 * (КМУ 2010). «Покостівський граніт (Grey Ukraine)» → «Pokostivskyi granite
 * (Grey Ukraine)»; торгові назви латиницею лишаються як є.
 */
const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ie", ж: "zh", з: "z", и: "y", і: "i", ї: "i", й: "i",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch",
  ш: "sh", щ: "shch", ь: "", ю: "iu", я: "ia", "’": "", "'": "", ʼ: "",
}
export function transliterate(text: string): string {
  return text
    .replace(/^[ЄЇЙЮЯ]|(?<=\s|\()[ЄЇЙЮЯ]/g, (c) => ({ Є: "Ye", Ї: "Yi", Й: "Y", Ю: "Yu", Я: "Ya" })[c] ?? c)
    .replace(/(?<=[\s(])[єїйюя]/g, (c) => ({ є: "ye", ї: "yi", й: "y", ю: "yu", я: "ya" })[c] ?? c)
    .replace(/[А-ЯІЇЄҐ]/g, (c) => {
      const low = TRANSLIT[c.toLowerCase()] ?? c
      return low.charAt(0).toUpperCase() + low.slice(1)
    })
    .replace(/[а-яіїєґ’'ʼ]/g, (c) => TRANSLIT[c] ?? c)
}

const NAME_WORDS: Record<string, [string, string, string, string]> = {
  граніт: ["granit", "granite", "Granit", "granitas"],
  габро: ["gabro", "gabbro", "Gabbro", "gabras"],
  мармур: ["marmur", "marble", "Marmor", "marmuras"],
  кварцит: ["kwarcyt", "quartzite", "Quarzit", "kvarcitas"],
  лабрадорит: ["labradoryt", "labradorite", "Labradorit", "labradoritas"],
  базальт: ["bazalt", "basalt", "Basalt", "bazaltas"],
  пісковик: ["piaskowiec", "sandstone", "Sandstein", "smiltainis"],
  онікс: ["onyks", "onyx", "Onyx", "oniksas"],
  травертин: ["trawertyn", "travertine", "Travertin", "travertinas"],
  вапняк: ["wapień", "limestone", "Kalkstein", "klintis"],
  кварц: ["kwarc", "quartz", "Quarz", "kvarcas"],
  керамограніт: ["gres", "porcelain", "Feinsteinzeug", "keraminis granitas"],
}
export function collectionName(locale: Locale, name: string): string {
  if (locale === "uk" || !/[А-Яа-яІіЇїЄєҐґ]/.test(name)) return name
  const i = ORDER[locale]
  const withWords = name.replace(/[А-Яа-яІіЇїЄєҐґ’']+/g, (word) => {
    const hit = NAME_WORDS[word.toLowerCase()]
    if (!hit) return word
    const out = hit[i]
    return word[0] === word[0].toUpperCase() ? out.charAt(0).toUpperCase() + out.slice(1) : out
  })
  return transliterate(withWords)
}
