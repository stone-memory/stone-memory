"use client"

import Link from "next/link"
import { InfoPage, Section, Prose, Steps, Faq, CtaBand, Facts } from "@/components/info-page"
import { useTranslation } from "@/lib/i18n/context"
import { FACTS } from "@/lib/i18n/copy/facts"
import { HOW_TO_ORDER_COPY } from "@/lib/i18n/copy/pages/how-to-order"

const pill = "rounded-full border border-foreground/15 px-4 py-2 text-sm transition-colors hover:border-foreground/40"

/** Розкладка /yak-zamovyty за мовою відвідувача. Метадані та JSON-LD лишаються на сервері українською. */
export function HowToOrderContent() {
  const { locale } = useTranslation()
  const c = HOW_TO_ORDER_COPY[locale](FACTS[locale])
  return (
    <InfoPage crumbs={[{ name: c.crumb }]} title={c.title} lead={c.lead}>
      <Section>
        <Facts items={c.facts} />
      </Section>

      <Section eyebrow={c.stepsEyebrow} title={c.stepsTitle}>
        <Steps items={c.steps} />
      </Section>

      <Section eyebrow={c.prepEyebrow} title={c.prepTitle}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Prose text={c.prepLeft} />
          <Prose text={c.prepRight} />
        </div>
        <div className="mt-6 flex flex-wrap gap-2.5">
          <Link href="/memorial/kameni" className={pill}>{c.links.guide}</Link>
          <Link href="/blog/epitaph-writing" className={pill}>{c.links.epitaph}</Link>
          <Link href="/tsiny" className={pill}>{c.links.prices}</Link>
        </div>
      </Section>

      <Section eyebrow={c.installEyebrow} title={c.installTitle}>
        <Prose text={c.installText} />
      </Section>

      <Section eyebrow={c.faqEyebrow} title={c.faqTitle}>
        <Faq items={c.faq} />
      </Section>

      <CtaBand />
    </InfoPage>
  )
}
