import type { Metadata } from "next"
import { fetchReviews } from "@/lib/data-source"
import { SITE_URL, absoluteUrl } from "@/lib/site-config"

const PATH = "/reviews"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Відгуки — що кажуть клієнти Stone Memory",
  description:
    "Реальні відгуки клієнтів Stone Memory — гранітні пам'ятники, мармурові стільниці, каміни, сходи та бруківка. Гарантія 5 років, майстерня в Костополі.",
  alternates: {
    canonical: absoluteUrl(PATH),
    languages: {
      "x-default": absoluteUrl(PATH),
      en: `${absoluteUrl(PATH)}?lang=en`,
      uk: `${absoluteUrl(PATH)}?lang=uk`,
      pl: `${absoluteUrl(PATH)}?lang=pl`,
      de: `${absoluteUrl(PATH)}?lang=de`,
      lt: `${absoluteUrl(PATH)}?lang=lt`,
    },
  },
  openGraph: {
    title: "Stone Memory — Відгуки",
    description: "Що кажуть про нас клієнти — гранітні пам'ятники, стільниці, сходи та інше.",
    url: absoluteUrl(PATH),
    type: "website",
  },
}

type ReviewData = { name?: string; text?: string; rating?: number; date?: string }

export default async function Layout({ children }: { children: React.ReactNode }) {
  const rows = await fetchReviews("all")
  const reviews = rows.map((r) => r.data as ReviewData)
  const rated = reviews.filter((r) => typeof r.rating === "number")
  const avg = rated.length
    ? rated.reduce((sum, r) => sum + (r.rating ?? 0), 0) / rated.length
    : 0

  // Attach aggregated rating to the Organization — this is what Google uses
  // for the stars next to the company name in search results.
  const orgWithRating = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization-with-rating`,
    name: "Stone Memory",
    url: SITE_URL,
    ...(rated.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: Number(avg.toFixed(1)),
        reviewCount: rated.length,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    review: reviews.slice(0, 20).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.name || "Клієнт" },
      datePublished: r.date,
      reviewBody: r.text,
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating ?? 5,
        bestRating: 5,
        worstRating: 1,
      },
    })),
  }

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Reviews", item: absoluteUrl(PATH) },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgWithRating) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  )
}
