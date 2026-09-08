import { categories } from '@/data/stone/materials'
import { familySlugs } from '@/data/stone/families'
import type { Article, Collection, Project, Settings } from '@/lib/stone/cms-types'

/**
 * Усі публічні шляхи розділу «Архітектурний камінь» (/kamin) для sitemap і перевірок «чи існує сторінка».
 *
 * Це НЕ маршрутизатор: рендерять сторінки сегменти в app/. Список складається
 * з тих самих джерел, що й generateStaticParams відповідних роутів (CMS +
 * структурні довідники), тому додана в адмінці колекція чи стаття потрапляє
 * і в роут, і в sitemap без ручного кроку. Чиста функція — її ж використовує
 * scripts/audit.mjs.
 */
export const staticPaths = [
  '/kamin',
  '/kamin/vyroby',
  '/kamin/vyroby/stilnytsi/kraya',
  '/kamin/materialy',
  '/kamin/materialy/tovshchyny',
  '/kamin/materialy/finishi',
  '/kamin/materialy/finishi/porivnyannya',
  '/kamin/catalog',
  '/kamin/pidbir-kamenyu',
  '/kamin/porivnyannya',
  '/kamin/porivnyannya/materialiv',
  '/kamin/proekty',
  '/kamin/kalkulyator',
  '/kamin/kontakty',
  '/kamin/blog',
  '/kamin/faq',
  '/kamin/zalyshky-slabiv',
  '/kamin/b2b',
  '/kamin/b2b/slyaby',
  '/kamin/b2b/prohrama',
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
      ...familySlugs.map((s) => `/kamin/materialy/${s}`),
      ...collections.map((x) => `/kamin/materialy/${x.slug}`),
      ...categories.map((x) => `/kamin/vyroby/${x.slug}`),
      ...projects.map((x) => `/kamin/proekty/${x.slug}`),
      ...articles.map((x) => `/kamin/blog/${x.slug}`),
      ...Object.keys(settings.comparisons).map((k) => `/kamin/porivnyannya/${k}`),
      ...Object.keys(settings.geo).map((c) => `/kamin/stilnytsi/${c}`),
      ...Object.keys(settings.support).map((s) => `/kamin/${s}`),
      ...settings.professional.segments.map((x) => `/kamin/b2b/${x.slug}`),
      ...Object.keys(settings.professional.specials).map((s) => `/kamin/b2b/${s}`),
    ])
  )
}
