import type { Metadata } from "next"
import { fetchStones, fetchStoneById } from "@/lib/data-source"

export const revalidate = 60
export const dynamicParams = true

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://stonememory.com.ua"

export async function generateStaticParams() {
  const stones = await fetchStones()
  return stones.map((s) => ({ id: s.id }))
}

type Params = { id: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params
  const s = await fetchStoneById(id)
  if (!s) return { title: "Stone not found" }
  const kind = s.category === "memorial" ? "Memorial" : "Decorative stone"
  const title = `No. ${s.id} — ${kind} | Stone Memory`
  const desc = `${kind} No. ${s.id}. Natural granite or marble, hand-finished in our Kostopil workshop. From €${s.priceFrom}. 5-year warranty.`
  const url = `${SITE}/stones/${s.id}`
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
      images: [{ url: s.imagePath, width: 1200, height: 1500, alt: `No. ${s.id}` }],
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
        name: `${s.category === "memorial" ? "Memorial" : "Decorative stone"} No. ${s.id}`,
        sku: s.id,
        mpn: s.id,
        image: s.gallery && s.gallery.length ? s.gallery : [s.imagePath],
        description: `Natural stone ${s.category === "memorial" ? "monument" : "piece"} №${s.id}. Hand-finished in our Kostopil workshop.`,
        brand: { "@type": "Brand", name: "Stone Memory" },
        category: s.category === "memorial" ? "Memorial Stone" : "Decorative Stone",
        offers: {
          "@type": "Offer",
          priceCurrency: "EUR",
          price: s.priceFrom,
          availability: "https://schema.org/InStock",
          url: `${SITE}/stones/${s.id}`,
          seller: { "@type": "Organization", name: "Stone Memory" },
        },
      }
    : null
  const breadcrumb = s
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "Catalog", item: `${SITE}/catalog` },
          { "@type": "ListItem", position: 3, name: `No. ${s.id}`, item: `${SITE}/stones/${s.id}` },
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
