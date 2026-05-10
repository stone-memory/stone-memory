"use client"

import { useFaqItems } from "@/lib/store/faq"
import { useTranslation } from "@/lib/i18n/context"

/**
 * @deprecated Use server-side `faqPageSchema()` from `@/lib/seo/schemas/faqPage` instead.
 *
 * Why: client-rendered structured data is unreliable — Googlebot may crawl
 * the HTML before this script runs, missing the FAQ schema entirely.
 * The home page (`app/page.tsx`) now emits the schema server-side from
 * `fetchFaqItems()`.
 *
 * Kept for backward compatibility. Safe to delete after verifying server-side
 * schema is present in production HTML (search for `"@type":"FAQPage"`).
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
