"use client"

import { authedFetch } from "@/lib/authed-fetch"

import { useEffect } from "react"
import { create } from "zustand"
import type { Locale } from "@/lib/types"

export type Badge = { label: string; icon: "award" | "shield" | "users" | "truck" }

export type AboutContent = {
  heading: string
  paragraphs: string[]
  photo: string
  photoAlt: string
  badges: Badge[]
}

export const defaultAbout: Record<Locale, AboutContent> = {
  uk: {
    heading: "Про Stone Memory",
    paragraphs: [
      "Stone Memory — виробництво виробів з натурального каменю у Костополі на Рівненщині. Дві рівноцінні лінії: меморіальні комплекси та вироби для дому й саду — стільниці, підвіконня, каміни, сходи, бруківка.",
      "Працюємо з українським гранітом і мармуром, а також з імпортними породами — італійський мармур, індійський і китайський граніт, бразильський кварцит. Підбираємо матеріал під проект і бюджет.",
      "Робимо акуратно, без поспіху, з повагою до матеріалу і клієнта. Даємо 5 років гарантії на все — фундамент, монтаж і сам камінь. Особистий менеджер від запиту до встановлення.",
    ],
    photo: "/services/hero.jpg",
    photoAlt: "Stone Memory — цех",
    badges: [
      { label: "Власне виробництво", icon: "users" },
      { label: "5 років гарантії", icon: "shield" },
      { label: "Монтаж по всій Україні", icon: "truck" },
    ],
  },
  pl: {
    heading: "O Stone Memory",
    paragraphs: [
      "Stone Memory to wytwórnia wyrobów z kamienia naturalnego w mieście Kostopol na Rówieńszczyźnie. Dwie równoważne linie: kompleksy memorialne oraz wyroby dla domu i ogrodu — blaty, parapety, kominki, schody, kostka brukowa.",
      "Pracujemy z ukraińskim granitem i marmurem oraz z gatunkami importowanymi — marmur włoski, granit indyjski i chiński, kwarcyt brazylijski. Dobieramy materiał pod projekt i budżet.",
      "Robimy starannie, bez pośpiechu, z szacunkiem do materiału i klienta. Dajemy 5 lat gwarancji na wszystko — fundament, montaż i sam kamień. Osobisty menedżer od zapytania do montażu.",
    ],
    photo: "/services/hero.jpg",
    photoAlt: "Stone Memory — zakład",
    badges: [
      { label: "Własna produkcja", icon: "users" },
      { label: "5 lat gwarancji", icon: "shield" },
      { label: "Montaż w całej Ukrainie", icon: "truck" },
    ],
  },
  en: {
    heading: "About Stone Memory",
    paragraphs: [
      "Stone Memory is a natural-stone workshop in Kostopil, Rivne region. Two equal product lines: memorial complexes and pieces for home and garden — countertops, window sills, fireplaces, stairs, paving.",
      "We work with Ukrainian granite and marble as well as imported varieties — Italian marble, Indian and Chinese granite, Brazilian quartzite. We pick the material to match the project and the budget.",
      "We work carefully and without rush, with respect to the material and to the client. Five-year warranty on everything — foundation, installation and the stone itself. A dedicated manager from enquiry to installation.",
    ],
    photo: "/services/hero.jpg",
    photoAlt: "Stone Memory workshop",
    badges: [
      { label: "In-house production", icon: "users" },
      { label: "5-year warranty", icon: "shield" },
      { label: "Installation across Ukraine", icon: "truck" },
    ],
  },
  de: {
    heading: "Über Stone Memory",
    paragraphs: [
      "Stone Memory ist eine Naturstein-Werkstatt in Kostopil, Oblast Riwne. Zwei gleichwertige Linien: Grabmal-Komplexe und Stücke für Haus und Garten — Arbeitsplatten, Fensterbänke, Kamine, Treppen, Pflaster.",
      "Wir arbeiten mit ukrainischem Granit und Marmor sowie mit Importsorten — italienischer Marmor, indischer und chinesischer Granit, brasilianischer Quarzit. Wir wählen das Material nach Projekt und Budget.",
      "Wir arbeiten sorgfältig und ohne Eile, mit Respekt vor Material und Kunde. 5 Jahre Garantie auf alles — Fundament, Montage und den Stein. Persönlicher Manager von der Anfrage bis zur Montage.",
    ],
    photo: "/services/hero.jpg",
    photoAlt: "Stone Memory Werkstatt",
    badges: [
      { label: "Eigene Produktion", icon: "users" },
      { label: "5 Jahre Garantie", icon: "shield" },
      { label: "Montage in der ganzen Ukraine", icon: "truck" },
    ],
  },
  lt: {
    heading: "Apie Stone Memory",
    paragraphs: [
      "Stone Memory — natūralaus akmens gaminių dirbtuvė Kostopilyje, Rivnės srityje. Dvi lygiavertės linijos: memorialiniai kompleksai ir gaminiai namams bei sodui — stalviršiai, palangės, židiniai, laiptai, grindinio akmenys.",
      "Dirbame su ukrainietišku granitu ir marmuru bei importuotomis rūšimis — italų marmuru, Indijos ir Kinijos granitu, Brazilijos kvarcitu. Medžiagą parenkame pagal projektą ir biudžetą.",
      "Dirbame kruopščiai, be skubos, gerbdami medžiagą ir klientą. 5 metų garantija viskam — pamatui, montavimui ir pačiam akmeniui. Asmeninis vadybininkas nuo užklausos iki montavimo.",
    ],
    photo: "/services/hero.jpg",
    photoAlt: "Stone Memory dirbtuvė",
    badges: [
      { label: "Nuosava gamyba", icon: "users" },
      { label: "5 m. garantija", icon: "shield" },
      { label: "Montavimas visoje Ukrainoje", icon: "truck" },
    ],
  },
}

type Overrides = Partial<Record<Locale, Partial<AboutContent>>>

interface AboutState {
  overrides: Overrides
  hasHydrated: boolean
  loading: boolean
  hydrate: () => Promise<void>
  setOverride: (locale: Locale, patch: Partial<AboutContent>) => Promise<void>
  resetLocale: (locale: Locale) => Promise<void>
}

async function putOverrides(overrides: Overrides) {
  const res = await authedFetch("/api/content/singleton/about_overrides", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: overrides }),
  })
  if (!res.ok) throw new Error("about put failed")
}

export const useAboutStore = create<AboutState>()((set, get) => ({
  overrides: {},
  hasHydrated: false,
  loading: false,

  hydrate: async () => {
    if (get().hasHydrated || get().loading) return
    set({ loading: true })
    try {
      const res = await fetch("/api/content/singleton/about_overrides", { cache: "no-store" })
      const json = await res.json()
      if (res.ok && json.data && typeof json.data === "object") {
        set({ overrides: json.data as Overrides, hasHydrated: true })
      } else {
        set({ hasHydrated: true })
      }
    } catch {
      set({ hasHydrated: true })
    } finally {
      set({ loading: false })
    }
  },

  setOverride: async (locale, patch) => {
    const prev = get().overrides
    const next: Overrides = {
      ...prev,
      [locale]: { ...(prev[locale] || {}), ...patch },
    }
    set({ overrides: next })
    try {
      await putOverrides(next)
    } catch {
      set({ overrides: prev })
    }
  },

  resetLocale: async (locale) => {
    const prev = get().overrides
    const next = { ...prev }
    delete next[locale]
    set({ overrides: next })
    try {
      await putOverrides(next)
    } catch {
      set({ overrides: prev })
    }
  },
}))

export function useAbout(locale: Locale): AboutContent {
  const overrides = useAboutStore((s) => s.overrides)
  const hasHydrated = useAboutStore((s) => s.hasHydrated)
  const hydrate = useAboutStore((s) => s.hydrate)
  useEffect(() => {
    hydrate()
  }, [hydrate])
  if (!hasHydrated) return defaultAbout[locale]
  const o = overrides[locale]
  if (!o) return defaultAbout[locale]
  return { ...defaultAbout[locale], ...o }
}
