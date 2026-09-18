import { SITE_URL } from '@/lib/site-config'
import { getCollections, getContacts, getSetting } from '@/lib/stone/cms'
import type { GeoCity } from '@/lib/stone/cms-types'
import { MaterialCatalog } from '@/components/stone/interactive/tools'
import { Cta } from '@/components/stone/site/sections'
import { Breadcrumbs, Faq, JsonLd } from '@/components/stone/pages/primitives'
import { getStoneT } from '@/lib/i18n/stone/server'

export async function GeoPage({ city, data: d }: { city: string; data: GeoCity }) {
  const [contacts, faq, collections, { t }] = await Promise.all([
    getContacts(),
    getSetting('faq'),
    getCollections(),
    getStoneT(),
  ])
  return (
    <main id="main-content">
      <Breadcrumbs
        items={[{ name: 'Стільниці', href: '/arkhitekturnyi-kamin/vyroby/stilnytsi' }, { name: d.locative }]}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: `Stone Memory — стільниці у ${d.locative}`,
          url: `${SITE_URL}/stilnytsi/${city}`,
          telephone: contacts.phone.display,
          areaServed: { '@type': 'City', name: d.locative },
        }}
      />
      <section className="page-shell py-20">
        <p className="eyebrow text-accent">{t('Локальний сервіс')}</p>
        <h1 className="mt-5 max-w-5xl text-4xl font-semibold tracking-[-.055em] sm:text-6xl md:text-8xl">
          {t('Кам’яні стільниці у')} {t(d.locative)}.
        </h1>
        <p className="mt-8 max-w-xl leading-7 text-muted-foreground">
          {t(d.context)} {t(d.distance)}
        </p>
        <div className="mt-14">
          <MaterialCatalog collections={collections} />
        </div>
        <Faq items={faq.geo} />
      </section>
      <Cta />
    </main>
  )
}
