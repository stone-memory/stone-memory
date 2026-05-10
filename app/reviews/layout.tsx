import type { Metadata } from "next"
import { fetchReviews } from "@/lib/data-source"

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://stonememory.com.ua"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Reviews — what clients say about Stone Memory",
  description:
    "Real client reviews about Stone Memory — granite monuments, marble countertops, fireplaces, stairs and paving. 5-year warranty, craft-level workshop in Kostopil.",
  alternates: {
    canonical: `${SITE}/reviews`,
    languages: {
      "x-default": `${SITE}/reviews`,
      en: `${SITE}/reviews?lang=en`,
      uk: `${SITE}/reviews?lang=uk`,
      pl: `${SITE}/reviews?lang=pl`,
      de: `${SITE}/reviews?lang=de`,
      lt: `${SITE}/reviews?lang=lt`,
    },
  },
  openGraph: {
    title: "Stone Memory — Reviews",
    description: "What our clients say about us — granite monuments, countertops, stairs and more.",
    url: `${SITE}/reviews`,
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
    "@id": `${SITE}/#organization-with-rating`,
    name: "Stone Memory",
    url: SITE,
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
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Reviews", item: `${SITE}/reviews` },
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
