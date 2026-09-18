"use client"

import { useTranslation } from "@/lib/i18n/context"
import { stoneT, type StoneT } from "@/lib/i18n/stone"
import type { Locale } from "@/lib/types"

/** Перекладач розділу для клієнтських компонентів: мова з LanguageProvider. */
export function useStoneT(): { locale: Locale; t: StoneT } {
  const { locale } = useTranslation()
  return { locale, t: stoneT(locale) }
}
