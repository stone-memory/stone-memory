import type { Metadata } from "next"
import { fetchStones } from "@/lib/data-source"
import { absoluteUrl } from "@/lib/site-config"
import {
  MEMORIAL_FACETS,
  MIN_FACET_ITEMS,
  facetItems,
  findFacet,
  findStoneByCode,
  isProductCode,
  stonePath,
  verticalLabel,
} from "@/lib/catalog-taxonomy"
import { stoneDescription, stoneTitle } from "@/lib/stone-meta"

export const revalidate = 60
export const dynamicParams = true

type Params = { slug: string }

/**
 * One dynamic segment serves two entity types:
 *
 *   /memorial/pamyatnyky/hranitni  → facet page   (slug is always alphabetic)
 *   /memorial/pamyatnyky/002       → product page (code is always 2–4 digits)
 *
 * The two namespaces cannot collide: every one of the 60 production rows
 * carries a unique zero-padded numeric code ("001"…"063"), and every facet
 * slug in MEMORIAL_FACETS is alphabetic. isProductCode() is the discriminator.
 */
export async function generateStaticParams(): Promise<Params[]> {
  const stones = await fetchStones()
  const monuments = stones.filter((s) => s.category === "memorial")
  return [
    ...MEMORIAL_FACETS.map((f) => ({ slug: f.slug })),
    ...monuments.map((s) => ({ slug: s.name || s.id })),
  ]
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const stones = await fetchStones()

  if (!isProductCode(slug)) {
    const facet = findFacet(slug)
    if (!facet) return { title: "Сторінку не знайдено", robots: { index: false, follow: false } }
    const url = absoluteUrl(`/memorial/pamyatnyky/${facet.slug}`)
    const count = facetItems(stones, facet).length
    return {
      title: facet.title,
      description: facet.description,
      alternates: { canonical: url },
      // Thin facets stay crawlable but out of the index — see MIN_FACET_ITEMS.
      ...(count < MIN_FACET_ITEMS ? { robots: { index: false, follow: true } } : {}),
      openGraph: {
        title: `${facet.h1} — Stone Memory`,
        description: facet.description,
        url,
        type: "website",
        images: ["/opengraph-image"],
      },
      twitter: { card: "summary_large_image", title: `${facet.h1} — Stone Memory` },
    }
  }

  const stone = findStoneByCode(stones, slug)
  if (!stone) return { title: "Пам'ятник не знайдено", robots: { index: false, follow: false } }

  const title = stoneTitle(stone)
  const description = stoneDescription(stone)
  const url = absoluteUrl(stonePath(stone))
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [{ url: stone.imagePath, width: 1200, height: 1500, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [stone.imagePath] },
  }
}

export default async function SlugLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<Params>
}) {
  const { slug } = await params
  const stones = await fetchStones()

  const trail = (name: string, path: string) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Головна", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: verticalLabel("memorial"), item: absoluteUrl("/memorial") },
      { "@type": "ListItem", position: 3, name: "Каталог", item: absoluteUrl("/memorial/pamyatnyky") },
      { "@type": "ListItem", position: 4, name, item: absoluteUrl(path) },
    ],
  })

  const blocks: object[] = []

  if (!isProductCode(slug)) {
    const facet = findFacet(slug)
    if (facet) {
      const items = facetItems(stones, facet)
      blocks.push(trail(facet.h1, `/memorial/pamyatnyky/${facet.slug}`))
      blocks.push({
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: facet.h1,
        numberOfItems: items.length,
        itemListElement: items.slice(0, 30).map((s, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: absoluteUrl(stonePath(s)),
          name: `Пам'ятник №${s.name || s.id}`,
          image: s.imagePath,
        })),
      })
    }
  } else {
    const stone = findStoneByCode(stones, slug)
    if (stone) {
      const code = stone.name || stone.id
      blocks.push(trail(`Пам'ятник №${code}`, stonePath(stone)))
      blocks.push({
        "@context": "https://schema.org",
        "@type": "Product",
        name: stoneTitle(stone),
        sku: code,
        mpn: code,
        image: stone.gallery && stone.gallery.length ? stone.gallery : [stone.imagePath],
        description: stoneDescription(stone),
        brand: { "@type": "Brand", name: "Stone Memory" },
        category: "Пам'ятники",
        ...(stone.materialType ? { material: stone.materialType } : {}),
        ...(stone.color ? { color: stone.color } : {}),
        // priceFrom is UAH and is 0 on every production row. `"price": 0` is
        // invalid for an Offer and makes Google discard the whole Product, so
        // the offer is omitted rather than zeroed.
        ...(stone.priceFrom
          ? {
              offers: {
                "@type": "Offer",
                priceCurrency: "UAH",
                price: stone.priceFrom,
                availability: "https://schema.org/InStock",
                url: absoluteUrl(stonePath(stone)),
                seller: { "@type": "Organization", name: "Stone Memory" },
              },
            }
          : {}),
      })
    }
  }

  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
      {children}
    </>
  )
}
