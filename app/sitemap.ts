import type { MetadataRoute } from "next"
import { fetchArticles, fetchStones, fetchStoneUpdatedAt } from "@/lib/data-source"
import { absoluteUrl } from "@/lib/site-config"
import {
  catalogPageCount,
  catalogPagePath,
  facetItems,
  publishedFacets,
  stonePath,
} from "@/lib/catalog-taxonomy"
import { getAllPaths } from "@/lib/stone/routes"
import { CITIES, CONTENT_UPDATED } from "@/lib/site-facts"

export const revalidate = 60

/**
 * No `hreflang` alternates here (and none in page metadata either).
 *
 * The five languages currently share ONE URL each — `?lang=de` returns
 * byte-identical HTML to the bare URL, always `<html lang="uk">`, always the
 * Ukrainian <title>; the copy is swapped client-side by LanguageProvider.
 * Declaring those query URLs as hreflang alternates told Google about five
 * "translations" that are in fact five duplicates of the same Ukrainian page,
 * which invalidates the whole cluster.
 *
 * Real alternates belong here once i18n Phase 3 ships genuine per-locale URLs
 * (/uk/…, /pl/… — see the disabled matcher in middleware.ts). Until then, one
 * honest URL per document is the correct signal.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, stones, updatedAt, stonePaths] = await Promise.all([
    fetchArticles(),
    fetchStones(),
    fetchStoneUpdatedAt(),
    getAllPaths(),
  ])

  const monuments = stones.filter((s) => s.category === "memorial")

  // No `lastModified` on routes where we have no real change signal — a
  // build-time timestamp repeated across every URL reads as noise and Google
  // discards the whole signal. Articles carry a genuine date, so they keep it.
  //
  // /umovy and /konfidentsiinist are deliberately `robots: noindex` (see their
  // layouts) and therefore must NOT be listed here — a URL that is both
  // submitted and noindexed is a contradictory signal.
  // Інфосторінки не мають часу правки в базі, тому беруть ручну дату
  // останньої змістовної правки (CONTENT_UPDATED), а не штамп збірки.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: CONTENT_UPDATED, changeFrequency: "daily", priority: 1 },
    // /kataloh is gone — it 308s to /memorial/pamyatnyky. A redirecting URL
    // must never be submitted: Google reports it as "Page with redirect" and
    // drops it from the index anyway.
    { url: absoluteUrl("/pamyatnyky"), lastModified: CONTENT_UPDATED, changeFrequency: "weekly", priority: 0.95 },
    { url: absoluteUrl("/memorial/pamyatnyky"), lastModified: CONTENT_UPDATED, changeFrequency: "daily", priority: 0.95 },
    { url: absoluteUrl("/memorial/kameni"), lastModified: CONTENT_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/tsiny"), lastModified: CONTENT_UPDATED, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/yak-zamovyty"), lastModified: CONTENT_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/dostavka-i-oplata"), lastModified: CONTENT_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/harantiya"), lastModified: CONTENT_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/pytannya"), lastModified: CONTENT_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/kontakty"), lastModified: CONTENT_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/proekty"), lastModified: CONTENT_UPDATED, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/posluhy"), lastModified: CONTENT_UPDATED, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/pro-nas"), lastModified: CONTENT_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/blog"), lastModified: CONTENT_UPDATED, changeFrequency: "weekly", priority: 0.85 },
    { url: absoluteUrl("/vidhuky"), lastModified: CONTENT_UPDATED, changeFrequency: "weekly", priority: 0.7 },
  ]

  // Регіональні сторінки: місто + доставка й монтаж у ньому.
  const cityRoutes: MetadataRoute.Sitemap = CITIES.map((c) => ({
    url: absoluteUrl(`/pamyatnyky/${c.slug}`),
    lastModified: CONTENT_UPDATED,
    changeFrequency: "monthly",
    priority: 0.8,
  }))

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: absoluteUrl(`/blog/${a.slug}`),
    lastModified: new Date(a.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  // Тут `lastModified` є, на відміну від статичних маршрутів: у рядка товару
  // час правки справжній і в кожного свій, а застереження вище стосується
  // однакового штампу збірки, розтиражованого на всі адреси.
  const stoneRoutes: MetadataRoute.Sitemap = stones.map((s) => ({
    url: absoluteUrl(stonePath(s)),
    ...(s.slug && updatedAt.has(s.slug) ? { lastModified: updatedAt.get(s.slug) } : {}),
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  // Only facets that clear MIN_FACET_ITEMS. A facet holding three monuments is
  // rendered (the on-page filter links to it) but stays noindex and out of the
  // sitemap — submitting it would be submitting a doorway page.
  const facets = publishedFacets(stones)
  // Фасет змінюється тоді, коли змінюється будь-який товар у ньому.
  const facetRoutes: MetadataRoute.Sitemap = facets.map((f) => ({
    url: absoluteUrl(`/memorial/pamyatnyky/${f.slug}`),
    lastModified: facetItems(stones, f).reduce<Date>((acc, s) => {
      const t = s.slug ? updatedAt.get(s.slug) : undefined
      return t && t > acc ? t : acc
    }, CONTENT_UPDATED),
    changeFrequency: "weekly",
    priority: 0.85,
  }))

  // Сторінки пагінації — і кореневого каталогу, і кожного фасета. Перша
  // сторінка вже подана вище, тому тут від другої.
  const pageRoutes: MetadataRoute.Sitemap = []
  const pushPages = (slug: string | null, count: number) => {
    for (let p = 2; p <= catalogPageCount(count); p++) {
      pageRoutes.push({ url: absoluteUrl(catalogPagePath(slug, p)), changeFrequency: "weekly", priority: 0.5 })
    }
  }
  pushPages(null, monuments.length)
  for (const f of facets) pushPages(f.slug, facetItems(stones, f).length)

  // Service anchors (/posluhy#design …) are intentionally omitted: a URL
  // fragment is not a separate document, so search engines collapse them into
  // /posluhy and the extra entries only dilute the sitemap.
  // Розділ «Архітектурний камінь» (/arkhitekturnyi-kamin): список збирається з тих самих
  // даних, що й його роути, тому додана в адмінці колекція чи стаття
  // потрапляє в мапу сайту без ручного кроку.
  const architecturalStoneRoutes: MetadataRoute.Sitemap = stonePaths.map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: path === "/arkhitekturnyi-kamin" ? "weekly" : "monthly",
    priority: path === "/arkhitekturnyi-kamin" ? 0.9 : 0.6,
  }))

  return [
    ...staticRoutes,
    ...cityRoutes,
    ...facetRoutes,
    ...pageRoutes,
    ...stoneRoutes,
    ...articleRoutes,
    ...architecturalStoneRoutes,
  ]
}
