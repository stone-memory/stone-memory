import type { Metadata } from "next"
import { CatalogPage } from "@/components/catalog-page"
import { fetchStones } from "@/lib/data-source"
import { stonePath } from "@/lib/catalog-taxonomy"
import { stoneTitle } from "@/lib/stone-meta"
import { absoluteUrl } from "@/lib/site-config"

const PATH = "/memorial/pamyatnyky"

export const revalidate = 60

// Title lives on the page, not the layout — see the note in ./layout.tsx.
export const metadata: Metadata = {
  title: "Пам'ятники з граніту від виробника — каталог моделей і цін",
}

/**
 * Перша сторінка каталогу. Наступні (/storinka-2 …) обслуговує [slug]/page.tsx —
 * той самий компонент CatalogPage, інший номер сторінки.
 */
export default async function MonumentsCatalogPage() {
  const stones = await fetchStones()
  const monuments = stones.filter((s) => s.category === "memorial")

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Головна", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Каталог", item: absoluteUrl(PATH) },
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
      <CatalogPage stones={stones} page={1} />
    </>
  )
}
