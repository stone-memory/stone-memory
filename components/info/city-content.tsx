"use client"

import Link from "next/link"
import { InfoPage, Section, Prose, Facts, Faq, CtaBand, LinkPills } from "@/components/info-page"
import { StoneCard } from "@/components/stone-card"
import { CITIES, cityBySlug } from "@/lib/site-facts"
import { useTranslation } from "@/lib/i18n/context"
import { FACTS } from "@/lib/i18n/copy/facts"
import { CITY_COPY } from "@/lib/i18n/copy/pages/city"
import { facetH1, modelsCount } from "@/lib/i18n/copy/common"
import type { StoneItem } from "@/lib/types"

type Props = {
  slug: string
  picks: StoneItem[]
  singleMin: number | null
  complexMin: number | null
  militaryCount: number
  militaryMin: number | null
  facets: { slug: string; h1: string; count: number }[]
  phone: string
  telHref: string
}

const pill = "rounded-full border border-foreground/15 px-4 py-2 text-sm transition-colors hover:border-foreground/40"

/**
 * Розкладка /pamyatnyky/[city] за мовою відвідувача. Числа (відстань, ціни,
 * кількість моделей) приходять із сервера, тексти й назви міст — зі словника.
 */
export function CityContent({ slug, picks, singleMin, complexMin, militaryCount, militaryMin, facets, phone, telHref }: Props) {
  const { locale, formatPrice } = useTranslation()
  const base = cityBySlug(slug)
  if (!base) return null
  const f = FACTS[locale]
  const fc = f.cities[slug] ?? FACTS.uk.cities[slug]
  const c = CITY_COPY[locale](f, { ...fc, slug, distanceKm: base.distanceKm, freeTravel: base.freeTravel })
  const others = CITIES.filter((x) => x.slug !== slug)

  return (
    <InfoPage crumbs={[{ name: c.crumb }]} title={c.title} lead={c.lead}>
      <Section>
        <Facts
          items={[
            { value: singleMin ? `${c.facts.from} ${formatPrice(singleMin)}` : "—", label: c.facts.singleLabel },
            { value: complexMin ? `${c.facts.from} ${formatPrice(complexMin)}` : "—", label: c.facts.complexLabel },
            { value: c.facts.distanceValue, label: c.facts.distanceLabel },
            { value: c.facts.travelValue, label: c.facts.travelLabel },
          ]}
        />
      </Section>

      <Section eyebrow={fc.region} title={c.howTitle}>
        <Prose text={c.howText} />
        <div className="mt-6 flex flex-wrap gap-2.5">
          <Link href="/yak-zamovyty" className={pill}>{c.links.howTo}</Link>
          <Link href="/dostavka-i-oplata" className={pill}>{c.links.delivery}</Link>
          <Link href="/tsiny" className={pill}>{c.links.prices}</Link>
        </div>
      </Section>

      {picks.length > 0 && (
        <Section eyebrow={c.catalogEyebrow} title={c.catalogTitle}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {picks.map((s, i) => (
              <StoneCard key={s.id} item={s} priority={i < 3} />
            ))}
          </div>
          <div className="mt-6">
            <LinkPills items={facets.map((x) => ({ href: `/memorial/pamyatnyky/${x.slug}`, label: facetH1(x.slug, x.h1, locale), count: x.count }))} />
          </div>
        </Section>
      )}

      {militaryCount > 0 && (
        <Section eyebrow={c.militaryEyebrow} title={c.militaryTitle}>
          <Prose text={c.militaryText(modelsCount(militaryCount, locale), militaryMin ? formatPrice(militaryMin) : null)} />
          <div className="mt-4">
            <Link href="/memorial/pamyatnyky/viyskovi" className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background">
              {c.militaryLink}
            </Link>
          </div>
        </Section>
      )}

      <Section eyebrow={c.faqEyebrow} title={c.faqTitle}>
        <Faq items={c.faq} />
      </Section>

      <Section eyebrow={c.othersEyebrow} title={c.othersTitle}>
        <LinkPills items={others.map((x) => ({ href: `/pamyatnyky/${x.slug}`, label: f.cities[x.slug]?.name ?? x.name }))} />
        <p className="mt-4 text-sm text-muted-foreground">
          {c.noCityBefore}
          <a href={telHref} className="underline underline-offset-4 hover:text-foreground">{phone}</a>
          {c.noCityAfter}
        </p>
      </Section>

      <CtaBand title={c.cta} />
    </InfoPage>
  )
}
