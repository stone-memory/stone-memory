"use client"

import Link from "next/link"
import { InfoPage, Section, Table, Faq, CtaBand, LinkPills } from "@/components/info-page"
import { catalogPagePath } from "@/lib/catalog-taxonomy"
import type { ProductType } from "@/lib/product-copy"
import { useTranslation } from "@/lib/i18n/context"
import { FACTS } from "@/lib/i18n/copy/facts"
import { PRICES_COPY } from "@/lib/i18n/copy/pages/prices"
import { facetH1 } from "@/lib/i18n/copy/common"

export type PriceRow = { type: ProductType; facet: string; lead: "single" | "double" | "complex" | "cross" | "child" | "military"; n: number; min: number; median: number; max: number }
export type FacetLink = { slug: string; h1: string; count: number }

type Props = {
  rows: PriceRow[]
  overallMin: number | null
  facets: FacetLink[]
}

/**
 * Розкладка /tsiny за мовою відвідувача. Статистику цін рахує сервер і
 * передає числами в гривнях; тут вони переводяться у валюту локалі через
 * formatPrice — тому в EUR чи PLN таблиця показує вже перераховані суми.
 */
export function PricesContent({ rows, overallMin, facets }: Props) {
  const { locale, formatPrice } = useTranslation()
  const f = FACTS[locale]
  const c = PRICES_COPY[locale](f)

  return (
    <InfoPage crumbs={[{ name: c.crumb }]} title={c.title} lead={c.lead(overallMin ? formatPrice(overallMin) : null)}>
      <Section eyebrow={c.typesEyebrow} title={c.typesTitle}>
        <Table
          head={c.tableHead}
          rows={rows.map((r) => [
            <Link key={r.type} href={catalogPagePath(r.facet, 1)} className="underline decoration-foreground/20 underline-offset-4 hover:decoration-foreground">
              {c.types[r.type].label} <span className="text-muted-foreground">({r.n})</span>
            </Link>,
            <span key={`${r.type}-min`} className="whitespace-nowrap">{formatPrice(r.min)}</span>,
            <span key={`${r.type}-med`} className="whitespace-nowrap">{formatPrice(r.median)}</span>,
            <span key={`${r.type}-max`} className="whitespace-nowrap">{formatPrice(r.max)}</span>,
            <span key={`${r.type}-lead`} className="whitespace-nowrap">{f.lead[r.lead]}</span>,
            <span key={`${r.type}-inc`} className="text-sm text-muted-foreground">{c.types[r.type].includes}</span>,
          ])}
          caption={c.tableCaption}
        />
        <div className="mt-6">
          <LinkPills items={facets.map((x) => ({ href: catalogPagePath(x.slug, 1), label: facetH1(x.slug, x.h1, locale), count: x.count }))} />
        </div>
      </Section>

      <Section eyebrow={c.servicesEyebrow} title={c.servicesTitle}>
        <Table
          head={c.servicesHead}
          // Ціна одним рядком: на телефоні колонка вужчала, і «від 2 000 ₴»
          // ламалось усередині суми («від 2 / 000 ₴»).
          rows={f.servicePrices.map((s) => [
            s.name,
            <span key={`${s.name}-price`} className="whitespace-nowrap">{s.price(formatPrice)}</span>,
            <span key={s.name} className="text-sm text-muted-foreground">{s.note}</span>,
          ])}
          caption={c.servicesCaption}
        />
      </Section>

      <Section eyebrow={c.payEyebrow} title={c.payTitle}>
        <ol className="grid gap-4 md:grid-cols-3">
          {f.payment.steps.map((s) => (
            <li key={s.share} className="rounded-2xl bg-card p-6 ring-1 ring-black/[0.06] shadow-soft">
              <div className="text-3xl font-semibold tracking-tight-custom tabular-nums">{s.share}</div>
              <div className="mt-2 font-medium">{s.when}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.what}</div>
            </li>
          ))}
        </ol>
        <p className="mt-4 max-w-3xl text-[15px] text-muted-foreground">
          {c.payNote}{" "}
          <Link href="/dostavka-i-oplata" className="underline underline-offset-4 hover:text-foreground">{c.payLink}</Link>.
        </p>
      </Section>

      <Section eyebrow={c.faqEyebrow} title={c.faqTitle}>
        <Faq items={c.faq} />
      </Section>

      <CtaBand title={c.cta.title} text={c.cta.text} cta={c.cta.button} />
    </InfoPage>
  )
}
