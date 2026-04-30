"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Star, ArrowRight } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"
import { useReviewsForPlacement } from "@/lib/store/reviews"
import type { Locale } from "@/lib/types"

const labels: Record<Locale, { heading: string; all: string }> = {
  uk: { heading: "Що кажуть клієнти", all: "Усі відгуки" },
  pl: { heading: "Co mówią klienci", all: "Wszystkie opinie" },
  en: { heading: "What our clients say", all: "All reviews" },
  de: { heading: "Was unsere Kunden sagen", all: "Alle Bewertungen" },
  lt: { heading: "Ką sako klientai", all: "Visi atsiliepimai" },
}

export function ReviewsSection() {
  const { locale } = useTranslation()
  const L = labels[locale]
  const items = useReviewsForPlacement("home")
  const display = items.slice(0, 6)

  return (
    <section id="reviews" className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 flex flex-col items-start gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-2xl text-4xl font-semibold tracking-tight-custom md:text-6xl text-balance">
            {L.heading}
          </h2>
          <Link
            href="/reviews"
            prefetch
            className="group inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:-translate-y-[1px]"
          >
            {L.all}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </Link>
        </div>

        {/* Desktop: up to 5 in a grid (3 + 2 or 5 across) · Mobile: first 3 shown */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {display.map((review, i) => (
            <motion.article
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.3, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              className={`flex flex-col rounded-2xl bg-card p-8 ring-1 ring-black/[0.06] shadow-soft ${
                // Hide 4th+ on mobile (keep 3), show all on md+
                i >= 3 ? "hidden md:flex" : ""
              }`}
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={
                      idx < review.rating
                        ? "h-4 w-4 fill-[#F59E0B] text-[#F59E0B]"
                        : "h-4 w-4 text-muted-foreground/30"
                    }
                  />
                ))}
              </div>

              <p className="mt-6 flex-1 text-[15px] leading-relaxed text-muted-foreground md:text-base">
                {review.text}
              </p>

              <div className="mt-8 flex items-center justify-between border-t border-foreground/[0.06] pt-5">
                <span className="text-sm font-semibold text-foreground">{review.name}</span>
                <span className="text-sm text-muted-foreground tabular-nums">{review.date}</span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
