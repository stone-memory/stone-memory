import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SelectionSidebar } from "@/components/selection-sidebar"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { CatalogGrid } from "@/components/catalog-grid"
import { CatalogIndex } from "@/components/catalog-index"
import { fetchStones } from "@/lib/data-source"
import { MEMORIAL_FACETS, facetItems, verticalLabel } from "@/lib/catalog-taxonomy"

export const revalidate = 60

// Title lives on the page, not the layout — see the note in ./layout.tsx.
export const metadata: Metadata = {
  title: "Пам'ятники — каталог моделей і цін",
}

/**
 * Replaces /kataloh?cat=memorial.
 *
 * The grid is pinned to the memorial vertical: this URL, its h1 and its title
 * all say "пам'ятники", so the visitor must not be able to switch it to
 * "Дім і сад" underneath them.
 */
export default async function MonumentsCatalogPage() {
  const stones = await fetchStones()

  return (
    <>
      <Header />
      <main id="main-content">
        <div className="mx-auto max-w-7xl px-6 pt-6">
          <Breadcrumbs items={[{ name: verticalLabel("memorial"), href: "/memorial" }, { name: "Каталог" }]} />
        </div>

        <CatalogGrid
          initialStones={stones}
          lockedCategory="memorial"
          heading="Пам'ятники з натурального каменю"
          intro="Одиночні стели, подвійні пам'ятники та меморіальні комплекси з граніту, габро й мармуру. Кожна модель виготовляється в нашому цеху в Костополі під розмір ділянки."
        />

        {/* Crawlable links into the facet pages. Without these the facet URLs
            exist only in the sitemap, and a URL reachable by no link on the
            site is a URL Google treats as low priority. */}
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <h2 className="text-xl font-semibold tracking-tight-custom md:text-2xl">
            Підбірки пам'ятників
          </h2>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {MEMORIAL_FACETS.map((facet) => {
              const count = facetItems(stones, facet).length
              if (count === 0) return null
              return (
                <Link
                  key={facet.slug}
                  href={`/memorial/pamyatnyky/${facet.slug}`}
                  className="rounded-full border border-foreground/15 px-4 py-2 text-sm transition-colors hover:border-foreground/40"
                >
                  {facet.h1}
                  <span className="ml-1.5 text-muted-foreground tabular-nums">{count}</span>
                </Link>
              )
            })}
          </div>
        </section>

        <CatalogIndex stones={stones} />
      </main>
      <Footer />
      <SelectionSidebar />
    </>
  )
}
