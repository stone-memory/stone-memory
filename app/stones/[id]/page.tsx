"use client"

import { useMemo, useState } from "react"
import { useParams, notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Check, Plus, Truck, Award, Share2 } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SelectionSidebar } from "@/components/selection-sidebar"
import { StoneCard } from "@/components/stone-card"
import { useSelectionStore } from "@/lib/store/selection"
import { useTranslation } from "@/lib/i18n/context"
import { useStones, useStonesAdminStore } from "@/lib/store/stones"
import { filterLabels, colorLabel, shapeLabel, finishLabel, materialLabel } from "@/lib/i18n/filters"
import { cn } from "@/lib/utils"

export default function StoneDetailPage() {
  const params = useParams<{ id: string }>()
  const stones = useStones()
  const hasHydrated = useStonesAdminStore((s) => s.hasHydrated)
  const stone = stones.find((s) => s.id === params.id)
  if (hasHydrated && !stone) notFound()
  if (!stone) return null

  const { t, locale, formatPrice } = useTranslation()
  const L = filterLabels[locale]
  const { addItem, items, openSidebar } = useSelectionStore()
  const isSelected = items.some((i) => i.id === stone.id)

  const gallery = useMemo(
    () => (stone.gallery && stone.gallery.length > 0 ? stone.gallery : [stone.imagePath]),
    [stone]
  )
  const [active, setActive] = useState(0)

  // "Схоже" — multi-criteria scoring замість простого фільтра.
  // Кожен співпадаючий атрибут додає бали; найвищі — у блок related.
  // Це гарантує що клієнт бачить дійсно близькі позиції,
  // а не випадкові з тієї ж категорії і кольору.
  const related = useMemo(() => {
    const PRICE_TOLERANCE = 0.35 // ±35% від ціни поточного каменю — "близько"
    const minPrice = stone.priceFrom ? stone.priceFrom * (1 - PRICE_TOLERANCE) : undefined
    const maxPrice = stone.priceFrom ? stone.priceFrom * (1 + PRICE_TOLERANCE) : undefined

    const scored = stones
      .filter((s) => s.id !== stone.id && s.category === stone.category)
      .map((s) => {
        let score = 0
        if (s.color && s.color === stone.color) score += 4
        if (s.materialType && s.materialType === stone.materialType) score += 4
        if (s.shape && s.shape === stone.shape) score += 3
        if (s.finish && s.finish === stone.finish) score += 2
        if (s.priceFrom && minPrice && maxPrice && s.priceFrom >= minPrice && s.priceFrom <= maxPrice) score += 2
        if (s.origin && stone.origin && s.origin.split(",")[0] === stone.origin.split(",")[0]) score += 1
        if (s.isFeatured) score += 1
        return { s, score }
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6) // більше "схоже" — щоб був повноцінний скрол вниз
      .map(({ s }) => s)

    // Fallback: якщо нічого не співпало (рідкісний камінь), показуємо
    // просто з тієї ж категорії, відсортовані за ціною біля поточного.
    if (scored.length === 0) {
      return stones
        .filter((s) => s.id !== stone.id && s.category === stone.category)
        .sort((a, b) => Math.abs((a.priceFrom ?? 0) - (stone.priceFrom ?? 0)) - Math.abs((b.priceFrom ?? 0) - (stone.priceFrom ?? 0)))
        .slice(0, 6)
    }
    return scored
  }, [stones, stone])

  const handleShare = async () => {
    if (typeof navigator === "undefined") return
    const title = stone.name || `№ ${stone.id}`
    const data = { title, text: title, url: window.location.href }
    try {
      if (navigator.share) await navigator.share(data)
      else if (navigator.clipboard) await navigator.clipboard.writeText(data.url)
    } catch {}
  }

  const addToSelection = () => {
    if (!isSelected) addItem(stone)
  }

  const buyNow = () => {
    if (!isSelected) addItem(stone)
    openSidebar()
  }

  const specs: [string, string][] = [
    ["№", stone.id],
    stone.materialType ? [L.material, materialLabel(stone.materialType, locale, stone.i18n?.materialType)] : null,
    stone.color ? [L.color, colorLabel(stone.color, locale, stone.i18n?.color)] : null,
    stone.shape ? [L.shape, shapeLabel(stone.shape, locale, stone.i18n?.shape)] : null,
    stone.finish ? [L.finish, finishLabel(stone.finish, locale, stone.i18n?.finish)] : null,
    stone.sizeCm ? ["Size", stone.sizeCm] : null,
    stone.weightKg ? ["Weight", `${stone.weightKg} kg`] : null,
  ].filter(Boolean) as [string, string][]

  // NOTE: Product + BreadcrumbList JSON-LD are emitted server-side in
  // ./layout.tsx (reliably crawlable). Don't duplicate them here in this
  // client component — duplicate structured data triggers SEO warnings.

  return (
    <>
      <Header />
      <main id="main-content" className="pb-24 pt-6 md:pt-10">
        <div className="mx-auto max-w-7xl px-6">
          <Link href="/catalog" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            {L.back}
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
            <div>
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-foreground/5 ring-1 ring-black/[0.04] shadow-soft">
                <AnimatePresence mode="wait">
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
                      alt={stone.name || `№ ${stone.id}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      className="object-cover"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>

                <button
                  type="button"
                  onClick={handleShare}
                  aria-label={L.shareTitle}
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/85 backdrop-blur-md text-foreground shadow-soft transition-transform hover:-translate-y-0.5"
                >
                  <Share2 className="h-4 w-4" strokeWidth={1.75} />
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
                      <Image src={g} alt={`${stone.name || `№ ${stone.id}`}, фото ${i + 1}`} fill sizes="200px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:pt-6">
              {stone.isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
                  {L.featured}
                </span>
              )}
              <div className="mt-3 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                {stone.category === "memorial" ? t.nav.memorial : t.nav.home}
              </div>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight-custom md:text-6xl text-balance tabular-nums">
                {stone.name || `№ ${stone.id}`}
              </h1>
              <p className="mt-4 text-lg md:text-xl leading-relaxed text-foreground/85 text-balance">
                {L.descriptionBody(stone.id, stone.category)}
              </p>

              <div className="mt-8 flex items-baseline gap-3">
                {stone.priceFrom ? (
                  <>
                    <span className="text-sm text-muted-foreground">{t.catalog.fromPrice}</span>
                    <span className="text-3xl font-semibold tracking-tight-custom tabular-nums md:text-4xl">
                      {formatPrice(stone.priceFrom)}
                    </span>
                  </>
                ) : (
                  <a
                    href="tel:+380678080222"
                    className="inline-flex flex-col"
                  >
                    <span className="text-sm text-muted-foreground">{t.catalog.requestQuote}</span>
                    <span className="text-2xl font-semibold tracking-tight-custom md:text-3xl">
                      +38 (067) 808-02-22
                    </span>
                  </a>
                )}
              </div>

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
                <Trust icon={<Award className="h-4 w-4" strokeWidth={1.75} />} text={t.hero.badge.replace(/\d+\s*/, (m) => m.trim() + " ")} />
                <Trust icon={<Truck className="h-4 w-4" strokeWidth={1.75} />} text={t.footer.delivery} />
              </div>

              <div className="mt-10 rounded-2xl border border-foreground/10 bg-card/50 p-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {L.specifications}
                </div>
                <dl className="mt-4 divide-y divide-foreground/5">
                  {specs.map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between py-2.5 text-[15px]">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="font-medium text-foreground tabular-nums">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
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
