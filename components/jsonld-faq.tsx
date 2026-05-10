"use client"

import { useFaqItems } from "@/lib/store/faq"
import { useTranslation } from "@/lib/i18n/context"

/**
 * Emits FAQPage JSON-LD for the store-backed FAQ on the main page.
 * Mounted via the home page layout so Google picks up rich FAQ snippets.
 */
export function FaqJsonLd() {
  const { locale } = useTranslation()
  const items = useFaqItems()
  if (!items.length) return null
  const json = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q[locale] || i.q.uk,
      acceptedAnswer: {
        "@type": "Answer",
        text: i.a[locale] || i.a.uk,
      },
    })),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  )
}
