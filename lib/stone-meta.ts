import { colorLabel, materialLabel, shapeLabel } from "@/lib/i18n/filters"
import { stoneCode, stoneDisplayName } from "@/lib/catalog-taxonomy"
import type { Locale, StoneItem } from "@/lib/types"

/**
 * Title / description / h1 copy for a product page.
 *
 * Replaces the old `${name} — ${kind}` template, which produced titles that
 * began with a bare number ("001 — Пам'ятник") and were identical across all
 * 60 products apart from that number.
 *
 * Deliberately built as an appositive list — "Пам'ятник №002 — граніт,
 * червоний" — rather than the more natural-reading "пам'ятник з червоного
 * граніту". Ukrainian would require the genitive case AND adjective/noun
 * gender agreement (граніт → чорного граніту, but габро → чорного габро,
 * which does not decline), and production data holds bare adjectives such as
 * "Покостівський" and "Лезниківський" with no head noun at all. No amount of
 * string concatenation produces grammatical output from those inputs, so we
 * use a form that stays correct for every value.
 */

type Parts = {
  /** "002" — the human-facing catalogue number. */
  code: string
  /** "Ангел Скорботи", or null when the row has no name yet. */
  display: string | null
  /** "Пам'ятник" | "Виріб з каменю" */
  kind: string
  /** "Граніт" | "Габро" | "Покостівський" | "" */
  material: string
  /** "Чорний" | "Червоний" | "" */
  color: string
  /** "Одиночний" | "Комплекс Військовий" | "" — admin free text or a canonical key. */
  type: string
}

function parts(s: StoneItem, locale: Locale = "uk"): Parts {
  return {
    code: stoneCode(s),
    display: stoneDisplayName(s),
    kind: s.category === "memorial" ? "Пам'ятник" : "Виріб з каменю",
    material: s.materialType ? materialLabel(s.materialType, locale, s.i18n?.materialType) : "",
    color: s.color ? colorLabel(s.color, locale, s.i18n?.color) : "",
    // Through the resolver, not raw: `shape` holds admin free text in
    // production ("Одиночний") but canonical keys in the bundled seed rows
    // ("classic"), and printing the raw value leaked "classic" into the
    // Ukrainian meta description whenever the seed fallback was in play.
    type: shapeLabel(s.shape, locale, s.i18n?.shape),
  }
}

/** "Пам'ятник №002 — граніт, червоний" (falls back gracefully as fields empty out). */
export function stoneTitle(s: StoneItem, locale: Locale = "uk"): string {
  const p = parts(s, locale)
  const spec = [p.material, p.color].filter(Boolean).join(", ").toLowerCase()
  // A named model leads with its name — that is the memorable, searchable part.
  // Unnamed rows keep the number so the title is never just a bare noun.
  const base = p.display ? `${p.kind} «${p.display}»` : `${p.kind} №${p.code}`
  return spec ? `${base} — ${spec}` : base
}

/** Page h1. Same as the title but without the brand suffix pressure. */
export function stoneHeading(s: StoneItem, locale: Locale = "uk"): string {
  return stoneTitle(s, locale)
}

/**
 * Meta description, kept under ~160 characters so Google does not truncate it.
 *
 * The price sentence is emitted only when `priceFrom` is truthy: every
 * production row currently stores 0, and an unguarded template printed a
 * literal "Від 0 ₴" into the snippet of all 60 pages.
 */
export function stoneDescription(s: StoneItem, locale: Locale = "uk"): string {
  const p = parts(s, locale)
  const spec = [p.type && p.type.toLowerCase(), p.material && p.material.toLowerCase(), p.color && p.color.toLowerCase()]
    .filter(Boolean)
    .join(", ")
  const subject = p.display ? `${p.kind} «${p.display}» (№${p.code})` : `${p.kind} №${p.code}`
  const lead = spec ? `${subject}: ${spec}.` : `${subject}.`
  const price = s.priceFrom ? ` Від ${s.priceFrom.toLocaleString("uk-UA")} ₴.` : ""
  // Tail kept short so the whole line stays under ~160 chars even for the
  // longest spec combination ("комплекс військовий, покостівський, червоний").
  return `${lead} Власне виробництво в Костополі, гравіювання портрета.${price} Гарантія 5 років, монтаж.`
}

/** Descriptive alt text — replaces the bare code the gallery used to emit. */
export function stoneAlt(s: StoneItem, locale: Locale = "uk"): string {
  const p = parts(s, locale)
  const spec = [p.type && p.type.toLowerCase(), p.material && p.material.toLowerCase(), p.color && p.color.toLowerCase()]
    .filter(Boolean)
    .join(", ")
  const base = p.display ? `${p.kind} «${p.display}» №${p.code}` : `${p.kind} №${p.code}`
  return spec ? `${base} — ${spec}` : base
}
