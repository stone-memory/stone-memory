import type { MetadataRoute } from "next"
import { fetchArticles, fetchServices, fetchStones } from "@/lib/data-source"
import { absoluteUrl } from "@/lib/site-config"

export const revalidate = 60

const withAlternates = (path: string) => ({
  languages: {
    en: `${absoluteUrl(path)}?lang=en`,
    uk: `${absoluteUrl(path)}?lang=uk`,
    pl: `${absoluteUrl(path)}?lang=pl`,
    de: `${absoluteUrl(path)}?lang=de`,
    lt: `${absoluteUrl(path)}?lang=lt`,
  },
})

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const [articles, services, stones] = await Promise.all([
    fetchArticles(),
    fetchServices(),
    fetchStones(),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1, alternates: withAlternates("/") },
    { url: absoluteUrl("/catalog"), lastModified: now, changeFrequency: "daily", priority: 0.95, alternates: withAlternates("/catalog") },
    { url: absoluteUrl("/projects"), lastModified: now, changeFrequency: "weekly", priority: 0.9, alternates: withAlternates("/projects") },
    { url: absoluteUrl("/services"), lastModified: now, changeFrequency: "monthly", priority: 0.9, alternates: withAlternates("/services") },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.8, alternates: withAlternates("/about") },
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.85, alternates: withAlternates("/blog") },
    { url: absoluteUrl("/reviews"), lastModified: now, changeFrequency: "weekly", priority: 0.7, alternates: withAlternates("/reviews") },
    { url: absoluteUrl("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.3, alternates: withAlternates("/privacy") },
    { url: absoluteUrl("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.3, alternates: withAlternates("/terms") },
  ]

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: absoluteUrl(`/blog/${a.slug}`),
    lastModified: new Date(a.date),
    changeFrequency: "monthly",
    priority: 0.6,
    alternates: withAlternates(`/blog/${a.slug}`),
  }))

  const stoneRoutes: MetadataRoute.Sitemap = stones.map((s) => ({
    url: absoluteUrl(`/stones/${s.id}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
    alternates: withAlternates(`/stones/${s.id}`),
  }))

  const serviceAnchors: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${absoluteUrl("/services")}#${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }))

  return [...staticRoutes, ...stoneRoutes, ...articleRoutes, ...serviceAnchors]
}
