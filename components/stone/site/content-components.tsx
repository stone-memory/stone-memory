import Link from 'next/link'

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
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold leading-5 text-primary-foreground ${className}`}
    >
      {label}
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
  return (
    <section className="page-shell mt-20">
      <div className="max-w-4xl">
        <p className="eyebrow text-accent">FAQ</p>
        <h2 className="mt-5 text-balance text-4xl font-semibold tracking-[-.04em]">{title}</h2>
        {subtitle && (
          <p className="mt-4 max-w-3xl text-pretty leading-7 text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="mt-8 max-w-4xl rounded-xl border">
        {items.map((item) => (
          <details key={item.question} className="group border-b p-5 last:border-0">
            <summary className="cursor-pointer list-none font-semibold">
              {item.question}
              <span className="float-right" aria-hidden="true">
                +
              </span>
            </summary>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">{item.answer}</p>
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
  return (
    <aside className="mt-12 rounded-xl border p-6">
      <p className="eyebrow text-accent">Автор</p>
      <h2 className="mt-3 text-xl font-semibold">Майстерня Stone Memory</h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Власне виробництво кам&apos;яних виробів у Костополі, Рівненська область. Працюємо з
        матеріалом від підбору сляба до точного виготовлення та монтажу.
      </p>
      <div className="mt-4 flex gap-4 text-sm font-semibold">
        <Link href="/pro-nas">Про майстерню</Link>
        <Link href="/arkhitekturnyi-kamin/kontakty">Контакти</Link>
      </div>
    </aside>
  )
}
