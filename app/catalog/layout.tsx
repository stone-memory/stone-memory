import type { Metadata } from "next"
import { fetchStones } from "@/lib/data-source"

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://stonememory.com"

export const revalidate = 0

export const metadata: Metadata = {
  title: "Catalog — monuments, countertops, window sills, stairs, paving",
  description:
    "Full catalog of Stone Memory pieces: memorial complexes, kitchen countertops, window sills, fireplaces, stairs and paving. Natural granite and marble — Ukrainian and imported. Hand-finished, installed across Ukraine and EU.",
  alternates: {
    canonical: `${SITE}/catalog`,
    languages: {
      "x-default": `${SITE}/catalog`,
      en: `${SITE}/catalog?lang=en`,
      uk: `${SITE}/catalog?lang=uk`,
      pl: `${SITE}/catalog?lang=pl`,
      de: `${SITE}/catalog?lang=de`,
      lt: `${SITE}/catalog?lang=lt`,
    },
  },
  openGraph: {
    title: "Stone Memory — Catalog",
    description:
      "Natural stone for memory and for home — monuments, countertops, sills, fireplaces, stairs, paving.",
    url: `${SITE}/catalog`,
    type: "website",
    images: [{ url: "/logo-512.png", width: 512, height: 512, alt: "Stone Memory" }],
  },
  twitter: { card: "summary_large_image", title: "Stone Memory — Catalog" },
}

export default async function CatalogLayout({ children }: { children: React.ReactNode }) {
  const stones = await fetchStones()

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Catalog", item: `${SITE}/catalog` },
    ],
  }

  // ItemList of the top catalog items — Google uses this for rich product
  // gallery snippets.
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Stone Memory catalog",
    numberOfItems: stones.length,
    itemListElement: stones.slice(0, 30).map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE}/stones/${s.id}`,
      name: `No. ${s.id}`,
      image: s.imagePath,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      {children}
    </>
  )
}
