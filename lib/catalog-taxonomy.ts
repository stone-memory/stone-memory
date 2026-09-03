import type { Locale, StoneItem } from "@/lib/types"

/**
 * Single source of truth for the public catalogue structure.
 *
 *   /memorial/…  — B2C, меморіальний напрямок (60 товарів у каталозі)
 *
 * Everything that needs to know which URLs exist — the router, the sitemap,
 * the breadcrumbs, generateStaticParams and the redirect map — reads from
 * here, so a new facet is one entry, not seven edits.
 *
 * The former `/stone/…` B2B vertical (стільниці, підвіконня, сходи, фасади,
 * бруківка) was removed: that product line is discontinued. It never reached
 * production, so there is nothing to redirect — but /kataloh?cat=home is still
 * 308'd in next.config.mjs because that URL WAS live and may be linked.
 */

// ---------------------------------------------------------------------------
// Vertical names
// ---------------------------------------------------------------------------

/**
 * Display name for the memorial vertical.
 *
 * Deliberately separate from `t.nav.memorial`, which names the product
 * CATEGORY ("Пам'ятники") on cards and filters. The vertical also covers
 * монтаж and благоустрій, so reusing the category label collapsed the whole
 * direction into one of its own sections.
 *
 * The `stone` vertical was removed from the site — home/countertop products
 * are no longer sold. Nothing public may reference it again; the `home`
 * Category value survives only so existing DB rows and CRM deals still parse.
 */
export const VERTICAL_LABELS: Record<"memorial", Record<Locale, string>> = {
  memorial: {
    uk: "Меморіал",
    en: "Memorial",
    pl: "Memorial",
    de: "Memorial",
    lt: "Memorialas",
  },
}

/** Ukrainian label — the server always renders `<html lang="uk">`. */
export const verticalLabel = (v: "memorial") => VERTICAL_LABELS[v].uk

// ---------------------------------------------------------------------------
// Facet publishing threshold
// ---------------------------------------------------------------------------

/**
 * A facet URL is only submitted to Google once this many products match it.
 *
 * Below the threshold the page still renders (the on-site filters link to it
 * and a visitor following one must not hit a 404), but it is `noindex, follow`
 * and stays out of the sitemap. That is the standard defence against doorway
 * pages: a /chorni/ holding two monuments is not a page worth ranking, and a
 * few dozen of them drag the whole domain down.
 *
 * Deliberately NOT a 404 below the threshold — a facet hovering around the
 * cutoff would flip between 200 and 404 as stock changes, which is a far worse
 * signal than a stable noindex.
 */
export const MIN_FACET_ITEMS = 10

// ---------------------------------------------------------------------------
// Memorial facets
// ---------------------------------------------------------------------------

export type Facet = {
  /** URL segment under /memorial/pamyatnyky/. Always alphabetic — see isProductCode(). */
  slug: string
  h1: string
  /** Without the brand: app/layout.tsx already appends " — Stone Memory". */
  title: string
  /** Kept under ~160 chars so Google does not truncate the snippet. */
  description: string
  /** Intro copy rendered above the grid — the "вступний текст" the audit asked for. */
  intro: string
  match: (s: StoneItem) => boolean
}

/**
 * Facet predicates read the fields that are actually populated in production:
 * `shape` 60/60, `color` 59/60, `materialType` 53/60. `material` and `origin`
 * are empty on every row, so nothing may key off them yet.
 *
 * Values are compared case-insensitively because `shape` holds admin-entered
 * free text ("Одиночний", "Одиночний Військовий", "Спарений комплекс") rather
 * than the canonical StoneShape union.
 */
const shapeText = (s: StoneItem) => (typeof s.shape === "string" ? s.shape.toLowerCase() : "")

export const MEMORIAL_FACETS: Facet[] = [
  {
    slug: "hranitni",
    h1: "Гранітні пам'ятники",
    title: "Гранітні пам'ятники — каталог від виробника",
    description:
      "Пам'ятники з граніту від виробника: чорний, червоний, зелений камінь. Власний цех у Костополі, гарантія 5 років, доставка й монтаж по Україні.",
    intro:
      "Граніт — найпоширеніший матеріал для пам'ятників, і не через ціну, а через поведінку каменю в часі. Його щільність не пропускає воду всередину, тому морози не руйнують поверхню, а полірування тримає дзеркальний блиск десятиліттями без повторної обробки. Гравіювання на граніті лишається читабельним навіть через 30–40 років.\n\nУ каталозі — український граніт із родовищ Житомирщини та Рівненщини (покостівський, лезниківський, головинське габро) і завезені породи. Кожен виріб проходить сім етапів у нашому цеху в Костополі: розпил, шліфування, полірування, гравіювання, герметизація й контроль геометрії.",
    match: (s) => s.materialType === "granite",
  },
  {
    slug: "odynochni",
    h1: "Одиночні пам'ятники",
    title: "Одиночні пам'ятники — каталог і ціни",
    description:
      "Одиночні пам'ятники на одну могилу: класичні, арочні, з хрестом. Граніт і габро, гравіювання портрета, монтаж під ключ. Гарантія 5 років.",
    intro:
      "Одиночний пам'ятник — це стела на одну могилу разом із підставкою та, за потреби, квітником. Найпоширеніший формат і найгнучкіший за бюджетом: та сама модель може бути виконана в тонкому граніті для скромного рішення або в масивній плиті з нахилом і фігурним верхом.\n\nСтандартні розміри стели — 100×50, 110×55 і 120×60 см, але ми ріжемо під розмір ділянки, якщо на кладовищі є обмеження. До кожної моделі доступне гравіювання портрета, епітафії та символіки, а також підбір кольору каменю під уже встановлені поруч пам'ятники.",
    match: (s) => shapeText(s).includes("одиночний"),
  },
  {
    slug: "chorni",
    h1: "Чорні пам'ятники",
    title: "Чорні пам'ятники з граніту й габро",
    description:
      "Пам'ятники з чорного каменю — габро, лабрадорит, покостівський граніт. Глибоке гравіювання портрета, дзеркальне полірування, монтаж по Україні.",
    intro:
      "Чорний камінь обирають найчастіше, і причина не лише естетична: саме на чорній полірованій поверхні ручне й лазерне гравіювання дає максимальний контраст. Портрет на габро виглядає майже фотографічно, тоді як на світлому граніті той самий малюнок читається значно слабше.\n\nПід «чорним» на практиці ховаються різні породи. Габро з Головинського родовища — глибоко чорне, майже без вкраплень. Лабрадорит дає синюваті переливи на сонці. Покостівський граніт у темних партіях — з дрібним сірим зерном. У картці кожного виробу вказано конкретну породу, а не узагальнене «чорний граніт».",
    match: (s) => s.color === "black",
  },
  {
    slug: "chervoni",
    h1: "Червоні пам'ятники",
    title: "Червоні гранітні пам'ятники",
    description:
      "Пам'ятники з червоного граніту: лезниківський і покостівський камінь. Насичений колір, стійкий до УФ, доставка й монтаж по Україні. Гарантія 5 років.",
    intro:
      "Червоний граніт — українська класика. Лезниківське родовище на Житомирщині дає насичений цегляно-червоний камінь із великим зерном, який не вигорає на сонці: колір дає польовий шпат у структурі породи, а не покриття, тому УФ його не бере.\n\nЧервоний камінь помітно тепліший за чорний і виглядає менш строго — його часто обирають для жіночих і дитячих поховань, а також коли пам'ятник має гармоніювати з цегляною огорожею чи вже встановленим комплексом. Гравіювання на червоному граніті виконуємо із заповненням золотом або білою емаллю, бо звичайна різьба на ньому контрастує слабше, ніж на габро.",
    match: (s) => s.color === "red",
  },
  {
    slug: "viyskovi",
    h1: "Військові пам'ятники",
    title: "Військові пам'ятники — одиночні та комплекси",
    description:
      "Пам'ятники військовослужбовцям: одиночні та меморіальні комплекси. Гравіювання символіки підрозділу, портрет у формі, епітафія. Виробництво в Костополі.",
    intro:
      "Військові пам'ятники ми виконуємо з окремою увагою до символіки: шеврон підрозділу, емблема роду військ, державний герб і нагороди гравіюються за наданими зображеннями, а не з узагальненого шаблону. Портрет у формі вимагає вищої деталізації, ніж звичайний, тому такі роботи йдуть через глибоке лазерне гравіювання на чорному габро.\n\nДоступні як одиночні стели, так і меморіальні комплекси з тумбою, квітником та окремою плитою під епітафію. Для родин загиблих військовослужбовців ми готуємо повний пакет документів на встановлення й беремо на себе узгодження з адміністрацією кладовища.",
    match: (s) => shapeText(s).includes("військовий"),
  },
  {
    slug: "kompleksy",
    h1: "Меморіальні комплекси",
    title: "Меморіальні комплекси з граніту",
    description:
      "Меморіальні та сімейні комплекси: стела, тумба, квітник, огорожа, облицювання. Проєкт і 3D-візуалізація, виробництво й монтаж під ключ.",
    intro:
      "Меморіальний комплекс — це не просто більший пам'ятник, а цілісне рішення на всю ділянку: стела (одна або спарена), тумба, квітник, облицювання основи, доріжки та огорожа з того самого каменю. Такі роботи ми починаємо з виїзду на місце й заміру, бо геометрія ділянки й тип ґрунту визначають конструкцію фундаменту.\n\nПеред виготовленням готуємо 3D-візуалізацію, щоб родина побачила пропорції до того, як камінь буде розпиляно. Гарантія 5 років поширюється не тільки на камінь, а й на фундамент і монтаж — саме на них припадає більшість проблем із комплексами, зроблених без належної підготовки основи.",
    match: (s) => shapeText(s).includes("комплекс"),
  },
]

// ---------------------------------------------------------------------------
// Facet helpers
// ---------------------------------------------------------------------------

export function findFacet(slug: string): Facet | undefined {
  return MEMORIAL_FACETS.find((f) => f.slug === slug)
}

export function facetItems(stones: StoneItem[], facet: Facet): StoneItem[] {
  return stones.filter((s) => s.category === "memorial" && facet.match(s))
}

/**
 * Facets that currently clear MIN_FACET_ITEMS — the only ones allowed into the
 * sitemap and the only ones rendered `index, follow`.
 *
 * Computed from live data rather than hard-coded, so a facet publishes itself
 * automatically once the catalogue grows past the threshold (today "kompleksy"
 * sits at 8 and stays noindex; it crosses over at 10 with no code change).
 */
export function publishedFacets(stones: StoneItem[]): Facet[] {
  return MEMORIAL_FACETS.filter((f) => facetItems(stones, f).length >= MIN_FACET_ITEMS)
}

/**
 * Discriminates a product code from a facet slug in the shared [slug] segment.
 *
 * Any all-digit segment is a product: production codes are 3-digit and
 * zero-padded ("001"…"063"), while the bundled seed rows used as the
 * Supabase-outage fallback carry 6-digit ids ("001247"). Matching on "digits"
 * rather than a fixed width covers both — an earlier \d{2,4} bound made every
 * product 404 for the whole duration of a DB incident.
 *
 * Facet slugs are alphabetic by construction, so the two namespaces cannot
 * collide. assertNoFacetCollision() below keeps that true if codes ever change.
 */
export function isProductCode(slug: string): boolean {
  return /^\d+$/.test(slug)
}

/** Guards the invariant the [slug] route depends on. Cheap; runs on import. */
function assertNoFacetCollision() {
  const bad = MEMORIAL_FACETS.filter((f) => isProductCode(f.slug))
  if (bad.length) {
    throw new Error(
      `Facet slug must not be all digits — it would be routed as a product code: ${bad
        .map((f) => f.slug)
        .join(", ")}`
    )
  }
}
assertNoFacetCollision()

/**
 * Resolve a URL code back to a stone.
 *
 * Falls back to matching on `id` because production data has a known drift:
 * row id 3 carries name "002". Anything already linking by id keeps working,
 * while the canonical URL is always built from the code.
 */
/**
 * Resolve a URL code to a MEMORIAL product.
 *
 * The category filter is load-bearing, not defensive tidiness: `/memorial/
 * pamyatnyky/[slug]` is now the only product route on the site, so without it
 * any leftover `home` row would be reachable — and indexable — under a
 * monuments URL, describing a product line the business no longer sells.
 */
export function findStoneByCode(stones: StoneItem[], code: string): StoneItem | undefined {
  const monuments = stones.filter((s) => s.category === "memorial")
  return monuments.find((s) => stoneCode(s) === code) ?? monuments.find((s) => s.id === code)
}

/**
 * The catalogue number, resolved across both data shapes.
 *
 * Rows written before names existed keep the number in `name`; rows written
 * after keep it in `code` and use `name` for the display name. Reading through
 * this helper means the migration can be deployed before the data changes and
 * stay correct after — the URL never moves either way.
 */
export function stoneCode(stone: StoneItem): string {
  if (stone.code) return stone.code
  // Legacy: `name` held the number as long as it looks like one.
  if (stone.name && /^\d+$/.test(stone.name)) return stone.name
  return stone.id
}

/** Display name, or null when the row only carries a number. */
export function stoneDisplayName(stone: StoneItem): string | null {
  if (!stone.name) return null
  return /^\d+$/.test(stone.name) ? null : stone.name
}

/** Canonical public path for a product. Only memorial products have one. */
export function stonePath(stone: StoneItem): string {
  return `/memorial/pamyatnyky/${stoneCode(stone)}`
}
