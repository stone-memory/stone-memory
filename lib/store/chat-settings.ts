"use client"

import { useEffect } from "react"
import { create } from "zustand"
import { authedFetch } from "@/lib/authed-fetch"
import type { Locale } from "@/lib/types"
import { botCopy, matchFaq } from "@/lib/chat-bot"

export type QuickReply = { id: string; label: string; answer: string; order: number }

export const defaultQuickReplies: Record<Locale, QuickReply[]> = {
  uk: [
    { id: "q-price", label: "Скільки коштує?", answer: botCopy.uk.quickReplies[0].a, order: 1 },
    { id: "q-term", label: "Термін виготовлення", answer: botCopy.uk.quickReplies[1].a, order: 2 },
    { id: "q-install", label: "Монтаж і доставка", answer: botCopy.uk.quickReplies[2].a, order: 3 },
    { id: "q-warr", label: "Гарантія", answer: botCopy.uk.quickReplies[3].a, order: 4 },
    { id: "q-mat", label: "Які матеріали", answer: botCopy.uk.quickReplies[4].a, order: 5 },
    { id: "q-measure", label: "Безкоштовний замір", answer: botCopy.uk.quickReplies[6].a, order: 6 },
  ],
  pl: [
    { id: "q-price", label: "Ile kosztuje?", answer: botCopy.pl.quickReplies[0].a, order: 1 },
    { id: "q-term", label: "Termin", answer: botCopy.pl.quickReplies[1].a, order: 2 },
    { id: "q-install", label: "Montaż i dostawa", answer: botCopy.pl.quickReplies[2].a, order: 3 },
    { id: "q-warr", label: "Gwarancja", answer: botCopy.pl.quickReplies[3].a, order: 4 },
    { id: "q-mat", label: "Materiały", answer: botCopy.pl.quickReplies[4].a, order: 5 },
    { id: "q-measure", label: "Darmowy pomiar", answer: botCopy.pl.quickReplies[6].a, order: 6 },
  ],
  en: [
    { id: "q-price", label: "How much?", answer: botCopy.en.quickReplies[0].a, order: 1 },
    { id: "q-term", label: "Lead time", answer: botCopy.en.quickReplies[1].a, order: 2 },
    { id: "q-install", label: "Install & delivery", answer: botCopy.en.quickReplies[2].a, order: 3 },
    { id: "q-warr", label: "Warranty", answer: botCopy.en.quickReplies[3].a, order: 4 },
    { id: "q-mat", label: "Materials", answer: botCopy.en.quickReplies[4].a, order: 5 },
    { id: "q-measure", label: "Free measurement", answer: botCopy.en.quickReplies[6].a, order: 6 },
  ],
  de: [
    { id: "q-price", label: "Wie viel?", answer: botCopy.de.quickReplies[0].a, order: 1 },
    { id: "q-term", label: "Lieferzeit", answer: botCopy.de.quickReplies[1].a, order: 2 },
    { id: "q-install", label: "Montage & Lieferung", answer: botCopy.de.quickReplies[2].a, order: 3 },
    { id: "q-warr", label: "Garantie", answer: botCopy.de.quickReplies[3].a, order: 4 },
    { id: "q-mat", label: "Materialien", answer: botCopy.de.quickReplies[4].a, order: 5 },
    { id: "q-measure", label: "Kostenloses Aufmaß", answer: botCopy.de.quickReplies[6].a, order: 6 },
  ],
  lt: [
    { id: "q-price", label: "Kiek kainuoja?", answer: botCopy.lt.quickReplies[0].a, order: 1 },
    { id: "q-term", label: "Terminas", answer: botCopy.lt.quickReplies[1].a, order: 2 },
    { id: "q-install", label: "Montavimas", answer: botCopy.lt.quickReplies[2].a, order: 3 },
    { id: "q-warr", label: "Garantija", answer: botCopy.lt.quickReplies[3].a, order: 4 },
    { id: "q-mat", label: "Medžiagos", answer: botCopy.lt.quickReplies[4].a, order: 5 },
    { id: "q-measure", label: "Nemokamas matavimas", answer: botCopy.lt.quickReplies[6].a, order: 6 },
  ],
}

const defaultFallback: Record<Locale, string> = {
  uk: "Передав менеджеру — він зв'яжеться з вами найближчим часом. Якщо зручно — можете одразу подзвонити: +380 (67) 808 02 22.",
  pl: "Przekazałem menedżerowi — odezwie się niebawem. Jeśli wygodniej, zadzwoń: +380 (67) 808 02 22.",
  en: "Passed to a manager — they'll get back to you shortly. You can also call directly: +380 (67) 808 02 22.",
  de: "An den Manager weitergeleitet — er meldet sich in Kürze. Oder direkt anrufen: +380 (67) 808 02 22.",
  lt: "Perduota vadybininkui — jis netrukus susisieks. Galite ir paskambinti: +380 (67) 808 02 22.",
}

type Overrides = Partial<Record<Locale, { quickReplies?: QuickReply[]; fallback?: string }>>

interface ChatSettingsState {
  overrides: Overrides
  hasHydrated: boolean
  loading: boolean
  hydrate: () => Promise<void>
  setQuickReplies: (locale: Locale, replies: QuickReply[]) => Promise<void>
  setFallback: (locale: Locale, text: string) => Promise<void>
  resetLocale: (locale: Locale) => Promise<void>
}

async function putOverrides(data: Overrides) {
  const res = await authedFetch("/api/content/singleton/chat_settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  })
  if (!res.ok) throw new Error("chat_settings put failed")
}

export const useChatSettingsStore = create<ChatSettingsState>()((set, get) => ({
  overrides: {},
  hasHydrated: false,
  loading: false,

  hydrate: async () => {
    if (get().hasHydrated || get().loading) return
    set({ loading: true })
    try {
      const res = await fetch("/api/content/singleton/chat_settings", { cache: "no-store" })
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

  setQuickReplies: async (locale, replies) => {
    const prev = get().overrides
    const next: Overrides = { ...prev, [locale]: { ...(prev[locale] || {}), quickReplies: replies } }
    set({ overrides: next })
    try {
      await putOverrides(next)
    } catch {
      set({ overrides: prev })
    }
  },

  setFallback: async (locale, text) => {
    const prev = get().overrides
    const next: Overrides = { ...prev, [locale]: { ...(prev[locale] || {}), fallback: text } }
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

export function useChatSettings(locale: Locale) {
  const overrides = useChatSettingsStore((s) => s.overrides)
  const hasHydrated = useChatSettingsStore((s) => s.hasHydrated)
  const hydrate = useChatSettingsStore((s) => s.hydrate)
  useEffect(() => {
    hydrate()
  }, [hydrate])
  const o = hasHydrated ? overrides[locale] : undefined
  return {
    quickReplies: o?.quickReplies ?? defaultQuickReplies[locale],
    fallback: o?.fallback ?? defaultFallback[locale],
  }
}

export function tryMatchFaq(locale: Locale, text: string): string | null {
  const r = matchFaq(locale, text)
  return r ? r.text : null
}

export { defaultFallback }
