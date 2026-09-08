import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SITE_URL } from '@/lib/site-config'
import { FaqSection, JsonLd } from '@/components/stone/site/content-components'

/** Спільні будівельні блоки сторінок. Серверні компоненти без стану. */

export { JsonLd }

export function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <>
      <nav
        className="page-shell pt-8 text-xs text-muted-foreground"
        aria-label="Навігаційний ланцюжок"
      >
        <Link href="/">Головна</Link>
        {items.map((x) => (
          <span key={x.name}>
            {' '}
            <span className="px-2">/</span>
            {x.href ? (
              <Link href={x.href}>{x.name}</Link>
            ) : (
              <span aria-current="page">{x.name}</span>
            )}
          </span>
        ))}
      </nav>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { name: 'Головна', item: SITE_URL, '@type': 'ListItem', position: 1 },
            ...items.map((x, i) => ({
              '@type': 'ListItem',
              position: i + 2,
              name: x.name,
              item: x.href ? SITE_URL + x.href : undefined,
            })),
          ],
        }}
      />
    </>
  )
}

export function PageHero({
  eyebrow,
  title,
  copy,
  children,
}: {
  eyebrow: string
  title: string
  copy: string
  children?: React.ReactNode
}) {
  return (
    <main>
      <section className="page-shell py-20 md:py-28">
        <p className="eyebrow text-accent">{eyebrow}</p>
        <h1 className="mt-5 max-w-5xl text-balance text-6xl font-semibold leading-[.95] tracking-[-.055em] md:text-8xl">
          {title}
        </h1>
        <p className="mt-8 max-w-xl text-pretty text-base leading-7 text-muted-foreground">
          {copy}
        </p>
        {children && <div className="mt-14">{children}</div>}
      </section>
    </main>
  )
}

export function CardGrid({
  items,
}: {
  items: { name: string; copy: string; href: string; image?: string; alt?: string }[]
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {items.map((x, i) => (
        <Link
          href={x.href}
          key={x.href}
          className="group overflow-hidden rounded-xl bg-card hover:bg-secondary"
        >
          {x.image && (
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={x.image}
                alt={x.alt || x.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
              />
            </div>
          )}
          <div className="flex min-h-52 flex-col justify-between p-6">
            <span className="eyebrow text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h2 className="text-2xl font-semibold">{x.name}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{x.copy}</p>
              <ArrowRight className="mt-5" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export function Faq({
  items,
  includeSchema = true,
}: {
  items: { question: string; answer: string }[]
  includeSchema?: boolean
}) {
  return <FaqSection items={items} includeSchema={includeSchema} />
}
