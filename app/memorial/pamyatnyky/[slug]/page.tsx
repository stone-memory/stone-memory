import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SelectionSidebar } from "@/components/selection-sidebar"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { CatalogGrid } from "@/components/catalog-grid"
import { StoneDetailClient } from "@/components/stone-detail-client"
import { fetchStones } from "@/lib/data-source"
import { MEMORIAL_FACETS, facetItems, findFacet, findStoneByCode, isProductCode, verticalLabel } from "@/lib/catalog-taxonomy"

export const revalidate = 60

/**
 * Dispatches on the shape of the slug — see the note in ./layout.tsx for why
 * one segment can safely carry both facets and products.
 */
export default async function MonumentSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const stones = await fetchStones()

  if (isProductCode(slug)) {
    const stone = findStoneByCode(stones, slug)
    if (!stone) notFound()
    return <StoneDetailClient initialStone={stone} initialStones={stones} />
  }

  const facet = findFacet(slug)
  if (!facet) notFound()

  const siblings = MEMORIAL_FACETS.filter((f) => f.slug !== facet.slug)

  return (
    <>
      <Header />
      <main id="main-content">
        <div className="mx-auto max-w-7xl px-6 pt-6">
          <Breadcrumbs
            items={[
              { name: verticalLabel("memorial"), href: "/memorial" },
              { name: "Каталог", href: "/memorial/pamyatnyky" },
              { name: facet.h1 },
            ]}
          />
        </div>

        <CatalogGrid
          initialStones={stones}
          lockedCategory="memorial"
          facetSlug={facet.slug}
          heading={facet.h1}
          intro={facet.description}
        />

        {/* Category copy sits below the grid: the products are what the visitor
            came for, but the text still needs to be on the page for the query
            it ranks against. */}
        <section className="mx-auto max-w-7xl px-6 pb-14">
          <div className="max-w-3xl space-y-4 text-base leading-relaxed text-foreground/80">
            {facet.intro.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20">
          <h2 className="text-xl font-semibold tracking-tight-custom md:text-2xl">Інші підбірки</h2>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Link
              href="/memorial/pamyatnyky"
              className="rounded-full border border-foreground/15 px-4 py-2 text-sm transition-colors hover:border-foreground/40"
            >
              Усі пам'ятники
            </Link>
            {siblings.map((f) => {
              const count = facetItems(stones, f).length
              if (count === 0) return null
              return (
                <Link
                  key={f.slug}
                  href={`/memorial/pamyatnyky/${f.slug}`}
                  className="rounded-full border border-foreground/15 px-4 py-2 text-sm transition-colors hover:border-foreground/40"
                >
                  {f.h1}
                  <span className="ml-1.5 text-muted-foreground tabular-nums">{count}</span>
                </Link>
              )
            })}
          </div>
        </section>
      </main>
      <Footer />
      <SelectionSidebar />
    </>
  )
}
