"use client"

import { useState } from "react"
import { useBusinessProfile } from "@/lib/store/business-profile"
import { toTelHref } from "@/lib/phone-format"
import Image from "next/image"
import Link from "next/link"
import { Check } from "lucide-react"
import { useSelectionStore } from "@/lib/store/selection"
import { usePopularityStore } from "@/lib/store/popularity"
import { useTranslation } from "@/lib/i18n/context"
import { filterLabels, shapeLabel, finishLabel } from "@/lib/i18n/filters"
import { stoneCode, stoneDisplayName, stonePath } from "@/lib/catalog-taxonomy"
import { stoneAlt } from "@/lib/stone-meta"
import { defaultStone } from "@/lib/stone-guide"
import type { StoneItem, Locale } from "@/lib/types"
import { cn } from "@/lib/utils"

interface StoneCardProps {
  item: StoneItem
  showBestseller?: boolean
  /**
   * Eager-load this card's image and mark it as an LCP candidate.
   *
   * Lighthouse identified the first card's <img> as the catalogue's LCP
   * element while it still carried loading="lazy" — the browser was told to
   * defer the one image that decides the score.
   */
  priority?: boolean
  /**
   * Рівень заголовка картки. У каталозі над сіткою стоїть лише h1, і h3 у
   * картках рвав порядок заголовків (Lighthouse heading-order); там — h2.
   * У блоках «схожі моделі» під власним h2 лишається h3.
   */
  headingTag?: "h2" | "h3"
}

// Memorial only; anything else falls back to the raw value rather than being
// mislabelled as a product line that no longer exists.
const categoryLabels: Record<string, Record<Locale, string>> = {
  memorial: { uk: "ПАМ'ЯТНИКИ", pl: "POMNIKI", en: "MONUMENTS", de: "GRABMALE", lt: "PAMINKLAI" },
}

const bestsellerLabels: Record<Locale, string> = {
  uk: "ХІТ",
  pl: "HIT",
  en: "BESTSELLER",
  de: "BESTSELLER",
  lt: "HITAS",
}

const addToCartLabels: Record<Locale, string> = {
  uk: "В кошик",
  pl: "Do koszyka",
  en: "Add to cart",
  de: "In den Warenkorb",
  lt: "Į krepšelį",
}

const inCartLabels: Record<Locale, string> = {
  uk: "У кошику",
  pl: "W koszyku",
  en: "In cart",
  de: "Im Warenkorb",
  lt: "Krepšelyje",
}

function buildDescription(item: StoneItem, locale: Locale): string {
  const finish = item.finish ? finishLabel(item.finish, locale, item.i18n?.finish).toLowerCase() : ""
  const categoryWord: Record<Locale, string> = {
    uk: item.category === "memorial" ? "пам'ятник" : "виріб з каменю",
    pl: item.category === "memorial" ? "pomnik" : "wyrób kamienny",
    en: item.category === "memorial" ? "monument" : "stone piece",
    de: item.category === "memorial" ? "Grabmal" : "Steinwerk",
    lt: item.category === "memorial" ? "paminklas" : "akmens gaminys",
  }
  const templates: Record<Locale, string> = {
    uk: `Натуральний камінь, ${categoryWord.uk}${finish ? `, ${finish} обробка` : ""}.`,
    pl: `Naturalny kamień, ${categoryWord.pl}${finish ? `, wykończenie ${finish}` : ""}.`,
    en: `Natural stone ${categoryWord.en}${finish ? `, ${finish} finish` : ""}.`,
    de: `Naturstein, ${categoryWord.de}${finish ? `, ${finish} Oberfläche` : ""}.`,
    lt: `Natūralus akmuo, ${categoryWord.lt}${finish ? `, ${finish} apdaila` : ""}.`,
  }
  return templates[locale]
}

// Підписи характеристик беремо з filterLabels — того самого словника, що й
// сторінка товару. Доки картка тримала власну копію, сторінка товару лишалась
// без перекладу й показувала «Size» в усіх мовах.

export function StoneCard({ item, showBestseller, priority = false, headingTag: Heading = "h3" }: StoneCardProps) {
  const phone = useBusinessProfile().phone
  const [showSuccess, setShowSuccess] = useState(false)
  const [imageSrc, setImageSrc] = useState(item.imagePath)
  const { addItem, items } = useSelectionStore()
  const incrementPopularity = usePopularityStore((s) => s.increment)
  const { t, locale, formatPrice } = useTranslation()
  const isSelected = items.some((i) => i.id === item.id)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isSelected) return
    addItem(item)
    incrementPopularity(item.id)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 600)
  }

  const categoryLabel = categoryLabels[item.category]?.[locale] ?? item.category
  const subLabel = item.shape
    ? shapeLabel(item.shape, locale, item.i18n?.shape).toUpperCase()
    : item.finish
    ? finishLabel(item.finish, locale, item.i18n?.finish).toUpperCase()
    : ""
  const stone = defaultStone(item)
  const description = buildDescription(item, locale)
  const L = filterLabels[locale]

  return (
    <article
      // Картки з priority — це перший екран каталогу, серед них LCP-елемент:
      // вони приходять в HTML одразу видимими. Решта з'являється CSS-анімацією
      // .card-reveal (globals.css) під час прокрутки, без JS і без
      // framer-motion: 24 motion.article на сторінці коштували гідратації.
      className={cn("group relative h-full", !priority && "card-reveal")}
    >
      <Link
        href={stonePath(item)}
        prefetch
        // Без aria-label: він містив лише назву, а видимий текст посилання — уся
        // картка, і читач екрана отримував ім'я, що не збігається з написом
        // (Lighthouse label-content-name-mismatch). Ім'я тепер із вмісту.
        className="flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-soft ring-1 ring-black/[0.04] transition-[box-shadow,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-hover hover:-translate-y-0.5"
      >
        <div className="relative aspect-[16/11] overflow-hidden bg-foreground/5">
          <Image
            src={imageSrc}
            alt={stoneAlt(item, locale)}
            fill
            // На телефоні картка займає ширину екрана мінус відступи px-6, а
            // 100vw змушувало брати 750 px замість 640 — зайві 27 % пікселів
            // на кожному з 24 фото сторінки.
            sizes="(max-width: 640px) calc(100vw - 48px), (max-width: 1024px) 50vw, 33vw"
            // Фото каменю в картці — найважчий ресурс каталогу (до 106 КБ при
            // q75); q65 у webp на розмірі мініатюри візуально не відрізнити,
            // а важить на чверть менше. Значення має бути в images.qualities.
            quality={65}
            priority={priority}
            // Next 16 з priority додає лише <link rel=preload>; без явного
            // fetchpriority браузер тягне LCP-картинку зі звичайним пріоритетом.
            fetchPriority={priority ? "high" : undefined}
            onError={() => setImageSrc("/stones/memorial-01.svg")}
            className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]"
          />
          {(showBestseller || item.isFeatured) && (
            <div className="absolute left-4 top-4 rounded-full bg-foreground px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-background">
              {bestsellerLabels[locale]}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6">
          {/* Дрібніший кегль і менший трекінг, ніж решта підписів: рядок несе
              дві назви одразу, і після появи довгих типів («Військовий
              пам'ятник», «Пам'ятник європейський») він переносився на два рядки
              на телефоні. Зменшення дає йому вміститись без обрізання. */}
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            <span>{categoryLabel}</span>
            {subLabel && (
              <>
                <span className="opacity-50">•</span>
                <span>{subLabel}</span>
              </>
            )}
          </div>

          <Heading className="mt-3 text-xl font-semibold tracking-tight-custom tabular-nums">
            {stoneDisplayName(item) ?? `№ ${stoneCode(item)}`}
          </Heading>

          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground line-clamp-2">
            {description}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {/* Камінь із фотографії — той самий макрознімок, що в селекторі на
                сторінці товару, щоб у каталозі було видно породу, а не лише колір. */}
            <span className="inline-flex items-center gap-2 rounded-full bg-foreground/[0.04] py-1 pl-1 pr-3 text-[12px] text-foreground/75">
              <span className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full ring-1 ring-foreground/10">
                <Image src={stone.swatch} alt="" fill sizes="20px" className="object-cover" />
              </span>
              {stone.name}
            </span>
            {item.sizeCm && (
              <span className="inline-flex items-center rounded-full bg-foreground/[0.04] px-3 py-1.5 text-[12px] text-foreground/75">
                {L.size}: {item.sizeCm}
              </span>
            )}
            {item.weightKg && (
              <span className="inline-flex items-center rounded-full bg-foreground/[0.04] px-3 py-1.5 text-[12px] text-foreground/75">
                {L.weight}: {item.weightKg} kg
              </span>
            )}
            {item.finish && (
              <span className="inline-flex items-center rounded-full bg-foreground/[0.04] px-3 py-1.5 text-[12px] text-foreground/75">
                {finishLabel(item.finish, locale, item.i18n?.finish)}
              </span>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 pt-6">
            {item.priceFrom ? (
              <>
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {t.catalog.fromPrice}
                  </span>
                  <span className="text-xl font-semibold tabular-nums">
                    {formatPrice(item.priceFrom)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={isSelected}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all active:scale-[0.96]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isSelected
                      ? "bg-success/10 text-success"
                      : "bg-accent text-accent-foreground hover:-translate-y-[1px] hover:brightness-110"
                  )}
                  aria-label={isSelected ? inCartLabels[locale] : addToCartLabels[locale]}
                >
                  {showSuccess || isSelected ? (
                    <span
                      key="check"
                      className="inline-flex items-center gap-2 animate-in fade-in zoom-in-75 duration-200"
                    >
                      <Check className="h-4 w-4" strokeWidth={2.25} />
                      {inCartLabels[locale]}
                    </span>
                  ) : (
                    <span key="add">{addToCartLabels[locale]}</span>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  window.location.href = toTelHref(phone)
                }}
                className="w-full inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:-translate-y-[1px] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {t.catalog.requestQuote}
              </button>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
