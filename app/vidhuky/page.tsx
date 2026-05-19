"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SelectionSidebar } from "@/components/selection-sidebar"
import { useTranslation } from "@/lib/i18n/context"
import { useReviewsForPlacement } from "@/lib/store/reviews"
import type { Locale } from "@/lib/types"

const copy: Record<Locale, { title: string; subtitle: string }> = {
  uk: {
    title: "Відгуки клієнтів з Google",
    subtitle: "",
  },
  pl: {
    title: "Opinie klientów z Google",
    subtitle: "",
  },
  en: {
    title: "Client reviews from Google",
    subtitle: "",
  },
  de: {
    title: "Kundenbewertungen aus Google",
    subtitle: "",
  },
  lt: {
    title: "Klientų atsiliepimai iš Google",
    subtitle: "",
  },
}

export default function ReviewsPage() {
  const { locale } = useTranslation()
  const C = copy[locale]
  const reviews = useReviewsForPlacement("all")
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  return (
    <>
      <Header />
      <main id="main-content">
        <section className="mx-auto max-w-7xl px-6 pb-10 pt-10 md:pb-16 md:pt-16">
          <h1 className="text-4xl font-semibold tracking-tight-custom md:text-6xl text-balance">
            {C.title}
          </h1>
          <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-foreground/5 px-4 py-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={
                    i < Math.round(avg)
                      ? "h-4 w-4 fill-[#F59E0B] text-[#F59E0B]"
                      : "h-4 w-4 text-muted-foreground/30"
                  }
                />
              ))}
            </div>
            <span className="text-sm font-semibold tabular-nums">{avg.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">· {reviews.length}</span>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20 md:pb-28">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {reviews.map((r, i) => (
              <motion.article
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.05 }}
                transition={{ duration: 0.3, delay: (i % 6) * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col rounded-2xl bg-card p-7 ring-1 ring-black/[0.06] shadow-soft"
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={
                        idx < r.rating
                          ? "h-4 w-4 fill-[#F59E0B] text-[#F59E0B]"
                          : "h-4 w-4 text-muted-foreground/30"
                      }
                    />
                  ))}
                </div>
                <p className="mt-5 flex-1 text-[15px] leading-relaxed text-muted-foreground">
                  {r.text}
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-foreground/[0.06] pt-4">
                  <span className="text-sm font-semibold">{r.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{r.date}</span>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <SelectionSidebar />
    </>
  )
}
