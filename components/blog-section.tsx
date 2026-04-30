"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { useArticles } from "@/lib/store/blog"
import { useTranslation } from "@/lib/i18n/context"

export function BlogSection() {
  const { t, locale } = useTranslation()
  const articles = useArticles()
  const featured = articles.slice(0, 3)

  return (
    <section id="blog" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col items-start gap-4 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              {t.blog.label}
            </span>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight-custom md:text-6xl text-balance">
              {t.blog.heading}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl text-balance">
              {t.blog.subheading}
            </p>
          </div>
          <Link
            href="/blog"
            prefetch
            className="group inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-foreground hover:text-background hover:-translate-y-[1px]"
          >
            {t.catalog.viewAll}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {featured.map((a, i) => (
            <motion.article
              key={a.slug}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.01 }}
              transition={{ duration: 0.25, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href={`/blog/${a.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-foreground/5 ring-1 ring-black/[0.04] shadow-soft transition-[box-shadow,transform] duration-500 hover:shadow-hover hover:-translate-y-0.5">
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
                    {a.readMinutes} {t.blog.readingTime}
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
    </section>
  )
}
