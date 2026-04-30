"use client"

import { useTranslation } from "@/lib/i18n/context"
import type { Locale } from "@/lib/types"

const labels: Record<Locale, string> = {
  uk: "Перейти до основного вмісту",
  pl: "Przejdź do głównej treści",
  en: "Skip to main content",
  de: "Zum Hauptinhalt springen",
  lt: "Pereiti prie pagrindinio turinio",
}

export function SkipLink() {
  const { locale } = useTranslation()
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-xl focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-background focus:shadow-hover focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-foreground"
    >
      {labels[locale] || labels.uk}
    </a>
  )
}
