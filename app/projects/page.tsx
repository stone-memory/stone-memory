"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SelectionSidebar } from "@/components/selection-sidebar"
import { categoryLabels, type ProjectCategory } from "@/lib/data/projects"
import { useProjects, useVisibleCategories } from "@/lib/store/projects"
import { useTranslation } from "@/lib/i18n/context"
import type { Locale } from "@/lib/types"
import { cn } from "@/lib/utils"

type Filter = "all" | ProjectCategory

const heading: Record<Locale, { title: string; subtitle: string; all: string }> = {
  uk: {
    title: "Портфоліо проектів",
    subtitle: "Роботи, які ми зробили для клієнтів. Меморіали, стільниці, каміни, сходи, фасади та інтер'єри.",
    all: "Усі",
  },
  pl: {
    title: "Portfolio",
    subtitle: "Realizacje dla klientów: pomniki, blaty, kominki, schody, fasady i wnętrza.",
    all: "Wszystkie",
  },
  en: {
    title: "Project portfolio",
    subtitle: "Work we did for clients: memorials, countertops, fireplaces, stairs, facades and interiors.",
    all: "All",
  },
  de: {
    title: "Projekte",
    subtitle: "Kundenprojekte: Grabmale, Arbeitsplatten, Kamine, Treppen, Fassaden und Interieurs.",
    all: "Alle",
  },
  lt: {
    title: "Projektų portfolio",
    subtitle: "Klientų darbai: paminklai, stalviršiai, židiniai, laiptai, fasadai ir interjerai.",
    all: "Visi",
  },
}

export default function ProjectsPage() {
  const { locale } = useTranslation()
  const H = heading[locale]
  const [filter, setFilter] = useState<Filter>("all")
  const projects = useProjects()
  const visibleCats = useVisibleCategories()

  const filtered = useMemo(
    () => {
      const byVisibility = projects.filter((p) => visibleCats.includes(p.category))
      return filter === "all" ? byVisibility : byVisibility.filter((p) => p.category === filter)
    },
    [filter, projects, visibleCats]
  )

  const cats: { key: Filter; label: string }[] = [
    { key: "all", label: H.all },
    ...visibleCats.map((c) => ({
      key: c,
      label: categoryLabels[c][locale],
    })),
  ]

  return (
    <>
      <Header />
      <main id="main-content">
        <section className="mx-auto max-w-7xl px-6 pb-8 pt-8 md:pb-12 md:pt-12">
          <h1 className="text-4xl font-semibold tracking-tight-custom md:text-6xl text-balance">
            {H.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl text-balance">
            {H.subtitle}
          </p>
        </section>

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

        <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          {filtered.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">—</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p, i) => (
                <motion.article
                  key={p.slug}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.3, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-black/[0.04] shadow-soft transition-[box-shadow,transform] duration-300 hover:shadow-hover hover:-translate-y-0.5"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-foreground/5">
                    <Image
                      src={p.cover}
                      alt={`${p.title[locale]} — ${categoryLabels[p.category][locale]}, ${p.city} ${p.year}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]"
                    />
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium text-foreground backdrop-blur">
                      {categoryLabels[p.category][locale]}
                    </div>
                  </div>
                  <div className="p-5 md:p-6">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {p.city} · {p.year}
                    </div>
                    <h3 className="mt-1.5 text-lg font-semibold tracking-tight-custom md:text-xl">
                      {p.title[locale]}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {p.description[locale]}
                    </p>
                    <div className="mt-3 text-[12px] text-foreground/70">
                      {p.materials[locale]}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          <div className="mt-16 rounded-3xl bg-foreground p-8 text-background md:mt-24 md:p-12">
            <h3 className="text-2xl font-semibold tracking-tight-custom md:text-4xl text-balance max-w-2xl">
              {locale === "uk"
                ? "Розкажіть свою ідею — ми допоможемо її втілити"
                : locale === "pl"
                ? "Opowiedz nam swój pomysł — pomożemy go zrealizować"
                : locale === "de"
                ? "Erzählen Sie uns Ihre Idee — wir setzen sie um"
                : locale === "lt"
                ? "Papasakokite savo idėją — padėsime ją įgyvendinti"
                : "Tell us your idea — we'll help you bring it to life"}
            </h3>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/catalog"
                prefetch
                className="inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-transform hover:-translate-y-[1px]"
              >
                {locale === "uk" ? "Переглянути каталог" : locale === "pl" ? "Zobacz katalog" : locale === "de" ? "Zum Katalog" : locale === "lt" ? "Katalogas" : "Browse catalog"}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <SelectionSidebar />
    </>
  )
}
