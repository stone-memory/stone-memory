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
      "Stone Memory — меморіальна майстерня в Костополі на Рівненщині. Виготовляємо одиночні та подвійні пам'ятники, сімейні й військові меморіальні комплекси, хрести, обеліски, надгробні плити та елементи благоустрою поховання.",
      "Працюємо з українським гранітом і габро — Головинське габро, Лезниківський, Покостівський, — а також з імпортними породами: індійський і китайський граніт. Підбираємо матеріал під проєкт і бюджет.",
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
      "Stone Memory to pracownia memorialna w Kostopolu na Rówieńszczyźnie. Wykonujemy pomniki pojedyncze i podwójne, rodzinne oraz wojskowe kompleksy memorialne, krzyże, obeliski, płyty nagrobne i elementy zagospodarowania grobu.",
      "Pracujemy z ukraińskim granitem i gabro — gabro gołowyńskie, łeznykowski, pokostiwski — oraz z gatunkami importowanymi: granit indyjski i chiński. Dobieramy materiał pod projekt i budżet.",
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
      "Stone Memory is a memorial workshop in Kostopil, Rivne region. We make single and double monuments, family and military memorial complexes, crosses, obelisks, grave slabs and grave-surround elements.",
      "We work with Ukrainian granite and gabbro — Holovyne gabbro, Leznyky, Pokostivka — as well as imported varieties: Indian and Chinese granite. We pick the material to match the project and the budget.",
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
      "Stone Memory ist eine Grabmal-Werkstatt in Kostopil, Oblast Riwne. Wir fertigen Einzel- und Doppelgrabmale, Familien- und Militär-Gedenkkomplexe, Kreuze, Obelisken, Grabplatten und Einfassungen.",
      "Wir arbeiten mit ukrainischem Granit und Gabbro — Holowyne-Gabbro, Lesnyky, Pokostiwka — sowie mit Importsorten: indischer und chinesischer Granit. Wir wählen das Material nach Projekt und Budget.",
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
      "Stone Memory — memorialinė dirbtuvė Kostopilyje, Rivnės srityje. Gaminame vienviečius ir dvivietius paminklus, šeimos bei karių memorialinius kompleksus, kryžius, obeliskus, kapo plokštes ir kapo aptvarų elementus.",
      "Dirbame su ukrainietišku granitu ir gabbru — Holovynės gabbras, Leznykai, Pokostivka — bei importuotomis rūšimis: Indijos ir Kinijos granitu. Medžiagą parenkame pagal projektą ir biudžetą.",
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
