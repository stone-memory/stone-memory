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
 * "Що саме ми робимо" — повноширинний блок на головній.
 *
 * Раніше тут була сітка з двох карток. Після зняття лінійки «Дім і сад»
 * лишилась одна, і вона висіла обрізаною по ліву половину сітки — виглядало
 * як недовантажена сторінка. Тому не картка в сітці, а горизонтальний блок:
 * фото ліворуч, зміст праворуч. Одна пропозиція так читається як навмисна,
 * а не як залишок від двох.
 *
 * Дані ті самі й далі редагуються в /admin/homepage — змінилась лише
 * розкладка.
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

      <FeatureBlock card={content.memorial} locale={locale} />
    </section>
  )
}

function FeatureBlock({
  card,
  locale,
}: {
  card: HomepageCategoryCard
  locale: keyof HomepageCategoryCard["title"]
}) {
  const items = card.items[locale] || []

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group overflow-hidden rounded-3xl bg-card ring-1 ring-black/[0.04] shadow-soft transition-[box-shadow,transform] duration-300 hover:shadow-hover hover:-translate-y-0.5"
    >
      <Link
        href={card.href}
        prefetch
        className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] lg:items-stretch"
      >
        {/* Фото тягнеться на всю висоту блоку, тому aspect задано лише на
            мобільному — на десктопі висоту диктує колонка з текстом. */}
        <div className="relative aspect-[16/10] overflow-hidden bg-foreground/5 lg:aspect-auto lg:min-h-[26rem]">
          {card.image && (
            <Image
              src={card.image}
              alt={card.title[locale] || ""}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              priority
              className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]"
              unoptimized={shouldBypassOptimizer(card.image)}
            />
          )}
          {/* Градієнт лише під мобільний заголовок — на десктопі назва
              переїжджає в текстову колонку, і затемнювати фото немає навіщо. */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent lg:hidden" />
          <h3 className="absolute bottom-6 left-6 text-3xl font-semibold tracking-tight-custom text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] lg:hidden">
            {card.title[locale]}
          </h3>
        </div>

        <div className="flex flex-col justify-center p-6 md:p-8 lg:p-10">
          <h3 className="hidden text-3xl font-semibold tracking-tight-custom text-balance lg:block xl:text-4xl">
            {card.title[locale]}
          </h3>
          <p className="text-[15px] leading-relaxed text-muted-foreground md:text-base lg:mt-4">
            {card.description[locale]}
          </p>

          {items.length > 0 && (
            <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-2.5 text-[15px] text-foreground/85 sm:grid-cols-2">
              {items.map((i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-[0.55rem] inline-block h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
                  {i}
                </li>
              ))}
            </ul>
          )}

          <span className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform group-hover:-translate-y-[1px]">
            {card.cta[locale]}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </span>
        </div>
      </Link>
    </motion.article>
  )
}
