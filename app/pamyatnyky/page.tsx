import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SelectionSidebar } from "@/components/selection-sidebar"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { ConsultButton } from "@/components/consult-button"
import { FeaturedStones } from "@/components/featured-stones"
import { ReviewsSection } from "@/components/reviews-section"
import { FaqSection } from "@/components/faq-section"
import { CtaBand } from "@/components/info-page"
import { HomeCollections, HomeNumbers, HomeProcess, HomeRegions, HomeShowcase } from "@/components/home-sections"
import { fetchFaqItems, fetchReviews, fetchStones } from "@/lib/data-source"
import { seedFaq } from "@/lib/data/seeds"
import { faqPageSchema } from "@/lib/seo/schemas/faqPage"
import { absoluteUrl } from "@/lib/site-config"
import type { FaqItem } from "@/lib/store/faq"
import type { Review } from "@/lib/store/reviews"

const PATH = "/pamyatnyky"
export const revalidate = 60

export const metadata: Metadata = {
  title: "Пам'ятники з граніту від виробника — Костопіль, монтаж по Україні",
  description:
    "Одинарні й подвійні пам'ятники, хрести, дитячі, військові, меморіальні комплекси. Власний цех у Костополі, український граніт, габро й лабрадорит. Ціни від 17 500 ₴ з монтажем, гарантія 5 років.",
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
          <Breadcrumbs items={[{ name: "Пам'ятники" }]} />
        </div>
        <section className="mx-auto max-w-7xl px-6 pt-6 md:pt-8">
          <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Меморіальний напрям
          </span>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight-custom md:text-6xl text-balance">
            Пам'ятники з граніту від виробника
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground text-balance md:text-lg">
            Одинарні й подвійні пам'ятники, хрести, дитячі та військові, меморіальні комплекси під ключ.
            Український граніт, габро й лабрадорит, власний цех у Костополі, монтаж по всій Україні.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/memorial/pamyatnyky"
              prefetch
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:-translate-y-[1px]"
            >
              Переглянути каталог
            </Link>
            <Link
              href="/tsiny"
              prefetch
              className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-6 py-3 text-sm font-medium transition-colors hover:bg-foreground/5"
            >
              Ціни
            </Link>
            <ConsultButton variant="secondary">Отримати розрахунок</ConsultButton>
          </div>
        </section>

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
