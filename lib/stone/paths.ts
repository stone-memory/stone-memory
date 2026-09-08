import { categories } from '@/data/stone/materials'
import { familySlugs } from '@/data/stone/families'
import type { Article, Collection, Project, Settings } from '@/lib/stone/cms-types'

/**
 * Усі публічні шляхи розділу «Архітектурний камінь» (/arkhitekturnyi-kamin) для sitemap і перевірок «чи існує сторінка».
 *
 * Це НЕ маршрутизатор: рендерять сторінки сегменти в app/. Список складається
 * з тих самих джерел, що й generateStaticParams відповідних роутів (CMS +
 * структурні довідники), тому додана в адмінці колекція чи стаття потрапляє
 * і в роут, і в sitemap без ручного кроку. Чиста функція — її ж використовує
 * scripts/audit.mjs.
 */
export const staticPaths = [
  '/arkhitekturnyi-kamin',
  '/arkhitekturnyi-kamin/vyroby',
  '/arkhitekturnyi-kamin/vyroby/stilnytsi/kraya',
  '/arkhitekturnyi-kamin/materialy',
  '/arkhitekturnyi-kamin/materialy/tovshchyny',
  '/arkhitekturnyi-kamin/materialy/finishi',
  '/arkhitekturnyi-kamin/materialy/finishi/porivnyannya',
  '/arkhitekturnyi-kamin/catalog',
  '/arkhitekturnyi-kamin/pidbir-kamenyu',
  '/arkhitekturnyi-kamin/porivnyannya',
  '/arkhitekturnyi-kamin/porivnyannya/materialiv',
  '/arkhitekturnyi-kamin/proekty',
  '/arkhitekturnyi-kamin/kalkulyator',
  '/arkhitekturnyi-kamin/kontakty',
  '/arkhitekturnyi-kamin/blog',
  '/arkhitekturnyi-kamin/faq',
  '/arkhitekturnyi-kamin/zalyshky-slabiv',
  '/arkhitekturnyi-kamin/b2b',
  '/arkhitekturnyi-kamin/b2b/slyaby',
  '/arkhitekturnyi-kamin/b2b/prohrama',
]

export function buildPaths(input: {
  collections: Pick<Collection, 'slug'>[]
  projects: Pick<Project, 'slug'>[]
  articles: Pick<Article, 'slug'>[]
  settings: Pick<Settings, 'comparisons' | 'geo' | 'support' | 'professional'>
}): string[] {
  const { collections, projects, articles, settings } = input
  return Array.from(
    new Set([
      ...staticPaths,
      ...familySlugs.map((s) => `/arkhitekturnyi-kamin/materialy/${s}`),
      ...collections.map((x) => `/arkhitekturnyi-kamin/materialy/${x.slug}`),
      ...categories.map((x) => `/arkhitekturnyi-kamin/vyroby/${x.slug}`),
      ...projects.map((x) => `/arkhitekturnyi-kamin/proekty/${x.slug}`),
      ...articles.map((x) => `/arkhitekturnyi-kamin/blog/${x.slug}`),
      ...Object.keys(settings.comparisons).map((k) => `/arkhitekturnyi-kamin/porivnyannya/${k}`),
      ...Object.keys(settings.geo).map((c) => `/arkhitekturnyi-kamin/stilnytsi/${c}`),
      ...Object.keys(settings.support).map((s) => `/arkhitekturnyi-kamin/${s}`),
      ...settings.professional.segments.map((x) => `/arkhitekturnyi-kamin/b2b/${x.slug}`),
      ...Object.keys(settings.professional.specials).map((s) => `/arkhitekturnyi-kamin/b2b/${s}`),
    ])
  )
}
