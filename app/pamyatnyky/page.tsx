import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SelectionSidebar } from "@/components/selection-sidebar"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { HubIntro } from "@/components/hub-intro"
import { FeaturedStones } from "@/components/featured-stones"
import { ReviewsSection } from "@/components/reviews-section"
import { FaqSection } from "@/components/faq-section"
import { CtaBand } from "@/components/info-page"
import { HUB_COPY } from "@/lib/i18n/copy/hub"
import { HomeCollections, HomeNumbers, HomeProcess, HomeRegions, HomeShowcase } from "@/components/home-sections"
import { fetchFaqItems, fetchReviews, fetchStones } from "@/lib/data-source"
import { seedFaq } from "@/lib/data/seeds"
import { faqPageSchema } from "@/lib/seo/schemas/faqPage"
import { absoluteUrl } from "@/lib/site-config"
import type { FaqItem } from "@/lib/store/faq"
import type { Review } from "@/lib/store/reviews"

const PATH = "/pamyatnyky"
// Крихта за мовою: Breadcrumbs — клієнтський і сам обере переклад.
const HUB_CRUMB = { uk: HUB_COPY.uk.intro.crumb, pl: HUB_COPY.pl.intro.crumb, en: HUB_COPY.en.intro.crumb, de: HUB_COPY.de.intro.crumb, lt: HUB_COPY.lt.intro.crumb }
export const revalidate = 86400

export const metadata: Metadata = {
  title: "Пам'ятники з граніту від виробника — Костопіль, монтаж по Україні",
  description:
    "Одинарні й подвійні пам'ятники, хрести, дитячі, військові, меморіальні комплекси. Власний цех у Костополі, український граніт, габро й лабрадорит. Ціни від 17 500 ₴ з монтажем, гарантія 5 років.",
  alternates: { canonical: absoluteUrl(PATH) },
  openGraph: {
    title: "Пам'ятники з граніту від виробника — Stone Memory",
    description: "Каталог, ціни, доставка й монтаж по Україні. Виготовлення в Костополі.",
    url: absoluteUrl(PATH),
    type: "website",
    images: ["/opengraph-image"],
  },
}

type FaqRow = { id: string; data: unknown; order: number }

async function getFaqs(): Promise<FaqItem[]> {
  const rows = (await fetchFaqItems()) as FaqRow[]
  const source: FaqItem[] =
    rows.length > 0
      ? rows.map((r) => ({ ...(r.data as Omit<FaqItem, "id" | "order">), id: r.id, order: r.order }))
      : seedFaq.map((f) => ({ id: f.id, order: f.order, q: f.q, a: f.a }))
  return source.filter((f) => f.q?.uk && f.a?.uk).sort((a, b) => a.order - b.order)
}

/**
 * Хаб меморіального напряму.
 *
 * Головна сторінка тепер лише розгалужує на два напрями, тому все, що
 * стосується пам'ятників (підбірки з цінами, процес, міста, роботи, відгуки,
 * FAQ), зібрано тут. Каталог — рівнем нижче, /memorial/pamyatnyky.
 */
export default async function MemorialHubPage() {
  const [stones, faqs, reviewRows] = await Promise.all([fetchStones(), getFaqs(), fetchReviews("home")])
  const reviews = reviewRows.map((r) => r.data as Review)
  const faqSchema = faqPageSchema(faqs.map((f) => ({ question: f.q.uk, answer: f.a.uk })), "uk")
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Головна", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Пам'ятники", item: absoluteUrl(PATH) },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }}
        />
      )}
      <Header />
      <main id="main-content">
        <div className="mx-auto max-w-7xl px-6 pt-6">
          <Breadcrumbs items={[{ name: HUB_CRUMB }]} />
        </div>
        <HubIntro />

        <HomeNumbers stones={stones} />
        <HomeCollections stones={stones} />
        <HomeProcess />
        <FeaturedStones />
        <HomeShowcase stones={stones} />
        <HomeRegions />
        <ReviewsSection initialReviews={reviews} />
        <FaqSection initialItems={faqs} limit={6} />
        <CtaBand />
      </main>
      <Footer />
      <SelectionSidebar />
    </>
  )
}
