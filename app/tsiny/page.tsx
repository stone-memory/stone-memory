import type { Metadata } from "next"
import { PricesContent, type FacetLink, type PriceRow } from "@/components/info/prices-content"
import { fetchStones } from "@/lib/data-source"
import { MEMORIAL_FACETS, facetItems, catalogPagePath } from "@/lib/catalog-taxonomy"
import { productType, type ProductType } from "@/lib/product-copy"
import { FACTS } from "@/lib/i18n/copy/facts"
import { PRICES_COPY } from "@/lib/i18n/copy/pages/prices"
import { absoluteUrl } from "@/lib/site-config"
import type { StoneItem } from "@/lib/types"

const PATH = "/tsiny"
export const revalidate = 86400

export const metadata: Metadata = {
  title: "Ціни на пам'ятники — від виробника, з монтажем",
  description:
    "Скільки коштує пам'ятник з граніту: одинарний, подвійний, хрест, дитячий, комплекс, військовий. Ціни від виробника з фундаментом і монтажем. Гравіювання, фотокераміка, огорожа — прайс.",
  alternates: { canonical: absoluteUrl(PATH) },
  openGraph: {
    title: "Ціни на пам'ятники — Stone Memory",
    description: "Ціни на всі типи пам'ятників і послуги: гравіювання, фотокераміка, огорожа, облицювання. Від виробника з Костополя.",
    url: absoluteUrl(PATH),
    type: "website",
    images: ["/opengraph-image"],
  },
}

/** Порядок рядків таблиці і фасет каталогу для кожного типу; підписи — у словнику сторінки. */
const TYPE_ORDER: { type: ProductType; facet: string; lead: PriceRow["lead"] }[] = [
  { type: "single", facet: "odynochni", lead: "single" },
  { type: "double", facet: "podviyni", lead: "double" },
  { type: "european", facet: "yevropeiski", lead: "single" },
  { type: "cross", facet: "khresty", lead: "cross" },
  { type: "child", facet: "dytyachi", lead: "child" },
  { type: "complex", facet: "kompleksy", lead: "complex" },
  { type: "military", facet: "viyskovi", lead: "military" },
]

function stats(items: StoneItem[]) {
  const prices = items.map((s) => s.priceFrom).filter((p): p is number => typeof p === "number" && p > 0).sort((a, b) => a - b)
  if (prices.length === 0) return null
  return { min: prices[0], median: prices[Math.floor(prices.length / 2)], max: prices[prices.length - 1], n: prices.length }
}

/**
 * Сервер рахує статистику цін і передає числа; тексти й валюта — у
 * клієнтському PricesContent за мовою відвідувача. JSON-LD — українською.
 */
export default async function PricesPage() {
  const stones = await fetchStones()
  const monuments = stones.filter((s) => s.category === "memorial")

  const rows: PriceRow[] = TYPE_ORDER.flatMap((t) => {
    const st = stats(monuments.filter((s) => productType(s) === t.type))
    return st ? [{ ...t, ...st }] : []
  })

  const overall = stats(monuments)
  const facets: FacetLink[] = MEMORIAL_FACETS.map((f) => ({ slug: f.slug, h1: f.h1, count: facetItems(stones, f).length })).filter((f) => f.count > 0)

  const uk = PRICES_COPY.uk(FACTS.uk)
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: uk.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  }
  const offers = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "Ціни на пам'ятники Stone Memory",
    url: absoluteUrl(PATH),
    itemListElement: rows.map((r) => ({
      "@type": "Offer",
      name: uk.types[r.type].label,
      priceCurrency: "UAH",
      price: r.min,
      priceSpecification: { "@type": "PriceSpecification", minPrice: r.min, maxPrice: r.max, priceCurrency: "UAH" },
      url: absoluteUrl(catalogPagePath(r.facet, 1)),
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offers) }} />
      <PricesContent rows={rows} overallMin={overall?.min ?? null} facets={facets} />
    </>
  )
}
