import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CatalogPage } from "@/components/catalog-page"
import { fetchStones } from "@/lib/data-source"
import {
  MIN_FACET_ITEMS,
  catalogPageCount,
  catalogPagePath,
  facetItems,
  findFacet,
  parsePageSegment,
} from "@/lib/catalog-taxonomy"
import { absoluteUrl } from "@/lib/site-config"

export const revalidate = 60

type Params = { slug: string; page: string }

/**
 * /memorial/pamyatnyky/<фасет>/storinka-N — друга й далі сторінки фасета.
 *
 * Лише фасети: сторінки товару підсторінок не мають, тож будь-який інший
 * перший сегмент — 404. Сторінка кореневого каталогу (/pamyatnyky/storinka-N)
 * обробляється рівнем вище, у [slug]/page.tsx.
 */
async function resolve(params: Promise<Params>) {
  const { slug, page: seg } = await params
  const facet = findFacet(slug)
  const page = parsePageSegment(seg)
  if (!facet || !page) return null
  const stones = await fetchStones()
  const items = facetItems(stones, facet)
  if (page > catalogPageCount(items.length)) return null
  return { facet, page, stones, items }
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const r = await resolve(params)
  if (!r) return { title: "Сторінку не знайдено", robots: { index: false, follow: false } }
  const url = absoluteUrl(catalogPagePath(r.facet.slug, r.page))
  const title = `${r.facet.title} — сторінка ${r.page}`
  return {
    title,
    description: r.facet.description,
    alternates: { canonical: url },
    ...(r.items.length < MIN_FACET_ITEMS ? { robots: { index: false, follow: true } } : {}),
    openGraph: { title: `${r.facet.h1} — сторінка ${r.page}`, description: r.facet.description, url, type: "website" },
  }
}

export default async function FacetPagePage({ params }: { params: Promise<Params> }) {
  const r = await resolve(params)
  if (!r) notFound()
  return <CatalogPage stones={r.stones} facet={r.facet} page={r.page} />
}
