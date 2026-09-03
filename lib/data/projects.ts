import type { Locale } from "@/lib/types"

// Memorial work only — the home/countertop line was discontinued, so the
// portfolio filter must not offer categories the business no longer takes on.
export type ProjectCategory =
  | "monument"
  | "complex"
  | "engraving"
  | "landscaping"

export type Project = {
  slug: string
  category: ProjectCategory
  cover: string
  year: number
  city: string
  title: Record<Locale, string>
  description: Record<Locale, string>
  materials: Record<Locale, string>
}

export const categoryLabels: Record<ProjectCategory, Record<Locale, string>> = {
  monument: { uk: "Пам'ятники", pl: "Pomniki", en: "Monuments", de: "Grabmale", lt: "Paminklai" },
  complex: { uk: "Меморіальні комплекси", pl: "Kompleksy memorialne", en: "Memorial complexes", de: "Gedenkkomplexe", lt: "Memorialiniai kompleksai" },
  engraving: { uk: "Гравіювання", pl: "Grawerowanie", en: "Engraving", de: "Gravur", lt: "Graviravimas" },
  landscaping: { uk: "Благоустрій", pl: "Zagospodarowanie", en: "Landscaping", de: "Einfassung", lt: "Sutvarkymas" },
}

/**
 * Safe label lookup — ALWAYS use this instead of indexing `categoryLabels`.
 *
 * Nine rows in Supabase still carry categories from the discontinued home
 * line ("countertop", "stairs", "fireplace", "paving", "window-sill",
 * "facade", "interior"). A bare `categoryLabels[p.category][locale]` throws
 * "Cannot read properties of undefined" on those rows, which would have taken
 * down the whole /admin/projects page the moment it loaded. They are all
 * hidden today, but a stale row must never be able to crash a page.
 */
export function projectCategoryLabel(category: string, locale: Locale): string {
  const entry = (categoryLabels as Record<string, Record<Locale, string>>)[category]
  return entry?.[locale] ?? category
}

const u = (id: string) => `https://images.unsplash.com/${id}?w=1600&h=1200&fit=crop&q=80&auto=format`

// Photo map per category (curated working URLs)
const fallback = {
  monument: u("photo-1558618666-fcd25c85cd64"),
  complex: u("photo-1558618666-fcd25c85cd64"),
  engraving: u("photo-1558618666-fcd25c85cd64"),
  landscaping: u("photo-1558618666-fcd25c85cd64"),
}

export const projects: Project[] = [
  {
    slug: "memorial-family-kyiv",
    category: "monument",
    cover: fallback.monument,
    year: 2025,
    city: "Київ",
    title: {
      uk: "Сімейний меморіальний комплекс, Київ",
      pl: "Rodzinny kompleks memorialny, Kijów",
      en: "Family memorial complex, Kyiv",
      de: "Familien-Grabmal, Kyiv",
      lt: "Šeimos memorialinis kompleksas, Kyjivas",
    },
    description: {
      uk: "Подвійний пам'ятник з Головинського габро. Фундамент, монтаж, гравіювання портретів, огорожа з граніту, декоративна засипка.",
      pl: "Podwójny pomnik z gabra Hołowyńskiego. Fundament, montaż, grawerowanie portretów, granitowe ogrodzenie, dekoracyjna zasypka.",
      en: "Double monument in Holovyne gabbro. Foundation, installation, portrait engraving, granite border, decorative gravel.",
      de: "Doppel-Grabmal aus Holovyne-Gabbro. Fundament, Montage, Porträtgravur, Granit-Einfassung, Dekorkies.",
      lt: "Dvigubas paminklas iš Holovynės gabbro. Pamatas, montavimas, portretų graviravimas, granito aptvaras, dekoratyvinis žvyras.",
    },
    materials: {
      uk: "Габро Головине · поліроване",
      pl: "Gabro Hołowyńskie · polerowane",
      en: "Holovyne gabbro · polished",
      de: "Holovyne-Gabbro · poliert",
      lt: "Holovynės gabbras · poliruotas",
    },
  },
  {
    slug: "memorial-cross-vinnytsia",
    category: "monument",
    cover: u("photo-1583845112239-97ef1341b271"),
    year: 2025,
    city: "Вінниця",
    title: {
      uk: "Пам'ятник з хрестом, Вінниця",
      pl: "Pomnik z krzyżem, Winnica",
      en: "Cross memorial, Vinnytsia",
      de: "Kreuzgrabmal, Winnyzja",
      lt: "Paminklas su kryžiumi, Vinica",
    },
    description: {
      uk: "Одиночний пам'ятник з габро з різьбленим хрестом. Гравірування портрету за фото, епітафія золотом.",
      pl: "Pojedynczy pomnik z gabra z rzeźbionym krzyżem. Grawerowanie portretu ze zdjęcia, epitafium złocone.",
      en: "Single gabbro memorial with carved cross. Portrait engraved from photo, gilded epitaph.",
      de: "Einzel-Grabmal aus Gabbro mit geschnitztem Kreuz. Porträt nach Foto, vergoldete Gravur.",
      lt: "Vienišas gabbro paminklas su droži kryžiumi. Portretas iš nuotraukos, auksuotas užrašas.",
    },
    materials: {
      uk: "Добринське габро · поліроване",
      pl: "Dobrynske gabro · polerowane",
      en: "Dobrynske gabbro · polished",
      de: "Dobrynske-Gabbro · poliert",
      lt: "Dobrynskio gabbras · poliruotas",
    },
  },
]

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug)
}
