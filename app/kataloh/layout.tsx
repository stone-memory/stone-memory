import type { Metadata } from "next"
import { fetchStones } from "@/lib/data-source"
import { absoluteUrl } from "@/lib/site-config"

const PATH = "/kataloh"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Каталог — пам'ятники, стільниці, підвіконня, сходи, бруківка",
  description:
    "Повний каталог виробів Stone Memory: меморіальні комплекси, кухонні стільниці, підвіконня, каміни, сходи та бруківка. Натуральний граніт і мармур — український та імпортний. Ручна обробка, монтаж по Україні та ЄС.",
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
    title: "Stone Memory — Каталог",
    description:
      "Натуральний камінь для пам'яті і для дому — пам'ятники, стільниці, підвіконня, каміни, сходи, бруківка.",
    url: absoluteUrl(PATH),
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: { card: "summary_large_image", title: "Stone Memory — Каталог" },
}

export default async function CatalogLayout({ children }: { children: React.ReactNode }) {
  const stones = await fetchStones()

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Catalog", item: absoluteUrl(PATH) },
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
      url: absoluteUrl(`/kameni/${s.id}`),
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
