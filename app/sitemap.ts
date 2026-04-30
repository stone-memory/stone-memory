import type { MetadataRoute } from "next"
import { fetchArticles, fetchServices, fetchStones } from "@/lib/data-source"

export const revalidate = 0

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://stonememory.com"

const withAlternates = (path: string) => ({
  languages: {
    en: `${SITE}${path}?lang=en`,
    uk: `${SITE}${path}?lang=uk`,
    pl: `${SITE}${path}?lang=pl`,
    de: `${SITE}${path}?lang=de`,
    lt: `${SITE}${path}?lang=lt`,
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
    { url: `${SITE}/`, lastModified: now, changeFrequency: "daily", priority: 1, alternates: withAlternates("/") },
    { url: `${SITE}/catalog`, lastModified: now, changeFrequency: "daily", priority: 0.95, alternates: withAlternates("/catalog") },
    { url: `${SITE}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.9, alternates: withAlternates("/projects") },
    { url: `${SITE}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.9, alternates: withAlternates("/services") },
    { url: `${SITE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8, alternates: withAlternates("/about") },
    { url: `${SITE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.85, alternates: withAlternates("/blog") },
    { url: `${SITE}/reviews`, lastModified: now, changeFrequency: "weekly", priority: 0.7, alternates: withAlternates("/reviews") },
    { url: `${SITE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3, alternates: withAlternates("/privacy") },
    { url: `${SITE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3, alternates: withAlternates("/terms") },
  ]

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE}/blog/${a.slug}`,
    lastModified: new Date(a.date),
    changeFrequency: "monthly",
    priority: 0.6,
    alternates: withAlternates(`/blog/${a.slug}`),
  }))

  const stoneRoutes: MetadataRoute.Sitemap = stones.map((s) => ({
    url: `${SITE}/stones/${s.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
    alternates: withAlternates(`/stones/${s.id}`),
  }))

  const serviceAnchors: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${SITE}/services#${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }))

  return [...staticRoutes, ...stoneRoutes, ...articleRoutes, ...serviceAnchors]
}
