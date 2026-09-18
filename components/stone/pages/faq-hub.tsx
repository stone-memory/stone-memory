import { getSetting } from '@/lib/stone/cms'
import { SupportLinks } from '@/components/stone/interactive/support-tools'
import { Breadcrumbs, Faq, JsonLd } from '@/components/stone/pages/primitives'
import { getStoneT } from '@/lib/i18n/stone/server'

export async function FaqHub() {
  const [faq, { t }] = await Promise.all([getSetting('faq'), getStoneT()])
  const items = [...faq.category, ...faq.calculator, ...faq.b2b, ...faq.geo].filter(
    (x, i, a) => a.findIndex((y) => y.question === x.question) === i
  )
  return (
    <main id="main-content">
      <Breadcrumbs items={[{ name: 'Питання й відповіді' }]} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: items.map((x) => ({
            '@type': 'Question',
            name: x.question,
            acceptedAnswer: { '@type': 'Answer', text: x.answer },
          })),
        }}
      />
      <section className="page-shell py-20">
        <p className="eyebrow text-accent">{t('Підтримка')}</p>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-.055em] sm:text-6xl md:text-8xl">
          {t('Відповіді до початку робіт.')}
        </h1>
        <Faq items={items} includeSchema={false} />
        <div className="mt-10">
          <SupportLinks />
        </div>
      </section>
    </main>
  )
}
