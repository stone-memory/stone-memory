import type { Metadata } from "next"
import { fetchStones } from "@/lib/data-source"
import { absoluteUrl } from "@/lib/site-config"
import { stonePath, verticalLabel } from "@/lib/catalog-taxonomy"
import { stoneTitle } from "@/lib/stone-meta"

const PATH = "/memorial/pamyatnyky"

export const revalidate = 60

// NO `title` here — deliberately. Any title on this layout breaks the brand
// suffix for the segments below it:
//   • a plain string consumes the root template and stops passing it down, so
//     /hranitni and /001 rendered with no " — Stone Memory" at all;
//   • a { default, template } pair gets BOTH this template and the root one
//     applied to the page that inherits `default`, giving "… — Stone Memory
//     — Stone Memory".
// With no title on this segment, the nearest template stays the root one and
// every descendant gets exactly one brand suffix. The page and the [slug]
// route each declare their own title.
export const metadata: Metadata = {
  description:
    "Каталог пам'ятників із граніту, габро й мармуру: одиночні, подвійні, комплекси, з хрестом. Гравіювання портрета, доставка й монтаж. Гарантія 5 років.",
  alternates: { canonical: absoluteUrl(PATH) },
  openGraph: {
    title: "Каталог пам'ятників — Stone Memory",
    description:
      "Одиночні пам'ятники, меморіальні комплекси, військові стели. Український граніт, власне виробництво в Костополі.",
    url: absoluteUrl(PATH),
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: { card: "summary_large_image", title: "Каталог пам'ятників — Stone Memory" },
}

export default async function MonumentsCatalogLayout({ children }: { children: React.ReactNode }) {
  const stones = await fetchStones()
  const monuments = stones.filter((s) => s.category === "memorial")

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Головна", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: verticalLabel("memorial"), item: absoluteUrl("/memorial") },
      { "@type": "ListItem", position: 3, name: "Каталог", item: absoluteUrl(PATH) },
    ],
  }

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Каталог пам'ятників Stone Memory",
    numberOfItems: monuments.length,
    itemListElement: monuments.slice(0, 30).map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(stonePath(s)),
      name: stoneTitle(s),
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
