"use client"

import { authedFetch } from "@/lib/authed-fetch"

import { useEffect } from "react"
import { create } from "zustand"
import { articles as baseArticles, type Article } from "@/lib/data/articles"

type ArticleRow = { slug: string; data: Article; hidden: boolean; position: number }

export type BlogHeroMode = "latest" | "pinned"

type BlogConfig = { heroMode: BlogHeroMode; pinnedSlug: string | null }

interface BlogState {
  articles: ArticleRow[]
  heroMode: BlogHeroMode
  pinnedSlug: string | null
  hasHydrated: boolean
  loading: boolean
  hydrate: () => Promise<void>
  setMode: (m: BlogHeroMode) => Promise<void>
  setPinned: (slug: string | null) => Promise<void>
  upsertArticle: (a: Article) => Promise<void>
  softDeleteArticle: (slug: string) => Promise<void>
  restoreArticle: (slug: string) => Promise<void>
  removeArticle: (slug: string) => Promise<void>
}

async function putConfig(data: BlogConfig) {
  const res = await authedFetch("/api/content/singleton/blog_config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  })
  if (!res.ok) throw new Error("blog_config put failed")
}

async function putArticle(row: ArticleRow) {
  const res = await authedFetch("/api/content/articles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(row),
  })
  if (!res.ok) throw new Error("article upsert failed")
}

async function patchArticle(slug: string, patch: Partial<{ data: Article; hidden: boolean; position: number }>) {
  const res = await authedFetch(`/api/content/articles/${encodeURIComponent(slug)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error("article patch failed")
}

export const useBlogStore = create<BlogState>()((set, get) => ({
  articles: [],
  heroMode: "latest",
  pinnedSlug: null,
  hasHydrated: false,
  loading: false,

  hydrate: async () => {
    if (get().hasHydrated || get().loading) return
    set({ loading: true })
    try {
      const [articlesRes, configRes] = await Promise.all([
        fetch("/api/content/articles", { cache: "no-store" }),
        fetch("/api/content/singleton/blog_config", { cache: "no-store" }),
      ])
      const articlesJson = articlesRes.ok ? await articlesRes.json() : { items: [] }
      const configJson = configRes.ok ? await configRes.json() : { data: null }
      const cfg: BlogConfig = configJson?.data ?? { heroMode: "latest", pinnedSlug: null }
      set({
        articles: Array.isArray(articlesJson.items) ? (articlesJson.items as ArticleRow[]) : [],
        heroMode: cfg.heroMode ?? "latest",
        pinnedSlug: cfg.pinnedSlug ?? null,
        hasHydrated: true,
      })
    } catch {
      set({ hasHydrated: true })
    } finally {
      set({ loading: false })
    }
  },

  setMode: async (m) => {
    const prev = { heroMode: get().heroMode, pinnedSlug: get().pinnedSlug }
    set({ heroMode: m })
    try {
      await putConfig({ heroMode: m, pinnedSlug: get().pinnedSlug })
    } catch {
      set(prev)
    }
  },

  setPinned: async (slug) => {
    const prev = { heroMode: get().heroMode, pinnedSlug: get().pinnedSlug }
    const next: BlogConfig = { pinnedSlug: slug, heroMode: slug ? "pinned" : "latest" }
    set(next)
    try {
      await putConfig(next)
    } catch {
      set(prev)
    }
  },

  upsertArticle: async (a) => {
    const existing = get().articles.find((r) => r.slug === a.slug)
    const position = existing?.position ?? get().articles.length
    const row: ArticleRow = { slug: a.slug, data: a, hidden: existing?.hidden ?? false, position }
    const prev = get().articles
    set({
      articles: existing ? prev.map((r) => (r.slug === a.slug ? row : r)) : [...prev, row],
    })
    try {
      await putArticle(row)
    } catch {
      set({ articles: prev })
    }
  },

  softDeleteArticle: async (slug) => {
    const prev = get().articles
    set({ articles: prev.map((r) => (r.slug === slug ? { ...r, hidden: true } : r)) })
    try {
      await patchArticle(slug, { hidden: true })
    } catch {
      set({ articles: prev })
    }
  },

  restoreArticle: async (slug) => {
    const prev = get().articles
    set({ articles: prev.map((r) => (r.slug === slug ? { ...r, hidden: false } : r)) })
    try {
      await patchArticle(slug, { hidden: false })
    } catch {
      set({ articles: prev })
    }
  },

  removeArticle: async (slug) => {
    const prev = get().articles
    set({ articles: prev.filter((r) => r.slug !== slug) })
    try {
      const res = await authedFetch(`/api/content/articles/${encodeURIComponent(slug)}`, { method: "DELETE" })
      if (!res.ok) throw new Error("delete failed")
    } catch {
      set({ articles: prev })
    }
  },
}))

export function useArticles(): Article[] {
  const articles = useBlogStore((s) => s.articles)
  const hasHydrated = useBlogStore((s) => s.hasHydrated)
  const hydrate = useBlogStore((s) => s.hydrate)
  useEffect(() => {
    hydrate()
  }, [hydrate])
  if (!hasHydrated) return baseArticles
  // Articles in DB take precedence; static articles not yet published to DB still show.
  const dbSlugs = new Set(articles.map((r) => r.slug))
  const dbVisible = articles.filter((r) => !r.hidden).map((r) => r.data)
  const staticFallback = baseArticles.filter((a) => !dbSlugs.has(a.slug))
  return [...dbVisible, ...staticFallback]
}

export function useBlogHeroSlug(defaultSlug: string): string {
  const heroMode = useBlogStore((s) => s.heroMode)
  const pinnedSlug = useBlogStore((s) => s.pinnedSlug)
  const articles = useBlogStore((s) => s.articles)
  const hasHydrated = useBlogStore((s) => s.hasHydrated)
  const hydrate = useBlogStore((s) => s.hydrate)
  useEffect(() => {
    hydrate()
  }, [hydrate])
  if (!hasHydrated) return defaultSlug
  if (heroMode === "pinned" && pinnedSlug && articles.some((r) => !r.hidden && r.slug === pinnedSlug)) {
    return pinnedSlug
  }
  return defaultSlug
}
