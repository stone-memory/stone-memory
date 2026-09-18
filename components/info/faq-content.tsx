"use client"

import Link from "next/link"
import { InfoPage, Section, Faq, CtaBand, LinkPills } from "@/components/info-page"
import { useTranslation } from "@/lib/i18n/context"
import { FACTS } from "@/lib/i18n/copy/facts"
import { FAQ_PAGE_COPY } from "@/lib/i18n/copy/pages/faq"
import type { Locale } from "@/lib/types"

/** Питання з бази або сіду — усі мови, які заповнила адмінка; порожні падають на uk. */
export type GeneralFaq = { q: Partial<Record<Locale, string>>; a: Partial<Record<Locale, string>> }

const link = "underline underline-offset-4 hover:text-foreground"

export function FaqContent({ general }: { general: GeneralFaq[] }) {
  const { locale } = useTranslation()
  const c = FAQ_PAGE_COPY[locale](FACTS[locale])
  const items = general
    .map((g) => ({ q: g.q[locale] || g.q.uk || "", a: g.a[locale] || g.a.uk || "" }))
    .filter((g) => g.q && g.a)

  return (
    <InfoPage crumbs={[{ name: c.crumb }]} title={c.title} lead={c.lead}>
      <Section>
        <LinkPills items={[{ href: "#zahalni", label: c.generalPill }, ...c.groups.map((g) => ({ href: `#${g.id}`, label: g.group }))]} />
      </Section>

      <Section id="zahalni" eyebrow={c.generalEyebrow} title={c.generalTitle}>
        <Faq items={items} />
      </Section>

      {c.groups.map((g) => (
        <Section key={g.id} id={g.id} title={g.group}>
          <Faq items={g.items} />
        </Section>
      ))}

      <Section>
        <p className="max-w-3xl text-[15px] text-muted-foreground">
          {c.moreLead} <Link href="/tsiny" className={link}>{c.more.prices}</Link>,{" "}
          <Link href="/yak-zamovyty" className={link}>{c.more.howTo}</Link>,{" "}
          <Link href="/dostavka-i-oplata" className={link}>{c.more.delivery}</Link>,{" "}
          <Link href="/harantiya" className={link}>{c.more.warranty}</Link>,{" "}
          <Link href="/memorial/kameni" className={link}>{c.more.guide}</Link>.
        </p>
      </Section>

      <CtaBand title={c.cta.title} text={c.cta.text} cta={c.cta.button} />
    </InfoPage>
  )
}
