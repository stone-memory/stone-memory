import type { Article, ArticleCategory } from '@/lib/stone/cms-types'

export type Draft = {
  slug: string
  title: string
  h1: string
  description: string
  dek: string
  category: ArticleCategory
  intro: string
  sections: { heading: string; body: string }[]
  tableHeaders?: string[]
  table: string[][]
  faq: { q: string; a: string }[]
  links: string[]
  materials?: string[]
  categories?: string[]
}

const PUBLISHED = '2026-08-20'
const MODIFIED = '2026-09-08'

const words = (d: Draft) =>
  [d.intro, ...d.sections.map((s) => s.body), ...d.faq.map((f) => f.a)].join(' ').split(/\s+/)
    .length

/** Стаття для бази: час читання рахується з обсягу (≈180 слів/хв). */
export const article = (d: Draft): Article => ({
  slug: d.slug,
  title: d.title,
  h1: d.h1,
  description: d.description,
  dek: d.dek,
  category: d.category,
  readingTime: `${Math.max(3, Math.round(words(d) / 180))} хв читання`,
  datePublished: PUBLISHED,
  dateModified: MODIFIED,
  intro: d.intro,
  sections: d.sections,
  table: { headers: d.tableHeaders ?? ['Критерій', 'Варіант', 'Що врахувати'], rows: d.table },
  faq: d.faq.map((f) => ({ question: f.q, answer: f.a })),
  related: d.links,
  materials: d.materials ?? [],
  categories: d.categories ?? [],
})
