import { notFound } from 'next/navigation'
import { getSetting } from '@/lib/stone/cms'
import { SupportLinks } from '@/components/stone/interactive/support-tools'
import { Cta, WorkSteps } from '@/components/stone/site/sections'
import { Breadcrumbs, Faq } from '@/components/stone/pages/primitives'
import { getStoneT } from '@/lib/i18n/stone/server'

/** Сторінки підтримки (адмінка → Стільниці → Сторінки): /harantiya, /dostavka-i-montazh, /dohliad. */
export async function SupportPage({ slug }: { slug: string }) {
  const [support, { t }] = await Promise.all([getSetting('support'), getStoneT()])
  const page = support[slug]
  if (!page) notFound()
  return (
    <main id="main-content">
      <Breadcrumbs items={[{ name: 'Підтримка', href: '/arkhitekturnyi-kamin/faq' }, { name: page.title }]} />
      <section className="page-shell py-20">
        <p className="eyebrow text-accent">{t(page.eyebrow)}</p>
        <h1 className="mt-5 max-w-5xl text-balance text-4xl font-semibold tracking-[-.055em] sm:text-6xl md:text-8xl">
          {t(page.title)}
        </h1>
        <p className="mt-8 max-w-xl leading-7 text-muted-foreground">{t(page.copy)}</p>
        <div className="mt-14 grid gap-px overflow-hidden rounded-xl bg-border md:grid-cols-3">
          {page.sections.map((x) => (
            <article key={x.title} className="bg-card p-7">
              <h2 className="text-2xl font-semibold">{t(x.title)}</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{t(x.copy)}</p>
            </article>
          ))}
        </div>
        <div className="mt-10">
          <SupportLinks />
        </div>
        {slug === 'dostavka-i-montazh' && <WorkSteps />}
        <Faq items={page.faq} />
      </section>
      <Cta />
    </main>
  )
}
