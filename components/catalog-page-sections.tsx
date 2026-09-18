"use client"

import Link from "next/link"
import { ConsultButton } from "@/components/consult-button"
import { CITIES, LEAD_TIMES, WARRANTY_YEARS } from "@/lib/site-facts"
import { useTranslation } from "@/lib/i18n/context"
import { CATALOG_COPY } from "@/lib/i18n/copy/catalog"
import { cityName, facetH1, localizeDuration, yearsLabel } from "@/lib/i18n/copy/common"

export type FacetSummary = { slug: string; h1: string; intro: string }

type Props = {
  /** Порожньо — кореневий каталог. Лише серіалізовані поля: `match` лишається на сервері. */
  facet?: FacetSummary
  page: number
  monumentsCount: number
  /** Мінімальна ціна одинарного пам'ятника в гривнях, null — без цін. */
  minPrice: number | null
  siblings: { slug: string; h1: string; count: number }[]
}

/**
 * Секції під сіткою каталогу: SEO-текст, факти, підбірки, доставка, CTA.
 *
 * Клієнтський компонент заради мови. Довгий текст підбірки та фасетів
 * існує лише українською, тому для інших мов показуємо короткий переклад
 * кореневого тексту — так само, як картка товару ховає «історію» не для uk.
 */
export function CatalogPageSections({ facet, page, monumentsCount, minPrice, siblings }: Props) {
  const { locale, formatPrice } = useTranslation()
  const c = CATALOG_COPY[locale]
  const body = locale === "uk" && facet ? facet.intro : c.rootText

  return (
    <>
      {page === 1 && (
        <section className="mx-auto max-w-7xl px-6 pb-14">
          <div className="max-w-3xl space-y-4 text-base leading-relaxed text-foreground/80">
            {body.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Fact value={`${monumentsCount}`} label={c.facts.models} />
            <Fact value={minPrice ? `${c.facts.from} ${formatPrice(minPrice)}` : "—"} label={c.facts.singleFrom} />
            <Fact value={localizeDuration(LEAD_TIMES.single, locale)} label={c.facts.singleLead} />
            <Fact value={yearsLabel(WARRANTY_YEARS, locale)} label={c.facts.warranty} />
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <h2 className="text-xl font-semibold tracking-tight-custom md:text-2xl">
          {facet ? c.collections.other : c.collections.all}
        </h2>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {facet && <Pill href="/memorial/pamyatnyky" label={c.collections.allMonuments} count={monumentsCount} />}
          {siblings.map((f) => (
            <Pill key={f.slug} href={`/memorial/pamyatnyky/${f.slug}`} label={facetH1(f.slug, f.h1, locale)} count={f.count} />
          ))}
        </div>
      </section>

      {page === 1 && (
        <section className="mx-auto max-w-7xl px-6 pb-14">
          <h2 className="text-xl font-semibold tracking-tight-custom md:text-2xl">{c.delivery.heading}</h2>
          <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">{c.delivery.text}</p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {CITIES.map((city) => (
              <Pill key={city.slug} href={`/pamyatnyky/${city.slug}`} label={c.delivery.cityPill(cityName(city.slug, city.name, locale))} />
            ))}
            <Pill href="/dostavka-i-oplata" label={c.delivery.terms} />
            <Pill href="/tsiny" label={c.delivery.prices} />
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="flex flex-col items-start gap-4 rounded-3xl bg-secondary/60 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h2 className="text-xl font-semibold tracking-tight-custom md:text-2xl">{c.notFound.heading}</h2>
            <p className="mt-1.5 max-w-xl text-[15px] text-muted-foreground">{c.notFound.text}</p>
          </div>
          <ConsultButton topic="Не знайшли свою модель?">{c.notFound.button}</ConsultButton>
        </div>
      </section>
    </>
  )
}

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-secondary/60 p-5">
      <div className="text-2xl font-semibold tracking-tight-custom tabular-nums md:text-3xl">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

function Pill({ href, label, count }: { href: string; label: string; count?: number }) {
  return (
    <Link href={href} className="rounded-full border border-foreground/15 px-4 py-2 text-sm transition-colors hover:border-foreground/40">
      {label}
      {typeof count === "number" && <span className="ml-1.5 text-muted-foreground tabular-nums">{count}</span>}
    </Link>
  )
}
