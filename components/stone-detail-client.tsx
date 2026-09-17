"use client"

import { useState, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Check, Plus, Truck, Award, Share2 } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { SelectionSidebar } from "@/components/selection-sidebar"
import { StoneCard } from "@/components/stone-card"
import { useSelectionStore } from "@/lib/store/selection"
import { useTranslation } from "@/lib/i18n/context"
import { filterLabels, colorLabel, shapeLabel, finishLabel, materialLabel } from "@/lib/i18n/filters"
import { stoneCode, stoneDisplayName } from "@/lib/catalog-taxonomy"
import { MaterialPicker, type MaterialChoice } from "@/components/material-picker"
import { defaultStone } from "@/lib/stone-guide"
import { stoneAlt, stoneHeading } from "@/lib/stone-meta"
import { WARRANTY_YEARS } from "@/lib/site-facts"
import { toTelHref } from "@/lib/phone-format"
import { cn } from "@/lib/utils"
import type { StoneItem } from "@/lib/types"

const PHONE_DISPLAY = "+38 (068) 808-02-22"

// Раніше бралось із t.hero.badge — але бейдж hero тепер про майстерню, а не
// про гарантію, і чіп довіри на картці має казати саме про гарантію.
const WARRANTY_LABEL: Record<string, string> = {
  uk: `${WARRANTY_YEARS} років гарантії`,
  pl: `${WARRANTY_YEARS} lat gwarancji`,
  en: `${WARRANTY_YEARS}-year warranty`,
  de: `${WARRANTY_YEARS} Jahre Garantie`,
  lt: `${WARRANTY_YEARS} metų garantija`,
}

type Props = {
  /** Resolved on the server, so the markup below is in the initial HTML. */
  stone: StoneItem
  /** «Схожі моделі», відібрані на сервері (lib/related-stones.ts). */
  related: StoneItem[]
  /** Термін виготовлення з product-copy — рядок у характеристиках (лише uk). */
  leadTime: string
  /** Перший абзац опису моделі — підзаголовок під h1 (лише uk). */
  storyLead: string
  /**
   * Серверний блок «Про цю модель» (components/stone-story.tsx). Приходить
   * готовим HTML; тут лише вирішуємо, чи показувати його для поточної локалі.
   */
  story?: ReactNode
  /** «Від чого залежить ціна» — праворуч під характеристиками (лише uk). */
  storyAside?: ReactNode
}

/**
 * The page used to be a client component that read everything from the zustand
 * store and rendered `null` until it hydrated — which meant crawlers received a
 * document with no h1, no copy and no links. Data now arrives as props from the
 * server component.
 *
 * Клієнтом лишається тільки інтерактив: галерея, вибір каменю, кошик,
 * «поділитись». Раніше сюди приходив увесь каталог (200+ позицій, ~150 КБ у
 * RSC-навантаженні) заради шести схожих карток, а після гідратації сторінка
 * ще й тягнула /api/content/stones (145 КБ) для «живих» правок з адмінки —
 * їх тепер покриває скидання ISR-кешу з адмінки.
 */
export function StoneDetailClient({ stone, related, leadTime, storyLead, story, storyAside }: Props) {
  const { t, locale, formatPrice } = useTranslation()
  const { addItem, items, openSidebar } = useSelectionStore()
  const [active, setActive] = useState(0)
  const [shared, setShared] = useState(false)
  const [choice, setChoice] = useState<MaterialChoice | null>(null)

  const gallery = stone.gallery && stone.gallery.length > 0 ? stone.gallery : [stone.imagePath]


  // Камінь із фотографії — дефолт селектора й база для перерахунку цін.
  const defaultEntry = defaultStone(stone)
  const shownPrice = choice?.price ?? stone.priceFrom

  const L = filterLabels[locale]
  const isSelected = items.some((i) => i.id === stone.id)
  const displayName = stoneDisplayName(stone) ?? `№ ${stoneCode(stone)}`
  // Descriptive h1 and alt text — the page used to render the bare code ("001")
  // as its only heading, which gave 60 products 60 near-identical headings with
  // no keyword in any of them.
  const heading = stoneHeading(stone, locale)
  const imageAlt = stoneAlt(stone, locale)
  // Змістовний опис замість одного шаблону на всі картки: тип виробу, камінь
  // з довідника й рівень оздоблення дають кожній моделі власний текст,
  // комплектацію та розміри. Українською; інші локалі лишаються на короткому
  // шаблоні з filters.ts.
  const showStory = locale === "uk"
  // Хаб /memorial прибрано: він дублював навігацію, а вертикаль лишилась одна.
  // Тому батьком картки товару став сам каталог.
  const catalogHref = "/memorial/pamyatnyky"

  const handleShare = async () => {
    if (typeof navigator === "undefined") return
    const data = { title: displayName, text: displayName, url: window.location.href }
    try {
      if (navigator.share) {
        await navigator.share(data)
      } else if (navigator.clipboard) {
        // Desktop has no share sheet — copy the link and confirm visually
        // so the action doesn't feel like it did nothing.
        await navigator.clipboard.writeText(data.url)
        setShared(true)
        setTimeout(() => setShared(false), 2000)
      }
    } catch {}
  }

  // У кошик кладемо копію з вибором клієнта. Рядок каталогу не чіпаємо:
  // у базі лишається камінь із фото, вибір живе тільки в заявці.
  const orderLine = (): StoneItem =>
    choice && choice.material !== defaultEntry.key
      ? { ...stone, selectedMaterial: choice.label, selectedPrice: choice.price }
      : stone

  const addToSelection = () => {
    if (!isSelected) addItem(orderLine())
  }

  const buyNow = () => {
    if (!isSelected) addItem(orderLine())
    openSidebar()
  }

  const specs: [string, string][] = [
    ["№", stoneCode(stone)],
    stone.materialType ? [L.material, materialLabel(stone.materialType, locale, stone.i18n?.materialType)] : null,
    stone.accentMaterial ? [L.accentMaterial, materialLabel(stone.accentMaterial, locale)] : null,
    stone.color ? [L.color, colorLabel(stone.color, locale, stone.i18n?.color)] : null,
    stone.shape ? [L.shape, shapeLabel(stone.shape, locale, stone.i18n?.shape)] : null,
    stone.finish ? [L.finish, finishLabel(stone.finish, locale, stone.i18n?.finish)] : null,
    stone.sizeCm ? [L.size, stone.sizeCm] : null,
    stone.weightKg ? [L.weight, `${stone.weightKg} kg`] : null,
  ].filter(Boolean) as [string, string][]

  // NOTE: Product + BreadcrumbList JSON-LD are emitted server-side in
  // app/memorial/pamyatnyky/[slug]/layout.tsx (reliably crawlable). Don't
  // duplicate them here — duplicate structured data triggers SEO warnings.

  return (
    <>
      <Header />
      <main id="main-content" className="pb-24 pt-6 md:pt-10">
        <div className="mx-auto max-w-7xl px-6">
          <Breadcrumbs
            items={[
              { name: t.nav.catalog, href: catalogHref },
              { name: displayName },
            ]}
          />

          <Link href={catalogHref} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            {L.back}
          </Link>

          {/* «Про цю модель» стоїть у лівій колонці одразу під галереєю: раніше текст
              ішов окремою секцією нижче за обидві колонки, і під фото лишалась
              порожнеча. На телефоні ліва обгортка стає `contents`, а текст отримує
              order-last, тож порядок: фото → ціна й характеристики → текст. */}
          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start lg:gap-14">
            <div className="contents lg:block">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-foreground/5 ring-1 ring-black/[0.04] shadow-soft">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={active}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={gallery[active]}
                      alt={imageAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      className="object-cover"
                      priority
                      fetchPriority="high"
                    />
                  </motion.div>
                </AnimatePresence>

                <button
                  type="button"
                  onClick={handleShare}
                  aria-label={shared ? "Посилання скопійовано" : L.shareTitle}
                  className="absolute right-4 top-4 z-10 flex h-10 items-center justify-center gap-1.5 rounded-full bg-white/85 px-3 backdrop-blur-md text-foreground shadow-soft transition-transform hover:-translate-y-0.5"
                >
                  {shared ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" strokeWidth={2} />
                      <span className="text-xs font-medium">Скопійовано</span>
                    </>
                  ) : (
                    <Share2 className="h-4 w-4" strokeWidth={1.75} />
                  )}
                </button>
              </div>

              {gallery.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {gallery.map((g, i) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setActive(i)}
                      className={cn(
                        "relative aspect-[4/3] overflow-hidden rounded-xl ring-1 transition-all",
                        i === active ? "ring-foreground" : "ring-foreground/10 hover:ring-foreground/30"
                      )}
                      aria-label={`Image ${i + 1}`}
                    >
                      <Image src={g} alt={`${imageAlt}, фото ${i + 1}`} fill sizes="200px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {showStory && story && <div className="order-last mt-4 lg:order-none lg:mt-12">{story}</div>}
            </div>

            <div className="lg:pt-6">
              {stone.isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
                  {L.featured}
                </span>
              )}
              <div className="mt-3 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                {t.nav.memorial}
              </div>
              {/* Sized for a full name — "Пам'ятник «Опівнічний Спокій» — маслав,
                    зелений" at text-6xl ran to three lines and dwarfed the page. */}
              <h1 className="mt-2 text-2xl font-semibold tracking-tight-custom sm:text-3xl md:text-4xl text-balance">
                {heading}
              </h1>
              <p className="mt-4 text-lg md:text-xl leading-relaxed text-foreground/85 text-balance">
                {showStory
                  ? storyLead
                  : L.descriptionBody(
                      stoneCode(stone),
                      // Same resolver the spec table uses, so the two cannot disagree.
                      stone.materialType ? materialLabel(stone.materialType, locale, stone.i18n?.materialType) : "",
                      stone.category,
                      stone.accentMaterial ? materialLabel(stone.accentMaterial, locale) : undefined
                    )}
              </p>

              <div className="mt-8 flex items-baseline gap-3">
                {shownPrice ? (
                  <>
                    <span className="text-sm text-muted-foreground">{t.catalog.fromPrice}</span>
                    <span className="text-3xl font-semibold tracking-tight-custom tabular-nums md:text-4xl">
                      {formatPrice(shownPrice)}
                    </span>
                  </>
                ) : (
                  <a href={toTelHref(PHONE_DISPLAY)} className="inline-flex flex-col">
                    <span className="text-sm text-muted-foreground">{t.catalog.requestQuote}</span>
                    <span className="text-2xl font-semibold tracking-tight-custom md:text-3xl">
                      {PHONE_DISPLAY}
                    </span>
                  </a>
                )}
              </div>

              <MaterialPicker
                stone={stone}
                defaultEntry={defaultEntry}
                onChange={setChoice}
              />

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={buyNow}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:-translate-y-[1px] active:scale-[0.98]"
                >
                  {L.buyNow}
                </button>
                <button
                  type="button"
                  onClick={addToSelection}
                  disabled={isSelected}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition-all hover:-translate-y-[1px] active:scale-[0.98]",
                    isSelected
                      ? "border-success bg-success/10 text-success"
                      : "border-foreground/15 bg-background text-foreground hover:bg-foreground/5"
                  )}
                >
                  {isSelected ? <Check className="h-4 w-4" strokeWidth={2} /> : <Plus className="h-4 w-4" strokeWidth={2} />}
                  {L.addToSelection}
                </button>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <Trust icon={<Award className="h-4 w-4" strokeWidth={1.75} />} text={WARRANTY_LABEL[locale]} />
                <Trust icon={<Truck className="h-4 w-4" strokeWidth={1.75} />} text={t.footer.delivery} />
              </div>

              <div className="mt-10 rounded-2xl border border-foreground/10 bg-card/50 p-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {L.specifications}
                </div>
                <dl className="mt-4 divide-y divide-foreground/5">
                  {specs.map(([k, v]) => (
                    <div
                      key={k}
                      // Довге значення (Розмір: стела, тумба, квітник, ділянка) на телефоні
                      // не вміщалось поруч із підписом і налазило на нього. Такі значення
                      // йдуть окремим рядком під підписом, короткі — як і раніше, праворуч.
                      className={cn(
                        "py-2.5 text-[15px]",
                        String(v).length > 28 ? "flex flex-col gap-1" : "flex items-center justify-between gap-4"
                      )}
                    >
                      <dt className="shrink-0 text-muted-foreground">{k}</dt>
                      <dd className={cn("font-medium text-foreground tabular-nums", String(v).length > 28 ? "leading-snug" : "text-right")}>{v}</dd>
                    </div>
                  ))}
                  {showStory && (
                    <>
                      <div className="flex items-center justify-between gap-4 py-2.5 text-[15px]">
                        <dt className="text-muted-foreground">Виготовлення</dt>
                        <dd className="text-right font-medium text-foreground tabular-nums">{leadTime}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4 py-2.5 text-[15px]">
                        <dt className="text-muted-foreground">Гарантія</dt>
                        <dd className="text-right font-medium text-foreground tabular-nums">{WARRANTY_YEARS} років</dd>
                      </div>
                    </>
                  )}
                </dl>
              </div>

              {showStory && storyAside && <div className="mt-6">{storyAside}</div>}
            </div>
          </div>

          {related.length > 0 && (
            <section className="mt-24 md:mt-32">
              <h2 className="text-2xl font-semibold tracking-tight-custom md:text-3xl">
                {L.relatedTitle}
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <StoneCard key={r.id} item={r} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
      <SelectionSidebar />
    </>
  )
}

function Trust({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-xl bg-foreground/[0.03] px-3 py-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background">
        {icon}
      </span>
      <span className="text-xs font-medium leading-tight text-foreground/85">{text}</span>
    </div>
  )
}
