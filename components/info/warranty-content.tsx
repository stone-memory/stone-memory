"use client"

import { InfoPage, Section, Prose, Table, CtaBand, Facts } from "@/components/info-page"
import { useTranslation } from "@/lib/i18n/context"
import { FACTS } from "@/lib/i18n/copy/facts"
import { WARRANTY_COPY } from "@/lib/i18n/copy/pages/warranty"

/** Розкладка /harantiya за мовою відвідувача. */
export function WarrantyContent() {
  const { locale } = useTranslation()
  const c = WARRANTY_COPY[locale](FACTS[locale])
  return (
    <InfoPage crumbs={[{ name: c.crumb }]} title={c.title} lead={c.lead}>
      <Section>
        <Facts items={c.facts} />
      </Section>

      <Section eyebrow={c.coversEyebrow} title={c.coversTitle}>
        <Table head={c.tableHead} rows={c.tableRows} />
      </Section>

      <Section eyebrow={c.whyEyebrow} title={c.whyTitle}>
        <Prose text={c.whyText} />
      </Section>

      <Section eyebrow={c.notEyebrow} title={c.notTitle}>
        <Prose text={c.notText} />
      </Section>

      <Section eyebrow={c.howEyebrow} title={c.howTitle}>
        <ol className="grid gap-4 md:grid-cols-3">
          {c.how.map((s, i) => (
            <li key={i} className="rounded-2xl bg-card p-6 ring-1 ring-black/[0.06] shadow-soft">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-sm font-semibold tabular-nums text-background">{i + 1}</span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight-custom">{s.t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </Section>

      <CtaBand title={c.cta.title} text={c.cta.text} cta={c.cta.button} />
    </InfoPage>
  )
}
