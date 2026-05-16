import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { CategoriesSection } from "@/components/categories-section"
import { FeaturedStones } from "@/components/featured-stones"
import { ReviewsSection } from "@/components/reviews-section"
import { FaqSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"
import { SelectionSidebar } from "@/components/selection-sidebar"
import { fetchFaqItems } from "@/lib/data-source"
import { seedFaq } from "@/lib/data/seeds"
import { faqPageSchema } from "@/lib/seo/schemas/faqPage"
import type { Locale } from "@/lib/types"

// ISR: re-render FAQ schema every minute so admin edits propagate quickly.
// Page itself is static-friendly except for the FAQ fetch.
export const revalidate = 60

type FaqRow = { id: string; data: unknown; order: number }
type FaqShape = {
  q?: Record<Locale, string>
  a?: Record<Locale, string>
}

/**
 * Server-side fetch FAQ for JSON-LD schema. Locale is currently 'uk' (primary
 * audience). When we migrate to /[locale] segments, this moves into per-locale
 * layouts and the locale becomes dynamic.
 */
async function getHomeFaqs() {
  const rows = (await fetchFaqItems()) as FaqRow[]
  const source = rows.length > 0 ? rows.map((r) => r.data as FaqShape) : seedFaq
  return source
    .filter((f) => f.q?.uk && f.a?.uk)
    .map((f) => ({ question: f.q!.uk, answer: f.a!.uk }))
}

export default async function Home() {
  const faqs = await getHomeFaqs()
  const faqSchema = faqPageSchema(faqs, "uk")

  return (
    <>
      <Header />
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            // Escape `<` to prevent any HTML-injection from FAQ content
            __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <main id="main-content" className="relative">
        <Hero />
        <CategoriesSection />
        <FeaturedStones />
        <ReviewsSection />
        <FaqSection />
      </main>
      <Footer />
      <SelectionSidebar />
    </>
  )
}
