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
  if (!s) return { title: "Камінь не знайдено" }
  const kind = s.category === "memorial" ? "Пам'ятник" : "Декоративний камінь"
  const displayName = s.name || `№ ${s.id}`
  const title = `${displayName} — ${kind}`
  const desc = `${kind} ${displayName}. Натуральний граніт або мармур, ручна обробка у власному цеху в Костополі. Від ${s.priceFrom} ₴. Гарантія 5 років.`
  const url = absoluteUrl(`/kameni/${s.id}`)
  return {
    title,
    description: desc,
    alternates: {
      canonical: url,
      languages: {
        "x-default": url,
        en: `${url}?lang=en`,
        uk: `${url}?lang=uk`,
        pl: `${url}?lang=pl`,
        de: `${url}?lang=de`,
        lt: `${url}?lang=lt`,
      },
    },
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
        offers: {
          "@type": "Offer",
          priceCurrency: "EUR",
          price: s.priceFrom,
          availability: "https://schema.org/InStock",
          url: absoluteUrl(`/kameni/${s.id}`),
          seller: { "@type": "Organization", name: "Stone Memory" },
        },
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
