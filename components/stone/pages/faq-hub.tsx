import { getSetting } from '@/lib/stone/cms'
import { SupportLinks } from '@/components/stone/interactive/support-tools'
import { Breadcrumbs, Faq, JsonLd } from '@/components/stone/pages/primitives'

export async function FaqHub() {
  const faq = await getSetting('faq')
  const items = [...faq.category, ...faq.calculator, ...faq.b2b, ...faq.geo].filter(
    (x, i, a) => a.findIndex((y) => y.question === x.question) === i
  )
  return (
    <main>
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
        <p className="eyebrow text-accent">Підтримка</p>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-.055em] sm:text-6xl md:text-8xl">
          Відповіді до початку робіт.
        </h1>
        <Faq items={items} includeSchema={false} />
        <div className="mt-10">
          <SupportLinks />
        </div>
      </section>
    </main>
  )
}
