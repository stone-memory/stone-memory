/**
 * Reusable FAQPage Schema.org JSON-LD generator.
 *
 * Use this server-side (in a server component / generateMetadata / layout).
 * Client-side rendering of structured data is unreliable — Googlebot may
 * crawl the HTML before the script runs, missing the schema entirely.
 *
 * Usage:
 *
 *   const faqs = await fetchFaqItems()
 *   const schema = faqPageSchema(faqs.map(f => ({ question: f.q, answer: f.a })))
 *   return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
 */

export type FAQ = {
  question: string
  answer: string
}

export function faqPageSchema(faqs: FAQ[], inLanguage?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(inLanguage ? { inLanguage } : {}),
    mainEntity: faqs
      .filter((f) => f.question?.trim() && f.answer?.trim())
      .map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.answer,
        },
      })),
  }
}
