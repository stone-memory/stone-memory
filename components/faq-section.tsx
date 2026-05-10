"use client"

import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useTranslation } from "@/lib/i18n/context"
import { useFaqItems } from "@/lib/store/faq"
import type { Locale } from "@/lib/types"

// Заголовок секції FAQ — самі питання беремо з Supabase store/faq.
// Якщо store ще не гідратовано — нічого не показуємо (краще ніж старий
// дубльований mock-контент який раніше тут жив).
const sectionLabels: Record<Locale, { eyebrow: string; heading: string }> = {
  uk: { eyebrow: "FAQ", heading: "Часті запитання" },
  pl: { eyebrow: "FAQ", heading: "Najczęściej zadawane pytania" },
  en: { eyebrow: "FAQ", heading: "Frequently asked questions" },
  de: { eyebrow: "FAQ", heading: "Häufig gestellte Fragen" },
  lt: { eyebrow: "DUK", heading: "Dažniausiai užduodami klausimai" },
}

export function FaqSection() {
  const { locale } = useTranslation()
  const L = sectionLabels[locale] || sectionLabels.uk
  const storeItems = useFaqItems()
  if (storeItems.length === 0) return null

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
            {storeItems.map((item) => (
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
      </div>
    </section>
  )
}
