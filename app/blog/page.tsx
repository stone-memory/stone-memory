"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SelectionSidebar } from "@/components/selection-sidebar"
import { categoryTitles, type ArticleCategory } from "@/lib/data/articles"
import { useTranslation } from "@/lib/i18n/context"
import { useArticles, useBlogHeroSlug } from "@/lib/store/blog"
import { cn } from "@/lib/utils"

type Filter = "all" | ArticleCategory

export default function BlogIndexPage() {
  const { t, locale } = useTranslation()
  const [filter, setFilter] = useState<Filter>("all")
  const articles = useArticles()

  const filtered = useMemo(
    () => (filter === "all" ? articles : articles.filter((a) => a.category === filter)),
    [filter, articles]
  )

  const latestSlug = useMemo(() => {
    const sorted = [...filtered].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    return sorted[0]?.slug ?? ""
  }, [filtered])
  const heroSlug = useBlogHeroSlug(latestSlug)
  const hero = filtered.find((a) => a.slug === heroSlug) || filtered[0]
  const rest = filtered.filter((a) => a.slug !== hero?.slug)

  const cats: { key: Filter; label: string }[] = [
    { key: "all", label: t.blog.categoryAll },
    { key: "stone", label: categoryTitles.stone[locale] },
    { key: "memorials", label: categoryTitles.memorials[locale] },
    { key: "design", label: categoryTitles.design[locale] },
    { key: "care", label: categoryTitles.care[locale] },
    { key: "history", label: categoryTitles.history[locale] },
  ]

  return (
    <>
      <Header />
      <main className="pt-10 md:pt-16">
        <div className="mx-auto max-w-7xl px-6 pb-10 md:pb-16">
          <h1 className="text-5xl font-semibold tracking-tight-custom md:text-7xl text-balance">
            {t.blog.heading}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl text-balance">
            {t.blog.subheading}
          </p>
        </div>

        {/* Category pills */}
        <div className="sticky top-14 z-30 border-b border-foreground/5 bg-background/70 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-6 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {cats.map((c) => (
              <button
                key={c.key}
                onClick={() => setFilter(c.key)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  filter === c.key
                    ? "bg-foreground text-background"
                    : "text-foreground/75 hover:bg-foreground/5 hover:text-foreground"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          {hero && (
            <Link href={`/blog/${hero.slug}`} prefetch className="group block">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="grid gap-8 md:grid-cols-2 md:gap-12"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-foreground/5 ring-1 ring-black/[0.04] shadow-soft md:aspect-[5/4]">
                  <Image
                    src={hero.cover}
                    alt={hero.title[locale]}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-[700ms] group-hover:scale-[1.03]"
                    priority
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    {categoryTitles[hero.category][locale]} · {hero.readMinutes} {t.blog.readingTime}
                  </div>
                  <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight-custom md:text-5xl text-balance">
                    {hero.title[locale]}
                  </h2>
                  <p className="mt-4 text-lg text-muted-foreground md:text-xl text-balance">
                    {hero.excerpt[locale]}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                    {t.blog.readMore} →
                  </span>
                </div>
              </motion.div>
            </Link>
          )}

          <div className="mt-16 grid grid-cols-1 gap-10 md:mt-24 md:grid-cols-3 md:gap-8">
            {rest.map((a, i) => (
              <motion.article
                key={a.slug}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.01 }}
                transition={{ duration: 0.25, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link href={`/blog/${a.slug}`} prefetch className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-foreground/5 ring-1 ring-black/[0.04] shadow-soft transition-[box-shadow,transform] duration-500 group-hover:shadow-hover group-hover:-translate-y-0.5">
                    <Image
                      src={a.cover}
                      alt={a.title[locale]}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-[700ms] group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="mt-5">
                    <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      {categoryTitles[a.category][locale]} · {a.readMinutes} {t.blog.readingTime}
                    </div>
                    <h3 className="mt-2 text-xl font-semibold leading-snug tracking-tight-custom md:text-2xl">
                      {a.title[locale]}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                      {a.excerpt[locale]}
                    </p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <SelectionSidebar />
    </>
  )
}
