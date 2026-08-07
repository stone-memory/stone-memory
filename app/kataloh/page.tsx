import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SelectionSidebar } from "@/components/selection-sidebar"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { CatalogGrid } from "@/components/catalog-grid"
import { CatalogIndex } from "@/components/catalog-index"
import { fetchStones } from "@/lib/data-source"

export const revalidate = 60

/**
 * Server component: the catalogue is fetched here so the grid, its h1 and the
 * product links exist in the initial HTML. Previously this route was
 * `"use client"` and shipped 576 characters of text with zero links to any of
 * the 60 products.
 */
export default async function CatalogPage() {
  const stones = await fetchStones()

  return (
    <>
      <Header />
      <main id="main-content">
        <div className="mx-auto max-w-7xl px-6 pt-6">
          <Breadcrumbs items={[{ name: "Каталог" }]} />
        </div>
        <CatalogGrid initialStones={stones} />
        <CatalogIndex stones={stones} />
      </main>
      <Footer />
      <SelectionSidebar />
    </>
  )
}
