"use client"

import { useEffect } from "react"
import { create } from "zustand"
import { authedFetch } from "@/lib/authed-fetch"
import type { Locale } from "@/lib/types"

/**
 * Editable homepage "Що саме ми робимо" section. Two cards
 * (Memorial + Home & Garden) plus a top heading. Persisted as a
 * single row in `site_content` keyed `homepage_categories`.
 *
 * Keep visually identical to the old hardcoded copy until admin saves
 * something — `useHomepageCategories()` falls back to DEFAULT_CONTENT
 * when the row doesn't exist.
 */

export type HomepageCategoryCard = {
  /** Single image URL — same across all locales. */
  image: string
  /** Single href — same across all locales. */
  href: string
  title: Record<Locale, string>
  description: Record<Locale, string>
  cta: Record<Locale, string>
  /** Bullet list per locale. */
  items: Record<Locale, string[]>
}

export type HomepageCategoriesContent = {
  heading: Record<Locale, string>
  memorial: HomepageCategoryCard
  /**
   * Discontinued "Дім і сад" card. Optional rather than deleted: rows already
   * saved in `site_content.homepage_categories` still carry this key, and a
   * required field would make every one of them fail to parse. Nothing renders
   * it — see components/categories-section.tsx.
   */
  home?: HomepageCategoryCard
}

const u = (id: string) =>
  `https://images.unsplash.com/${id}?w=1600&h=1200&fit=crop&q=80&auto=format`

/** Default content matches the hardcoded copy that lived in
 *  components/categories-section.tsx before this admin existed.
 *  Used as fallback whenever DB has nothing yet. */
export const DEFAULT_HOMEPAGE_CATEGORIES: HomepageCategoriesContent = {
  heading: {
    uk: "Що саме ми робимо",
    pl: "Co dokładnie robimy",
    en: "What we actually make",
    de: "Was wir wirklich fertigen",
    lt: "Ką mes iš tikrųjų gaminame",
  },
  memorial: {
    image: "/stones/memorial-01.svg",
    href: "/memorial/pamyatnyky",
    title: {
      uk: "Пам'ятники",
      pl: "Pomniki",
      en: "Monuments",
      de: "Grabmale",
      lt: "Paminklai",
    },
    description: {
      uk: "Меморіальні комплекси з граніту і мармуру — український і імпортний камінь. Ескіз, виготовлення, гравіювання, монтаж.",
      pl: "Kompleksy memorialne z granitu i marmuru — ukraiński oraz importowany kamień. Szkic, produkcja, grawerowanie, montaż.",
      en: "Memorial complexes in granite and marble — Ukrainian and imported stone. Design, production, engraving, installation.",
      de: "Grabmal-Komplexe aus Granit und Marmor — ukrainischer und importierter Stein. Entwurf, Fertigung, Gravur, Montage.",
      lt: "Memorialiniai kompleksai iš granito ir marmuro — ukrainietiškas ir importuotas akmuo. Eskizas, gamyba, graviravimas, montavimas.",
    },
    cta: {
      uk: "Переглянути пам'ятники",
      pl: "Zobacz pomniki",
      en: "Browse monuments",
      de: "Grabmale ansehen",
      lt: "Peržiūrėti paminklus",
    },
    items: {
      uk: ["Одиночні та парні", "Сімейні комплекси", "Хрести та обеліски", "Реставрація", "Гравіювання портретів", "Огорожі й благоустрій"],
      pl: ["Pojedyncze i podwójne", "Kompleksy rodzinne", "Krzyże i obeliski", "Renowacja", "Grawerowanie portretów", "Ogrodzenia i zagospodarowanie"],
      en: ["Single & double", "Family complexes", "Crosses & obelisks", "Restoration", "Portrait engraving", "Borders & landscaping"],
      de: ["Einzel & Doppel", "Familien-Komplexe", "Kreuze & Obelisken", "Restaurierung", "Porträt-Gravur", "Einfassungen & Landschaft"],
      lt: ["Pavieniai ir poriniai", "Šeimos kompleksai", "Kryžiai ir obeliskai", "Restauravimas", "Portretų graviravimas", "Aptvarai ir sutvarkymas"],
    },
  },
}

/**
 * Defensively merge a possibly-incomplete DB value into the default shape.
 * Schemas evolve — old rows might miss new locales, etc. This guarantees
 * every required field exists with a sane fallback.
 */
/**
 * Map any historic catalogue href onto the current vertical paths.
 *
 * Admin-editable rows in Supabase still hold links written before the split
 * (`/catalog`, `/kataloh`, `/kataloh?cat=home`). next.config.mjs redirects all
 * of them, but a homepage tile that costs every visitor a 308 is a wasted hop
 * and a wasted crawl budget — rewrite them at read time.
 */
function normalizeCategoryHref(href: string): string {
  // Includes ?cat=home: the "Дім і сад" line is discontinued, so a saved link
  // to it now points at the monuments catalogue rather than a dead route.
  if (/^\/(catalog|kataloh)(?=$|[/?#])/.test(href)) return "/memorial/pamyatnyky"
  if (/^\/stone(?=$|[/?#])/.test(href)) return "/memorial/pamyatnyky"
  return href
}

function mergeWithDefault(raw: unknown): HomepageCategoriesContent {
  if (!raw || typeof raw !== "object") return DEFAULT_HOMEPAGE_CATEGORIES
  const r = raw as Partial<HomepageCategoriesContent>
  const mergeCard = (
    db: Partial<HomepageCategoryCard> | undefined,
    fallback: HomepageCategoryCard
  ): HomepageCategoryCard => ({
    image: db?.image || fallback.image,
    // Legacy CMS rows may still hold /catalog or /kataloh?cat=… — normalize to
    // the vertical paths so the homepage links land directly (no 308 hop).
    href: normalizeCategoryHref(db?.href || fallback.href),
    title: { ...fallback.title, ...(db?.title || {}) },
    description: { ...fallback.description, ...(db?.description || {}) },
    cta: { ...fallback.cta, ...(db?.cta || {}) },
    items: { ...fallback.items, ...(db?.items || {}) },
  })
  return {
    heading: { ...DEFAULT_HOMEPAGE_CATEGORIES.heading, ...(r.heading || {}) },
    memorial: mergeCard(r.memorial, DEFAULT_HOMEPAGE_CATEGORIES.memorial),
    // `home` is intentionally dropped, not merged — the card is discontinued,
    // so a stale DB row must not resurrect it on the homepage.
  }
}

interface HomepageState {
  content: HomepageCategoriesContent
  hasHydrated: boolean
  loading: boolean
  saving: boolean
  hydrate: () => Promise<void>
  save: (next: HomepageCategoriesContent) => Promise<{ ok: boolean; error?: string }>
}

export const useHomepageStore = create<HomepageState>()((set, get) => ({
  content: DEFAULT_HOMEPAGE_CATEGORIES,
  hasHydrated: false,
  loading: false,
  saving: false,

  hydrate: async () => {
    if (get().hasHydrated || get().loading) return
    set({ loading: true })
    try {
      const res = await fetch("/api/content/singleton/homepage_categories", {
        cache: "no-store",
      })
      const json = res.ok ? await res.json() : { data: null }
      set({
        content: mergeWithDefault(json?.data),
        hasHydrated: true,
      })
    } catch {
      set({ hasHydrated: true })
    } finally {
      set({ loading: false })
    }
  },

  save: async (next) => {
    const prev = get().content
    set({ content: next, saving: true })
    try {
      const res = await authedFetch("/api/content/singleton/homepage_categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: next }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        set({ content: prev })
        return { ok: false, error: j?.error || `HTTP ${res.status}` }
      }
      return { ok: true }
    } catch (e) {
      set({ content: prev })
      return { ok: false, error: e instanceof Error ? e.message : "network" }
    } finally {
      set({ saving: false })
    }
  },
}))

/**
 * Public hook used by `components/categories-section.tsx`.
 * Returns the merged content; hydrates on first mount.
 */
export function useHomepageCategories(): HomepageCategoriesContent {
  const content = useHomepageStore((s) => s.content)
  const hydrate = useHomepageStore((s) => s.hydrate)
  useEffect(() => {
    hydrate()
  }, [hydrate])
  return content
}
