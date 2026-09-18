"use client"

import Link from "next/link"
import { InfoPage, Section, Prose, Table, Faq, CtaBand } from "@/components/info-page"
import { CITIES } from "@/lib/site-facts"
import { useTranslation } from "@/lib/i18n/context"
import { FACTS } from "@/lib/i18n/copy/facts"
import { DELIVERY_COPY } from "@/lib/i18n/copy/pages/delivery"

/** Розкладка /dostavka-i-oplata за мовою відвідувача. */
export function DeliveryContent() {
  const { locale } = useTranslation()
  const f = FACTS[locale]
  const c = DELIVERY_COPY[locale](f)
  return (
    <InfoPage crumbs={[{ name: c.crumb }]} title={c.title} lead={c.lead}>
      <Section eyebrow={c.zonesEyebrow} title={c.zonesTitle}>
        <Table head={c.tableHead} rows={c.tableRows} caption={c.tableCaption} />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CITIES.map((city) => {
            const fc = f.cities[city.slug]
            return (
              <Link
                key={city.slug}
                href={`/pamyatnyky/${city.slug}`}
                className="rounded-2xl bg-card p-5 ring-1 ring-black/[0.06] shadow-soft transition-colors hover:ring-foreground/30"
              >
                <div className="font-semibold">{fc?.name ?? city.name}</div>
                <div className="mt-1 text-sm text-muted-foreground">{c.cityMeta(city.distanceKm, fc?.travel ?? city.travel, city.freeTravel)}</div>
              </Link>
            )
          })}
        </div>
      </Section>

      <Section eyebrow={c.packEyebrow} title={c.packTitle}>
        <Prose text={c.packText} />
      </Section>

      <Section eyebrow={c.installEyebrow} title={c.installTitle}>
        <Prose text={c.installText} />
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
        <Prose className="mt-6" text={c.payText} />
      </Section>

      <Section eyebrow={c.faqEyebrow} title={c.faqTitle}>
        <Faq items={c.faq} />
      </Section>

      <CtaBand />
    </InfoPage>
  )
}
