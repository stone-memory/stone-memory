import 'server-only'
import type { Locale } from '@/lib/i18n/config'
import { getServerLocale } from '@/lib/i18n/server'
import type { Article, ArticleI18n, Project, ProjectI18n } from '@/lib/stone/cms-types'
import { getArticle, getArticles, getProject, getProjects } from '@/lib/stone/cms'
import plPart1 from '@/data/stone/i18n/articles.pl.part1.json'
import plPart2 from '@/data/stone/i18n/articles.pl.part2.json'
import plPart3 from '@/data/stone/i18n/articles.pl.part3.json'
import enPart1 from '@/data/stone/i18n/articles.en.part1.json'
import enPart2 from '@/data/stone/i18n/articles.en.part2.json'
import enPart3 from '@/data/stone/i18n/articles.en.part3.json'
import dePart1 from '@/data/stone/i18n/articles.de.part1.json'
import dePart2 from '@/data/stone/i18n/articles.de.part2.json'
import dePart3 from '@/data/stone/i18n/articles.de.part3.json'
import ltPart1 from '@/data/stone/i18n/articles.lt.part1.json'
import ltPart2 from '@/data/stone/i18n/articles.lt.part2.json'
import ltPart3 from '@/data/stone/i18n/articles.lt.part3.json'
import projectsI18n from '@/data/stone/i18n/projects.json'

/**
 * Переклади довгого контенту розділу (статті журналу, story/solution проєктів).
 * Джерело правди — поле `data.i18n` у базі; статичні JSON у data/stone/i18n —
 * резерв для записів, куди переклад ще не залито (див. scripts/stone-i18n-sql.mjs).
 * Файл серверний: JSON не потрапляє в клієнтський бандл.
 */
type ArticleDict = Record<string, ArticleI18n>
const STATIC_ARTICLES: Record<Exclude<Locale, 'uk'>, ArticleDict> = {
  pl: { ...plPart1, ...plPart2, ...plPart3 } as ArticleDict,
  en: { ...enPart1, ...enPart2, ...enPart3 } as ArticleDict,
  de: { ...dePart1, ...dePart2, ...dePart3 } as ArticleDict,
  lt: { ...ltPart1, ...ltPart2, ...ltPart3 } as ArticleDict,
}
const STATIC_PROJECTS = projectsI18n as Record<string, Partial<Record<Exclude<Locale, 'uk'>, ProjectI18n>>>

export function staticArticleI18n(slug: string): Partial<Record<string, ArticleI18n>> {
  const out: Partial<Record<string, ArticleI18n>> = {}
  for (const l of Object.keys(STATIC_ARTICLES) as (keyof typeof STATIC_ARTICLES)[]) {
    if (STATIC_ARTICLES[l][slug]) out[l] = STATIC_ARTICLES[l][slug]
  }
  return out
}
export function staticProjectI18n(slug: string): Partial<Record<string, ProjectI18n>> {
  return STATIC_PROJECTS[slug] ?? {}
}

export function localizeArticle(a: Article, locale: Locale): Article {
  if (locale === 'uk') return a
  const tr = a.i18n?.[locale] ?? (locale in STATIC_ARTICLES ? STATIC_ARTICLES[locale as keyof typeof STATIC_ARTICLES][a.slug] : undefined)
  return tr ? { ...a, ...tr } : a
}
export function localizeProject(p: Project, locale: Locale): Project {
  if (locale === 'uk') return p
  const tr = p.i18n?.[locale] ?? STATIC_PROJECTS[p.slug]?.[locale as Exclude<Locale, 'uk'>]
  return tr ? { ...p, ...tr } : p
}

export async function getLocalizedArticles() {
  const [items, locale] = await Promise.all([getArticles(), getServerLocale()])
  return items.map((a) => localizeArticle(a, locale))
}
export async function getLocalizedArticle(slug: string) {
  const [a, locale] = await Promise.all([getArticle(slug), getServerLocale()])
  return a ? localizeArticle(a, locale) : null
}
export async function getLocalizedProjects() {
  const [items, locale] = await Promise.all([getProjects(), getServerLocale()])
  return items.map((p) => localizeProject(p, locale))
}
export async function getLocalizedProject(slug: string) {
  const [p, locale] = await Promise.all([getProject(slug), getServerLocale()])
  return p ? localizeProject(p, locale) : null
}

/** Чи текст ще містить кирилицю — тоді для іншої мови показуємо підпис «доступно українською». */
export const hasCyrillic = (s: string) => /[Ѐ-ӿ]/.test(s)
