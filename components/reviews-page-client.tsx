"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SelectionSidebar } from "@/components/selection-sidebar"
import { useTranslation } from "@/lib/i18n/context"
import { useReviewsForPlacement, type Review } from "@/lib/store/reviews"
import type { Locale } from "@/lib/types"

const copy: Record<Locale, { title: string; subtitle: string; empty: string }> = {
  uk: {
    title: "Відгуки клієнтів",
    subtitle: "Родини, для яких ми виготовили й встановили пам'ятники. Відгуки з Google та надіслані нам напряму.",
    empty: "Ми збираємо відгуки родин, з якими працювали. Поки що подивіться виконані роботи в каталозі або напишіть нам — розповімо, кому ми вже встановили пам'ятники у вашому місті.",
  },
  pl: {
    title: "Opinie klientów",
    subtitle: "Rodziny, dla których wykonaliśmy i zamontowaliśmy pomniki.",
    empty: "Zbieramy opinie rodzin, z którymi pracowaliśmy. Zobacz wykonane prace w katalogu lub napisz do nas.",
  },
  en: {
    title: "Client reviews",
    subtitle: "Families we made and installed monuments for.",
    empty: "We are collecting reviews from the families we have worked with. See finished work in the catalogue or write to us.",
  },
  de: {
    title: "Kundenbewertungen",
    subtitle: "Familien, für die wir Grabmale gefertigt und montiert haben.",
    empty: "Wir sammeln Bewertungen der Familien, mit denen wir gearbeitet haben. Sehen Sie sich fertige Arbeiten im Katalog an oder schreiben Sie uns.",
  },
  lt: {
    title: "Klientų atsiliepimai",
    subtitle: "Šeimos, kurioms pagaminome ir sumontavome paminklus.",
    empty: "Renkame šeimų, su kuriomis dirbome, atsiliepimus. Peržiūrėkite atliktus darbus kataloge arba parašykite mums.",
  },
}

/** Reviews arrive from the server so the testimonials are in the initial HTML. */
export function ReviewsPageClient({ initialReviews }: { initialReviews: Review[] }) {
  const { locale } = useTranslation()
  const C = copy[locale]
  const storeReviews = useReviewsForPlacement("all")
  const reviews = storeReviews.length > 0 ? storeReviews : initialReviews
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  return (
    <>
      <Header />
      <main id="main-content">
        <section className="mx-auto max-w-7xl px-6 pb-10 pt-10 md:pb-16 md:pt-16">
          <h1 className="text-4xl font-semibold tracking-tight-custom md:text-6xl text-balance">
            {C.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground text-balance md:text-lg">{C.subtitle}</p>
          {reviews.length === 0 && (
            <div className="mt-8 max-w-2xl rounded-2xl bg-secondary/60 p-6 text-[15px] leading-relaxed text-foreground/85">
              {C.empty}
            </div>
          )}
          <div className={reviews.length === 0 ? "hidden" : "mt-6 inline-flex items-center gap-3 rounded-full bg-foreground/5 px-4 py-2"}>
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
