"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Award, Hammer, MapPin, Ruler } from "lucide-react"
import { ConsultButton } from "@/components/consult-button"
import { MEMORIAL_FACETS, facetItems, stonePath } from "@/lib/catalog-taxonomy"
import { CITIES, LEAD_TIMES, WARRANTY_YEARS } from "@/lib/site-facts"
import { productType } from "@/lib/product-copy"
import { useTranslation } from "@/lib/i18n/context"
import { HUB_COPY } from "@/lib/i18n/copy/hub"
import { cityName, facetH1, localizeDuration, modelsCount, yearsLabel } from "@/lib/i18n/copy/common"
import type { StoneItem } from "@/lib/types"

/**
 * Блоки хабу пам'ятників: цифри, підбірки, процес, міста, роботи.
 *
 * Читають живий каталог і кладуть у HTML те, за що сайт має ранжуватись:
 * типи виробів із цінами «від», процес, географію та гарантію. Це клієнтські
 * компоненти лише заради мови — SSR і далі віддає український текст, а після
 * гідратації словник підставляє обрану локаль і ціну у валюті відвідувача.
 */

function minPriceOf(stones: StoneItem[]): number | null {
  const prices = stones.map((s) => s.priceFrom).filter((p): p is number => typeof p === "number" && p > 0)
  return prices.length ? Math.min(...prices) : null
}

export function HomeNumbers({ stones }: { stones: StoneItem[] }) {
  const { locale, formatPrice } = useTranslation()
  const c = HUB_COPY[locale].numbers
  const monuments = stones.filter((s) => s.category === "memorial")
  const single = monuments.filter((s) => productType(s) === "single")
  const singleMin = minPriceOf(single)
  const facts = [
    { value: `${monuments.length}`, label: c.models, icon: Ruler },
    { value: singleMin ? `${c.from} ${formatPrice(singleMin)}` : "—", label: c.singleWithInstall, icon: Hammer },
    { value: yearsLabel(WARRANTY_YEARS, locale), label: c.warranty, icon: Award },
    { value: localizeDuration(LEAD_TIMES.single, locale), label: c.fromSketch, icon: MapPin },
  ]
  return (
    <section className="mx-auto max-w-7xl px-6 pt-14 md:pt-20">
      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label} className="rounded-2xl bg-card p-5 ring-1 ring-black/[0.06] shadow-soft md:p-6">
            <f.icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
            <dd className="mt-4 text-2xl font-semibold tracking-tight-custom tabular-nums md:text-3xl">{f.value}</dd>
            <dt className="mt-1 text-sm text-muted-foreground">{f.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  )
}

/** Сім типів виробів із ціною «від» і фото з каталогу — те, що людина шукає першим. */
export function HomeCollections({ stones }: { stones: StoneItem[] }) {
  const { locale, formatPrice } = useTranslation()
  const c = HUB_COPY[locale].collections
  const cards = MEMORIAL_FACETS.filter((f) =>
    ["odynochni", "podviyni", "kompleksy", "viyskovi", "khresty", "yevropeiski", "dytyachi", "chorni"].includes(f.slug)
  )
    .map((f) => {
      const items = facetItems(stones, f)
      const cover = items.find((s) => s.isFeatured) ?? items[0]
      return { facet: f, count: items.length, min: minPriceOf(items), cover }
    })
    .filter((card) => card.count > 0 && card.cover)

  if (cards.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-6 pt-14 md:pt-20">
      <div className="mb-8 flex flex-col items-start gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">{c.eyebrow}</span>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight-custom md:text-6xl text-balance">{c.heading}</h2>
        </div>
        <Link
          href="/memorial/pamyatnyky"
          className="group inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:-translate-y-[1px]"
        >
          {c.all}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        {cards.map(({ facet, count, min, cover }) => {
          const title = facetH1(facet.slug, facet.h1, locale)
          return (
            <Link
              key={facet.slug}
              href={`/memorial/pamyatnyky/${facet.slug}`}
              className="group overflow-hidden rounded-2xl bg-card ring-1 ring-black/[0.04] shadow-soft transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-hover"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-foreground/5">
                <Image
                  src={cover!.imagePath}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]"
                />
              </div>
              <div className="p-4 md:p-5">
                <h3 className="text-base font-semibold tracking-tight-custom md:text-lg">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground tabular-nums">
                  {modelsCount(count, locale)}
                  {min ? ` · ${c.from} ${formatPrice(min)}` : ""}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export function HomeProcess() {
  const { locale } = useTranslation()
  const c = HUB_COPY[locale].process
  const steps = c.steps(
    localizeDuration(LEAD_TIMES.single, locale),
    localizeDuration(LEAD_TIMES.complex, locale),
    yearsLabel(WARRANTY_YEARS, locale)
  )
  return (
    <section className="mx-auto max-w-7xl px-6 pt-16 md:pt-24">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">{c.eyebrow}</span>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight-custom md:text-5xl text-balance">{c.heading}</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">{c.lead}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ConsultButton topic="Головна: як це відбувається">{c.consult}</ConsultButton>
            <Link
              href="/yak-zamovyty"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-6 py-3 text-sm font-medium transition-colors hover:bg-foreground/5"
            >
              {c.details}
            </Link>
          </div>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2">
          {steps.map((s, i) => (
            <li key={i} className="rounded-2xl bg-card p-6 ring-1 ring-black/[0.06] shadow-soft">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-sm font-semibold tabular-nums text-background">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight-custom">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function HomeRegions() {
  const { locale } = useTranslation()
  const c = HUB_COPY[locale].regions
  return (
    <section className="mx-auto max-w-7xl px-6 pt-16 md:pt-24">
      <div className="rounded-3xl bg-secondary/60 p-6 md:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">{c.eyebrow}</span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight-custom md:text-5xl text-balance">{c.heading}</h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">{c.lead}</p>
          </div>
          <ul className="grid grid-cols-2 gap-3">
            {CITIES.map((city) => (
              <li key={city.slug}>
                <Link
                  href={`/pamyatnyky/${city.slug}`}
                  className="group flex items-center justify-between rounded-2xl bg-card px-4 py-3 ring-1 ring-black/[0.06] transition-colors hover:ring-foreground/30"
                >
                  <span>
                    <span className="block text-[15px] font-medium">{cityName(city.slug, city.name, locale)}</span>
                    <span className="block text-xs text-muted-foreground">
                      {city.distanceKm
                        ? `${city.distanceKm} ${c.km} · ${city.freeTravel ? c.freeTravel : c.byMileage}`
                        : c.ourWorkshop}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/** Три найдорожчі роботи як «портфоліо» — фото змонтованих ділянок. */
export function HomeShowcase({ stones }: { stones: StoneItem[] }) {
  const { locale, formatPrice } = useTranslation()
  const c = HUB_COPY[locale].showcase
  const picks = stones
    .filter((s) => s.category === "memorial" && productType(s) === "complex" && s.priceFrom)
    .sort((a, b) => (b.priceFrom ?? 0) - (a.priceFrom ?? 0))
    .slice(0, 3)
  if (picks.length < 3) return null
  return (
    <section className="mx-auto max-w-7xl px-6 pt-16 md:pt-24">
      <div className="mb-8 md:mb-10">
        <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">{c.eyebrow}</span>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight-custom md:text-6xl text-balance">{c.heading}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3 md:gap-6">
        {picks.map((s) => (
          <Link key={s.id} href={stonePath(s)} className="group block">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-foreground/5 shadow-soft transition-[box-shadow,transform] duration-500 group-hover:-translate-y-0.5 group-hover:shadow-hover">
              <Image
                src={s.imagePath}
                alt={s.name ?? c.alt}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-[700ms] group-hover:scale-[1.04]"
              />
            </div>
            <h3 className="mt-4 text-lg font-semibold tracking-tight-custom">{s.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground tabular-nums">
              {c.from} {formatPrice(s.priceFrom!)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
