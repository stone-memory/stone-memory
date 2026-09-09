"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useTranslation } from "@/lib/i18n/context"
import { useFaqItems, type FaqItem } from "@/lib/store/faq"
import type { Locale } from "@/lib/types"

const sectionLabels: Record<Locale, { eyebrow: string; heading: string; all: string }> = {
  uk: { eyebrow: "FAQ", heading: "Часті запитання", all: "Усі питання й відповіді" },
  pl: { eyebrow: "FAQ", heading: "Najczęściej zadawane pytania", all: "Wszystkie pytania" },
  en: { eyebrow: "FAQ", heading: "Frequently asked questions", all: "All questions" },
  de: { eyebrow: "FAQ", heading: "Häufig gestellte Fragen", all: "Alle Fragen" },
  lt: { eyebrow: "DUK", heading: "Dažniausiai užduodami klausimai", all: "Visi klausimai" },
}

/**
 * Питання приходять із сервера (`initialItems`), тому вони є в HTML одразу.
 *
 * Раніше секція читала лише клієнтський store і до гідратації не рендерила
 * нічого — а FAQPage-розмітка на сторінці була. Google трактує таку
 * розмітку без видимого тексту як порушення. Store лишається для живих правок
 * з адмінки: щойно він гідратований і не порожній — бере гору.
 */
export function FaqSection({ initialItems = [], limit }: { initialItems?: FaqItem[]; limit?: number }) {
  const { locale } = useTranslation()
  const L = sectionLabels[locale] || sectionLabels.uk
  const storeItems = useFaqItems()
  const all = storeItems.length > 0 ? storeItems : initialItems
  const items = limit ? all.slice(0, limit) : all
  if (items.length === 0) return null

  return (
    <section id="faq" className="bg-secondary/50 py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-8 text-center md:mb-10">
          <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
            {L.eyebrow}
          </span>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight-custom md:text-6xl text-balance">
            {L.heading}
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Accordion type="single" collapsible className="flex flex-col gap-3">
            {items.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="rounded-2xl bg-card px-6 ring-1 ring-black/[0.06] shadow-soft border-b-0"
              >
                <AccordionTrigger className="py-5 text-base font-semibold tracking-tight-custom hover:no-underline md:text-lg">
                  {item.q[locale] || item.q.uk}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-[15px] leading-relaxed text-muted-foreground md:text-base">
                  {item.a[locale] || item.a.uk}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {limit && all.length > limit && (
          <div className="mt-8 text-center">
            <Link
              href="/pytannya"
              className="group inline-flex items-center gap-2 rounded-full border border-foreground/15 px-5 py-2.5 text-sm font-medium transition-colors hover:border-foreground/40"
            >
              {L.all}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
