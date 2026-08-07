import type { Metadata } from "next"
import { fetchStones, fetchStoneById } from "@/lib/data-source"
import { SITE_URL, absoluteUrl } from "@/lib/site-config"

export const revalidate = 60
export const dynamicParams = true

export async function generateStaticParams() {
  const stones = await fetchStones()
  return stones.map((s) => ({ id: s.id }))
}

type Params = { id: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params
  const s = await fetchStoneById(id)
  // page.tsx calls notFound() for this case, so the response is a real 404.
  // Kept noindex as a belt-and-braces guard in case metadata is ever resolved
  // for a route that still renders.
  if (!s) return { title: "Камінь не знайдено", robots: { index: false, follow: false } }
  const kind = s.category === "memorial" ? "Пам'ятник" : "Декоративний камінь"
  const displayName = s.name || `№ ${s.id}`
  const title = `${displayName} — ${kind}`
  // Only quote a price when there is one. priceFrom is UAH and is currently 0
  // for every row in production, which rendered a literal "Від 0 ₴" in the
  // SERP snippet on all 60 product pages.
  const priceSentence = s.priceFrom ? ` Від ${s.priceFrom.toLocaleString("uk-UA")} ₴.` : ""
  const desc = `${kind} ${displayName}. Натуральний граніт або мармур, ручна обробка у власному цеху в Костополі.${priceSentence} Гарантія 5 років.`
  const url = absoluteUrl(`/kameni/${s.id}`)
  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: desc,
      url,
      type: "website",
      images: [{ url: s.imagePath, width: 1200, height: 1500, alt: displayName }],
    },
    twitter: { card: "summary_large_image", title, description: desc, images: [s.imagePath] },
  }
}

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<Params> }) {
  const { id } = await params
  const s = await fetchStoneById(id)
  const jsonLd = s
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: s.name || `${s.category === "memorial" ? "Пам'ятник" : "Декоративний камінь"} № ${s.id}`,
        sku: s.id,
        mpn: s.id,
        image: s.gallery && s.gallery.length ? s.gallery : [s.imagePath],
        description: `${s.category === "memorial" ? "Пам'ятник" : "Виріб"} з натурального каменю №${s.id}. Ручна обробка у власному цеху в Костополі.`,
        brand: { "@type": "Brand", name: "Stone Memory" },
        category: s.category === "memorial" ? "Пам'ятники" : "Декоративний камінь",
        // Two fixes here.
        //
        // 1. Currency. priceFrom is UAH — formatPrice() in lib/i18n/context is
        //    typed `(uahAmount: number)` and the seed values are 92000, 80000…
        //    Declaring EUR understated every price by ~45x and contradicted the
        //    "₴" shown on the page.
        // 2. Missing prices. priceFrom is 0 for every production row, and
        //    "price": 0 is invalid for an Offer — Google rejects the whole
        //    Product. Omit the offer entirely instead; the page already falls
        //    back to a "request a quote" phone CTA in that case.
        ...(s.priceFrom
          ? {
              offers: {
                "@type": "Offer",
                priceCurrency: "UAH",
                price: s.priceFrom,
                availability: "https://schema.org/InStock",
                url: absoluteUrl(`/kameni/${s.id}`),
                seller: { "@type": "Organization", name: "Stone Memory" },
              },
            }
          : {}),
      }
    : null
  const breadcrumb = s
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Головна", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Каталог", item: absoluteUrl("/kataloh") },
          { "@type": "ListItem", position: 3, name: s.name || `No. ${s.id}`, item: absoluteUrl(`/kameni/${s.id}`) },
        ],
      }
    : null
  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      {breadcrumb && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      )}
      {children}
    </>
  )
}
