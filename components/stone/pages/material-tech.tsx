import Link from 'next/link'
import { edgeProfiles, finishes, thicknesses } from '@/data/stone/technical'
import { getRemnants } from '@/lib/stone/cms'
import {
  EdgeProfiles,
  FinishGrid,
  RemnantInventory,
  SupportLinks,
} from '@/components/stone/interactive/support-tools'
import { SectionHeading } from '@/components/stone/site/shell'
import { Cta } from '@/components/stone/site/sections'
import { Breadcrumbs, JsonLd } from '@/components/stone/pages/primitives'
import { getStoneT } from '@/lib/i18n/stone/server'

/** Технічні сторінки матеріалів: товщини, профілі країв, фініші, залишки слябів. */

export async function ThicknessPage() {
  const { t } = await getStoneT()
  return (
    <main id="main-content">
      <Breadcrumbs items={[{ name: 'Матеріали', href: '/arkhitekturnyi-kamin/materialy' }, { name: 'Товщини' }]} />
      <section className="page-shell py-20">
        <SectionHeading
          as="h1"
          eyebrow="Специфікація"
          title="Товщина — це конструктивне рішення."
          copy="Вибір залежить від матеріалу, опор, масштабу деталі та бажаного торця."
        />
        <div className="mt-12 overflow-hidden rounded-xl border">
          {thicknesses.map(([size, use, note]) => (
            <div
              key={size}
              className="grid gap-3 border-b p-6 last:border-0 md:grid-cols-[.4fr_1fr_1fr]"
            >
              <h2 className="text-2xl font-semibold">{size.replace('мм', t('мм'))}</h2>
              <p>{t(use)}</p>
              <p className="text-sm text-muted-foreground">{t(note)}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <SupportLinks />
        </div>
      </section>
      <Cta />
    </main>
  )
}

export async function EdgePage() {
  const { t } = await getStoneT()
  return (
    <main id="main-content">
      <Breadcrumbs
        items={[
          { name: 'Вироби', href: '/arkhitekturnyi-kamin/vyroby' },
          { name: 'Стільниці', href: '/arkhitekturnyi-kamin/vyroby/stilnytsi' },
          { name: 'Профілі країв' },
        ]}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: edgeProfiles.map((x, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: x[0],
          })),
        }}
      />
      <section className="page-shell py-20">
        <SectionHeading
          as="h1"
          eyebrow="Профілі країв"
          title="Десять способів завершити площину."
          copy="Фінальна доступність залежить від матеріалу, товщини та геометрії."
        />
        <div className="mt-12">
          <EdgeProfiles />
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/arkhitekturnyi-kamin/kalkulyator"
            className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            {t('Оцінити вартість')}
          </Link>
          <Link href="/arkhitekturnyi-kamin/kontakty" className="rounded-full border px-5 py-3 text-sm">
            {t('Погодити профіль')}
          </Link>
        </div>
      </section>
    </main>
  )
}

export function FinishPage() {
  return (
    <main id="main-content">
      <Breadcrumbs items={[{ name: 'Матеріали', href: '/arkhitekturnyi-kamin/materialy' }, { name: 'Фініші' }]} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: finishes.map((x, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: x[0],
          })),
        }}
      />
      <section className="page-shell py-20">
        <SectionHeading
          as="h1"
          eyebrow="Обробка поверхні"
          title="Один камінь — сім різних відчуттів."
          copy="Фініш змінює колір, ковзання, тактильність і догляд."
        />
        <div className="mt-12">
          <FinishGrid />
        </div>
      </section>
      <Cta />
    </main>
  )
}

export async function RemnantsPage() {
  const remnants = await getRemnants()
  return (
    <main id="main-content">
      <Breadcrumbs items={[{ name: 'Залишки слябів' }]} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: remnants.map((x, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: `${x.name} ${x.id}`,
          })),
        }}
      />
      <section className="page-shell py-20">
        <SectionHeading
          as="h1"
          eyebrow="Раціональний вибір"
          title="Залишки слябів для компактних виробів."
          copy="Фактичні фрагменти для підвіконь, столиків, полиць і невеликих стільниць."
        />
        <div className="mt-12">
          <RemnantInventory remnants={remnants} />
        </div>
      </section>
    </main>
  )
}
