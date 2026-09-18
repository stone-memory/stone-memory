'use client'

import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { useStoneT } from '@/lib/i18n/stone/client'

export function JsonLd({ data }: { data: object }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  )
}

export function PrimaryCtaButton({
  label = 'Розрахувати вартість',
  href = '/arkhitekturnyi-kamin/kalkulyator',
  className = '',
}: {
  label?: string
  href?: string
  className?: string
}) {
  const { t } = useStoneT()
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold leading-5 text-primary-foreground ${className}`}
    >
      {t(label)}
    </Link>
  )
}

export type FaqItem = { question: string; answer: string }
export function FaqSection({
  items,
  title = 'Часті запитання.',
  subtitle,
  includeSchema = true,
}: {
  items: FaqItem[]
  title?: string
  subtitle?: string
  includeSchema?: boolean
}) {
  const { t } = useStoneT()
  return (
    <section className="page-shell mt-20">
      <div className="max-w-4xl">
        <p className="eyebrow text-accent">{t('FAQ')}</p>
        <h2 className="mt-5 text-balance text-4xl font-semibold tracking-[-.04em]">{t(title)}</h2>
        {subtitle && (
          <p className="mt-4 max-w-3xl text-pretty leading-7 text-muted-foreground">{t(subtitle)}</p>
        )}
      </div>
      <div className="mt-8 max-w-4xl rounded-xl border">
        {items.map((item) => (
          <details key={item.question} className="group border-b p-5 last:border-0">
            {/* Один індикатор на всі браузери: стрілка, що обертається при
                розкритті. Рідний трикутник Safari прибирає faq-summary у
                globals.css, «плюсик» поруч із ним дублював індикатор. */}
            <summary className="faq-summary flex cursor-pointer list-none items-start justify-between gap-4 font-semibold">
              <span>{t(item.question)}</span>
              <ChevronDown
                className="mt-0.5 size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">{t(item.answer)}</p>
          </details>
        ))}
      </div>
      {includeSchema && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: items.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: { '@type': 'Answer', text: item.answer },
            })),
          }}
        />
      )}
    </section>
  )
}

export function AuthorCard() {
  const { t } = useStoneT()
  return (
    <aside className="mt-12 rounded-xl border p-6">
      <p className="eyebrow text-accent">{t('Автор')}</p>
      <h2 className="mt-3 text-xl font-semibold">{t('Майстерня Stone Memory')}</h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {t('Власне виробництво кам’яних виробів у Костополі, Рівненська область. Працюємо з матеріалом від підбору сляба до точного виготовлення та монтажу.')}
      </p>
      <div className="mt-4 flex gap-4 text-sm font-semibold">
        <Link href="/pro-nas">{t('Про майстерню')}</Link>
        <Link href="/arkhitekturnyi-kamin/kontakty">{t('Контакти')}</Link>
      </div>
    </aside>
  )
}
