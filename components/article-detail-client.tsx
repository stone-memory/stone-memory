"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { SelectionSidebar } from "@/components/selection-sidebar"
import { categoryTitles, type Article } from "@/lib/data/articles"
import { useTranslation } from "@/lib/i18n/context"
import { useArticles } from "@/lib/store/blog"

type Props = {
  /** Resolved on the server so the article body ships in the initial HTML. */
  initialArticle: Article
  initialArticles: Article[]
}

/**
 * Was a client component that rendered `null` until the blog store hydrated,
 * so every article was an empty document to crawlers — nine long-form guides
 * that no search engine could read. Content now arrives as props; the store is
 * still consulted so admin edits appear without a reload.
 */
export function ArticleDetailClient({ initialArticle, initialArticles }: Props) {
  const { t, locale } = useTranslation()
  const storeArticles = useArticles()
  const articles = storeArticles.length > 0 ? storeArticles : initialArticles
  const article = articles.find((a) => a.slug === initialArticle.slug) ?? initialArticle

  const body = article.body[locale] || article.body.en || []
  const related = articles
    .filter((a) => a.category === article.category && a.slug !== article.slug)
    .slice(0, 3)

  return (
    <>
      <Header />
      <main id="main-content">
        <article className="mx-auto max-w-4xl px-6 pt-10 pb-16 md:pt-14 md:pb-24">
          <Breadcrumbs
            items={[
              { name: t.nav.blog, href: "/blog" },
              { name: article.title[locale] },
            ]}
          />

          <Link href="/blog" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            {t.blog.back}
          </Link>

          <header className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr] md:items-start md:gap-10">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-foreground/5 md:aspect-[1/1]">
              <Image
                src={article.cover}
                alt={article.title[locale]}
                fill
                sizes="(max-width: 768px) 100vw, 240px"
                className="object-cover"
                priority
              />
            </div>
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                {categoryTitles[article.category][locale]} · {article.readMinutes} {t.blog.readingTime}
              </div>
              <h1 className="mt-3 text-3xl font-semibold leading-[1.15] tracking-tight-custom text-balance md:text-4xl">
                {article.title[locale]}
              </h1>
              <p className="mt-4 text-base text-muted-foreground md:text-lg leading-relaxed text-balance">
                {article.excerpt[locale]}
              </p>
            </div>
          </header>

          <div className="mt-12 space-y-7 md:mt-14">
            {body.map((block, i) => (
              <div key={i}>
                {block.heading && (
                  <h2 className="text-xl font-semibold tracking-tight-custom md:text-2xl">
                    {block.heading}
                  </h2>
                )}
                <p className="mt-3 text-[16px] leading-relaxed text-foreground/85 md:text-[17px]">
                  {block.text}
                </p>
              </div>
            ))}
          </div>
        </article>

        {/* Related */}
        {related.length > 0 && (
          <section className="border-t border-foreground/5 bg-secondary/50 py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-6">
              <h2 className="text-2xl font-semibold tracking-tight-custom md:text-3xl">
                {t.blog.relatedHeading}
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
                {related.map((a) => (
                  <Link key={a.slug} href={`/blog/${a.slug}`} className="group block">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-foreground/5 shadow-soft transition-[box-shadow,transform] duration-500 group-hover:shadow-hover group-hover:-translate-y-0.5">
                      <Image src={a.cover} alt={a.title[locale]} fill sizes="33vw" className="object-cover transition-transform duration-[700ms] group-hover:scale-[1.04]" />
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold tracking-tight-custom md:text-xl">{a.title[locale]}</h3>
                      <p className="mt-1.5 text-sm text-muted-foreground">{a.excerpt[locale]}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
      <SelectionSidebar />
    </>
  )
}
