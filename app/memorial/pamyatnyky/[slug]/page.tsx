import { notFound, permanentRedirect } from "next/navigation"
import { CatalogPage } from "@/components/catalog-page"
import { StoneDetailClient } from "@/components/stone-detail-client"
import { fetchStones } from "@/lib/data-source"
import {
  catalogPageCount,
  findFacet,
  findStoneByCode,
  isFacetSlug,
  parsePageSegment,
  stonePath,
} from "@/lib/catalog-taxonomy"

export const revalidate = 60

/**
 * Один сегмент — три види адрес:
 *
 *   /memorial/pamyatnyky/storinka-2       → друга сторінка кореневого каталогу
 *   /memorial/pamyatnyky/hranitni         → фасет
 *   /memorial/pamyatnyky/anhel-skorboty   → товар
 *
 * Порядок перевірок важливий: «storinka-N» і фасети — фіксовані допустимі
 * форми, товар — усе інше. Сторінки фасетів (/hranitni/storinka-2) живуть у
 * вкладеному маршруті [slug]/[page].
 */
export default async function MonumentSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const stones = await fetchStones()

  const page = parsePageSegment(slug)
  if (page) {
    const count = catalogPageCount(stones.filter((s) => s.category === "memorial").length)
    if (page > count) notFound()
    return <CatalogPage stones={stones} page={page} />
  }

  if (!isFacetSlug(slug)) {
    const stone = findStoneByCode(stones, slug)
    if (!stone) notFound()
    // Reached through the old numeric URL (/001) or a row id — send it on to
    // the canonical slug rather than serving the same page at two addresses.
    const canonical = stonePath(stone)
    if (canonical !== `/memorial/pamyatnyky/${slug}`) permanentRedirect(canonical)
    return <StoneDetailClient initialStone={stone} initialStones={stones} />
  }

  const facet = findFacet(slug)
  if (!facet) notFound()

  return <CatalogPage stones={stones} facet={facet} page={1} />
}
