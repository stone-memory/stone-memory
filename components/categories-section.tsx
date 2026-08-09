"use client"

import Image from "next/image"
import { shouldBypassOptimizer } from "@/lib/image-source"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"
import {
  useHomepageCategories,
  type HomepageCategoryCard,
} from "@/lib/store/homepage"

/**
 * "Що саме ми робимо" — two-card hero section on the homepage.
 *
 * Content is admin-editable via /admin/homepage. Until admin saves
 * anything, falls back to the seeded DEFAULT_HOMEPAGE_CATEGORIES copy
 * (which matches what was hardcoded here previously, so the visual is
 * identical out of the box).
 */
export function CategoriesSection() {
  const { locale } = useTranslation()
  const content = useHomepageCategories()

  return (
    <section id="categories" className="mx-auto max-w-7xl px-6 pt-14 pb-2 md:pt-20">
      <div className="mb-8 md:mb-10">
        <h2 className="text-4xl font-semibold tracking-tight-custom md:text-6xl text-balance">
          {content.heading[locale]}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <CategoryCard card={content.memorial} locale={locale} priority />
        <CategoryCard card={content.home} locale={locale} priority />
      </div>
    </section>
  )
}

function CategoryCard({
  card,
  locale,
  priority = false,
}: {
  card: HomepageCategoryCard
  locale: keyof HomepageCategoryCard["title"]
  priority?: boolean
}) {
  const items = card.items[locale] || []
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-3xl bg-card ring-1 ring-black/[0.04] shadow-soft transition-[box-shadow,transform] duration-300 hover:shadow-hover hover:-translate-y-0.5"
    >
      <Link href={card.href} prefetch className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-foreground/5">
          {card.image && (
            <Image
              src={card.image}
              alt={card.title[locale] || ""}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority={priority}
              className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]"
              unoptimized={shouldBypassOptimizer(card.image)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          <h3 className="absolute bottom-6 left-6 text-3xl font-semibold tracking-tight-custom text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] md:text-4xl">
            {card.title[locale]}
          </h3>
        </div>
        <div className="p-6 md:p-8">
          <p className="text-[15px] leading-relaxed text-muted-foreground md:text-base">
            {card.description[locale]}
          </p>
          {items.length > 0 && (
            <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-[14px] text-foreground/85">
              {items.map((i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="inline-block h-1 w-1 rounded-full bg-foreground/40" />
                  {i}
                </li>
              ))}
            </ul>
          )}
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-foreground">
            {card.cta[locale]}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
