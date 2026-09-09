import type { Locale, StoneItem } from "@/lib/types"
import { defaultStone } from "@/lib/stone-guide"

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
 * бруківка) was removed from THIS site. The product line itself lives on — as a
 * separate site on its own subdomain, with its own repo — and the two must
 * never link to each other. Nothing here may reference it.
 *
 * /kataloh?cat=home is still 308'd in next.config.mjs because that URL WAS live
 * and may be linked; see the comment there for why it does not point at the
 * new subdomain.
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
 * The `stone` vertical was removed from this site — home/countertop products
 * are sold through the separate interior site now, and nothing public here may
 * reference it. The `home` Category value survives so existing DB rows still
 * parse, and because CRM deals coming in from the interior site carry it.
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
    // Порода береться з довідника, а не з рівності `materialType === "granite"`:
    // у полі тепер стоїть конкретний камінь (Капустинський, gabbro, marble…),
    // і буквальне "granite" не зустрічається в жодному товарі.
    match: (s) => defaultStone(s).rock === "Граніт",
  },
  {
    slug: "odynochni",
    h1: "Одиночні пам'ятники",
    title: "Одиночні пам'ятники — каталог і ціни",
    description:
      "Одиночні пам'ятники на одну могилу: класичні, арочні, з хрестом. Граніт і габро, гравіювання портрета, монтаж під ключ. Гарантія 5 років.",
    intro:
      "Одиночний пам'ятник — це стела на одну могилу разом із підставкою та, за потреби, квітником. Найпоширеніший формат і найгнучкіший за бюджетом: та сама модель може бути виконана в тонкому граніті для скромного рішення або в масивній плиті з нахилом і фігурним верхом.\n\nСтандартні розміри стели — 100×50, 110×55 і 120×60 см, але ми ріжемо під розмір ділянки, якщо на кладовищі є обмеження. До кожної моделі доступне гравіювання портрета, епітафії та символіки, а також підбір кольору каменю під уже встановлені поруч пам'ятники.",
    // «Одиночний» і «одинарний» — те саме; у базі трапляються обидва написання,
    // бо старі позиції заводили руками, а нові приходять із моделі асортименту.
    match: (s) => /одиночний|одинарний/.test(shapeText(s)),
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
  {
    slug: "podviyni",
    h1: "Подвійні пам'ятники",
    title: "Подвійні пам'ятники на дві могили — каталог і ціни",
    description:
      "Подвійні пам'ятники для родинного поховання: одна широка стела або дві на спільній тумбі. Граніт, габро, лабрадорит. Виготовлення 7–10 тижнів, монтаж по Україні.",
    intro:
      "Подвійний пам'ятник — це одна широка стела або дві окремі на спільній тумбі для поховання подружжя чи батьків. Найважливіше в такій роботі — камінь з однієї партії: другий портрет і напис часто додають через роки, і різниця у відтінку між двома плитами з різних блоків буде помітна.\n\nМи одразу закладаємо місце під другий портрет, робимо квітник на дві могили й пропонуємо два формати: спільна стела 120×60 см з двома портретами або дві стели по 80×45 см із спільною надгробною плитою. Друге рішення дорожче на камінь, але дозволяє зробити два різні написи й дати без тісноти.",
    match: (s) => /подвій|спарен/.test(shapeText(s)),
  },
  {
    slug: "yevropeiski",
    h1: "Європейські пам'ятники",
    title: "Європейські пам'ятники — низька стела на плиті",
    description:
      "Пам'ятники в європейському стилі: невисока стела на широкій надгробній плиті, лампада, ваза з того самого каменю. Стримана форма, граніт і габро, монтаж під ключ.",
    intro:
      "Європейський пам'ятник — це низька або середня стела на широкій надгробній плиті, без високої вертикалі: так виглядають поховання в Польщі, Німеччині, Чехії. Родини обирають цю форму за стриманість і за те, що вона не ламає загальну лінію кладовища.\n\nУ такому пам'ятнику головну роль грає плита: суцільна полірована або з рамкою під квіти, з лампадою та вазою з того самого каменю. Стела частіше має фігурний контур і мінімум гравіювання — ім'я, дати, хрест. Виготовляємо у чорному габро, сірому покостівському й червоному лезниківському граніті.",
    match: (s) => /європ/.test(shapeText(s)),
  },
  {
    slug: "khresty",
    h1: "Гранітні хрести",
    title: "Гранітні хрести на могилу — каталог і ціни",
    description:
      "Хрести з граніту й габро: православні, католицькі, з розп'яттям і гладкі. Суцільна плита, тумба, напис. Виготовлення 5–7 тижнів, монтаж по Україні.",
    intro:
      "Гранітний хрест — вертикальна форма, яка читається здалеку й не потребує портрета, щоб виглядати завершеною. Робимо православні восьмикінцеві, католицькі й латинські форми, з різьбленим розп'яттям або гладкі; напис розміщуємо на самому хресті або на окремій табличці біля підніжжя.\n\nХрест вирізається з суцільної плити товщиною 8–10 см — склеєні з кількох частин ми не робимо, бо саме шви першими не витримують морозів. Ставиться на тумбу з тим самим фундаментом, що й стела, і може доповнюватись надгробною плитою або квітником.",
    match: (s) => /хрест/.test(shapeText(s)),
  },
  {
    slug: "dytyachi",
    h1: "Дитячі пам'ятники",
    title: "Дитячі пам'ятники — каталог і ціни",
    description:
      "Дитячі пам'ятники зі світлого й теплого каменю: ангел, серце, іграшка, заокруглені форми. Мармур, капустинський граніт, габро. Погоджуємо кожну деталь без поспіху.",
    intro:
      "Дитячий пам'ятник менший за розміром і м'якший за формою: заокруглені кути, світлий або теплий камінь, ангел, серце чи іграшка замість строгого орнаменту. Такі роботи ми погоджуємо з родиною особливо уважно й без поспіху — ескіз показуємо стільки разів, скільки потрібно.\n\nНайчастіше обирають білий мармур, рожево-червоний капустинський граніт або чорне габро з кольоровим портретом. Стела 60×40 або 80×45 см, ділянка 150×80 см. Скульптуру ангела можна виконати з того самого каменю або з білого мармуру на контрасті.",
    match: (s) => /дитяч/.test(shapeText(s)),
  },
  {
    slug: "habro",
    h1: "Пам'ятники з габро",
    title: "Пам'ятники з габро — чорний камінь під портрет",
    description:
      "Пам'ятники з головинського та букинського габро: глибокий чорний, дзеркальне полірування, найкращий контраст під гравіювання портрета. Каталог із цінами.",
    intro:
      "Габро — той камінь, який більшість людей називає «чорним гранітом». Геологічно це інша порода: щільніша, дрібнозерниста, майже без вкраплень, і саме тому після полірування дає дзеркальну поверхню. На ній ручне й лазерне гравіювання дає максимальний контраст — портрет на габро виглядає майже як фотографія.\n\nПрацюємо з двома родовищами Житомирщини: Головинським (найглибший чорний) і Букинським (з ледь помітним сірим відтінком у сонячну погоду). У картці кожного виробу вказано конкретне родовище, а не узагальнене «чорний граніт».",
    match: (s) => defaultStone(s).rock === "Габро",
  },
  {
    slug: "labradoryt",
    h1: "Пам'ятники з лабрадориту",
    title: "Пам'ятники з лабрадориту — чорний камінь із синіми переливами",
    description:
      "Пам'ятники з горбулівського й добринського лабрадориту: темний камінь, який спалахує синім і зеленим під кутом до сонця. Гравіювання як на габро, вигляд — живіший.",
    intro:
      "Лабрадорит — темний камінь із синіми та зеленими переливами, які спалахують під кутом до сонця. У похмуру погоду він виглядає майже як габро, а вранці й надвечір — зовсім інакше. Обирають, коли хочуть відійти від строгого чорного, але зберегти контраст під гравіювання.\n\nВидобувається на Житомирщині: Горбулівське та Добринське родовища. Переливи сильніші на полірованій поверхні великої площі, тому лабрадорит особливо добре працює на широких стелах і суцільних надгробних плитах.",
    match: (s) => defaultStone(s).rock === "Лабрадорит",
  },
  {
    slug: "siri",
    h1: "Сірі пам'ятники",
    title: "Сірі гранітні пам'ятники — покостівський граніт",
    description:
      "Пам'ятники з сірого покостівського граніту: рівний спокійний тон, найдоступніша ціна серед українських гранітів. Часто в поєднанні з чорним габро.",
    intro:
      "Сірий граніт — найспокійніший і найдоступніший вибір. Покостівське родовище дає рівний світло-сірий тон із дрібним однорідним зерном, без різких вкраплень, і добре тримає геометрію на великих плитах, тому його часто беруть на облицювання ділянки, цоколь і тумбу.\n\nПортрет на сірому камені читається слабше, ніж на габро, тому найпоширеніше рішення — сіра стела з чорною вставкою під портрет або чорна стела на сірій основі. Таке поєднання двох каменів є в половині робіт цієї підбірки.",
    match: (s) => s.color === "grey",
  },
]

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

/**
 * Карток на сторінці каталогу. Одне значення для всіх екранів — інакше
 * адреса /storinka-2 показувала б різні товари на телефоні й на десктопі,
 * і Google не міг би ані кешувати, ані посилатись на неї.
 */
export const CATALOG_PAGE_SIZE = 24

const PAGE_SEGMENT = /^storinka-(\d+)$/

/** Номер сторінки з сегмента адреси («storinka-3» → 3) або null. */
export function parsePageSegment(segment: string): number | null {
  const m = PAGE_SEGMENT.exec(segment)
  if (!m) return null
  const n = Number(m[1])
  // «storinka-1» не існує: перша сторінка живе за базовою адресою, інакше
  // той самий список мав би дві адреси.
  return Number.isInteger(n) && n >= 2 ? n : null
}

/** Адреса сторінки каталогу або фасета. Перша — без суфікса. */
export function catalogPagePath(facetSlug: string | null, page: number): string {
  const base = facetSlug ? `/memorial/pamyatnyky/${facetSlug}` : "/memorial/pamyatnyky"
  return page <= 1 ? base : `${base}/storinka-${page}`
}

export function catalogPageCount(itemCount: number): number {
  return Math.max(1, Math.ceil(itemCount / CATALOG_PAGE_SIZE))
}

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
 * Is this [slug] segment a facet rather than a product?
 *
 * Products used to be told apart by being all digits, which stopped working
 * the moment they gained word slugs. Facets are a fixed, hand-written
 * allowlist, so the reliable test is membership in it — anything else is a
 * product lookup. assertNoSlugCollision() keeps a generated product slug from
 * ever shadowing a facet.
 */
export function isFacetSlug(slug: string): boolean {
  return MEMORIAL_FACETS.some((f) => f.slug === slug)
}

/** Throws if a product slug would shadow a facet page. Call before writing slugs. */
export function assertNoSlugCollision(slugs: string[]): void {
  const clashes = slugs.filter((s) => isFacetSlug(s))
  if (clashes.length) {
    throw new Error(`Product slug collides with a facet page: ${clashes.join(", ")}`)
  }
}

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
/**
 * Resolve a URL segment to a MEMORIAL product.
 *
 * Tries the canonical slug first, then the catalogue number, then the row id.
 * The extra lookups are what keep the previous URL shape alive: /001 still
 * resolves, and the page 301s it on to the slug rather than 404ing.
 */
export function findStoneByCode(stones: StoneItem[], param: string): StoneItem | undefined {
  const monuments = stones.filter((s) => s.category === "memorial")
  return (
    monuments.find((s) => s.slug === param) ??
    monuments.find((s) => stoneCode(s) === param) ??
    monuments.find((s) => s.id === param) ??
    // Останньою — попередня адреса товару. Сторінка далі порівняє знайдене з
    // stonePath() і віддасть 301, тому переїзд каталогу не лишає по собі 404.
    monuments.find((s) => {
      const legacy = s.legacySlug
      return Array.isArray(legacy) ? legacy.includes(param) : legacy === param
    })
  )
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

/**
 * Ukrainian -> URL segment, following the romanisation already used for the
 * route slugs in lib/i18n/pathnames.ts (г→h, ц→ts, soft sign dropped).
 */
const TRANSLIT: Record<string, string> = {
  а:"a", б:"b", в:"v", г:"h", ґ:"g", д:"d", е:"e", є:"ie", ж:"zh", з:"z",
  и:"y", і:"i", ї:"i", й:"i", к:"k", л:"l", м:"m", н:"n", о:"o", п:"p",
  р:"r", с:"s", т:"t", у:"u", ф:"f", х:"kh", ц:"ts", ч:"ch", ш:"sh",
  щ:"shch", ь:"", ю:"iu", я:"ia", "'":"", "’":"", "ʼ":"",
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .split("")
    .map((ch) => (ch in TRANSLIT ? TRANSLIT[ch] : ch))
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * URL segment for a product: the stored slug, or the catalogue number until
 * one is written. The fallback is what lets this ship before the data
 * migration without moving a single URL.
 */
export function stoneSlug(stone: StoneItem): string {
  return stone.slug || stoneCode(stone)
}

/** Canonical public path for a product. Only memorial products have one. */
export function stonePath(stone: StoneItem): string {
  return `/memorial/pamyatnyky/${stoneSlug(stone)}`
}
