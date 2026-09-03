import type { MetadataRoute } from "next"
import { fetchArticles, fetchStones } from "@/lib/data-source"
import { absoluteUrl } from "@/lib/site-config"
import { publishedFacets, stonePath } from "@/lib/catalog-taxonomy"

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
  const [articles, stones] = await Promise.all([fetchArticles(), fetchStones()])

  // No `lastModified` on routes where we have no real change signal — a
  // build-time timestamp repeated across every URL reads as noise and Google
  // discards the whole signal. Articles carry a genuine date, so they keep it.
  //
  // /umovy and /konfidentsiinist are deliberately `robots: noindex` (see their
  // layouts) and therefore must NOT be listed here — a URL that is both
  // submitted and noindexed is a contradictory signal.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    // /kataloh is gone — it 308s to /memorial/pamyatnyky. A redirecting URL
    // must never be submitted: Google reports it as "Page with redirect" and
    // drops it from the index anyway.
    { url: absoluteUrl("/memorial"), changeFrequency: "weekly", priority: 0.95 },
    { url: absoluteUrl("/memorial/pamyatnyky"), changeFrequency: "daily", priority: 0.95 },
    { url: absoluteUrl("/proekty"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/posluhy"), changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/pro-nas"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/blog"), changeFrequency: "weekly", priority: 0.85 },
    { url: absoluteUrl("/vidhuky"), changeFrequency: "weekly", priority: 0.7 },
  ]

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: absoluteUrl(`/blog/${a.slug}`),
    lastModified: new Date(a.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  const stoneRoutes: MetadataRoute.Sitemap = stones.map((s) => ({
    url: absoluteUrl(stonePath(s)),
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  // Only facets that clear MIN_FACET_ITEMS. A facet holding three monuments is
  // rendered (the on-page filter links to it) but stays noindex and out of the
  // sitemap — submitting it would be submitting a doorway page.
  const facetRoutes: MetadataRoute.Sitemap = publishedFacets(stones).map((f) => ({
    url: absoluteUrl(`/memorial/pamyatnyky/${f.slug}`),
    changeFrequency: "weekly",
    priority: 0.85,
  }))


  // Service anchors (/posluhy#design …) are intentionally omitted: a URL
  // fragment is not a separate document, so search engines collapse them into
  // /posluhy and the extra entries only dilute the sitemap.
  return [...staticRoutes, ...facetRoutes, ...stoneRoutes, ...articleRoutes]
}
