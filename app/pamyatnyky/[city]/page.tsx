import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CityContent } from "@/components/info/city-content"
import { fetchBusinessProfile, fetchStones } from "@/lib/data-source"
import { phoneE164, telHref } from "@/lib/business-profile"
import { MEMORIAL_FACETS, facetItems } from "@/lib/catalog-taxonomy"
import { productType } from "@/lib/product-copy"
import { CITIES, LEAD_TIMES, WARRANTY_YEARS, cityBySlug } from "@/lib/site-facts"
import { FACTS } from "@/lib/i18n/copy/facts"
import { CITY_COPY } from "@/lib/i18n/copy/pages/city"
import { SITE_URL, absoluteUrl } from "@/lib/site-config"
import type { StoneItem } from "@/lib/types"

export const revalidate = 86400
export const dynamicParams = false

type Params = { city: string }

export function generateStaticParams(): Params[] {
  return CITIES.map((c) => ({ city: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { city: slug } = await params
  const city = cityBySlug(slug)
  if (!city) return { title: "Сторінку не знайдено", robots: { index: false, follow: false } }
  const url = absoluteUrl(`/pamyatnyky/${city.slug}`)
  const title = `Пам'ятники ${city.inCity} — від виробника, з монтажем`
  const description = `Пам'ятники з граніту ${city.inCity} від майстерні з Костополя: одинарні, подвійні, хрести, комплекси, військові. ${
    city.freeTravel ? "Замір і монтаж безкоштовно" : `Доставка ${city.distanceKm} км за пробігом`
  }, виготовлення ${LEAD_TIMES.single}, гарантія ${WARRANTY_YEARS} років.`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${title} — Stone Memory`, description, url, type: "website", images: ["/opengraph-image"] },
  }
}

function minPrice(items: StoneItem[]) {
  const p = items.map((s) => s.priceFrom).filter((x): x is number => typeof x === "number" && x > 0)
  return p.length ? Math.min(...p) : null
}

/**
 * Сервер збирає числа й вибірку моделей, клієнтський CityContent рендерить
 * тексти за мовою (lib/i18n/copy/pages/city.ts). JSON-LD — українською.
 */
export default async function CityPage({ params }: { params: Promise<Params> }) {
  const profile = await fetchBusinessProfile()
  const { city: slug } = await params
  const city = cityBySlug(slug)
  if (!city) notFound()

  const stones = await fetchStones()
  const monuments = stones.filter((s) => s.category === "memorial")
  const single = monuments.filter((s) => productType(s) === "single")
  const complex = monuments.filter((s) => productType(s) === "complex")
  const military = monuments.filter((s) => productType(s) === "military")

  // Шість робіт різних типів: людина має побачити діапазон, а не шість схожих.
  const byType = new Map<string, StoneItem[]>()
  for (const s of monuments) {
    const t = productType(s)
    byType.set(t, [...(byType.get(t) ?? []), s])
  }
  const picks: StoneItem[] = []
  for (const t of ["single", "complex", "military", "double", "cross", "european", "child"]) {
    const list = byType.get(t) ?? []
    const featured = list.find((s) => s.isFeatured) ?? list[0]
    if (featured) picks.push(featured)
    if (picks.length === 6) break
  }

  const facets = MEMORIAL_FACETS.map((f) => ({ slug: f.slug, h1: f.h1, count: facetItems(stones, f).length })).filter((f) => f.count > 0)
  const uk = CITY_COPY.uk(FACTS.uk, { ...FACTS.uk.cities[city.slug], slug: city.slug, distanceKm: city.distanceKm, freeTravel: city.freeTravel })

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `Виготовлення та встановлення пам'ятників ${city.inCity}`,
      serviceType: "Пам'ятники з граніту",
      provider: { "@type": "LocalBusiness", "@id": `${SITE_URL}/#localbusiness`, name: "Stone Memory", telephone: phoneE164(profile) },
      areaServed: { "@type": "City", name: city.name },
      url: absoluteUrl(`/pamyatnyky/${city.slug}`),
      ...(minPrice(single)
        ? { offers: { "@type": "Offer", priceCurrency: "UAH", price: minPrice(single), description: "Одинарний пам'ятник із монтажем" } }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: uk.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Головна", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: `Пам'ятники ${city.inCity}`, item: absoluteUrl(`/pamyatnyky/${city.slug}`) },
      ],
    },
  ]

  return (
    <>
      {schema.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <CityContent
        slug={city.slug}
        picks={picks}
        singleMin={minPrice(single)}
        complexMin={minPrice(complex)}
        militaryCount={military.length}
        militaryMin={minPrice(military)}
        facets={facets}
        phone={profile.phone}
        telHref={telHref(profile)}
      />
    </>
  )
}
