import Link from 'next/link'
import { getSetting } from '@/lib/stone/cms'
import type { Comparison } from '@/lib/stone/cms-types'
import { Breadcrumbs, Faq } from '@/components/stone/pages/primitives'
import { getStoneT } from '@/lib/i18n/stone/server'

export async function ComparisonPage({ comparison: d }: { comparison: Comparison }) {
  const [faq, { t }] = await Promise.all([getSetting('faq'), getStoneT()])
  return (
    <main id="main-content">
      <Breadcrumbs items={[{ name: 'Порівняння', href: '/arkhitekturnyi-kamin/porivnyannya' }, { name: d.title }]} />
      <section className="page-shell py-20">
        <p className="eyebrow text-accent">{t('Висновок спочатку')}</p>
        <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-.055em] sm:text-6xl md:text-8xl">
          {t(d.title)}
        </h1>
        <p className="mt-8 max-w-2xl text-xl leading-8">{t(d.verdict)}</p>
        <div className="mt-12 overflow-x-auto rounded-xl border">
          <table className="w-full min-w-2xl text-left">
            <thead>
              <tr className="bg-card">
                <th className="p-5">{t('Критерій')}</th>
                <th className="p-5 text-2xl">{t(d.left)}</th>
                <th className="p-5 text-2xl">{t(d.right)}</th>
              </tr>
            </thead>
            <tbody>
              {d.rows.map((r) => (
                <tr className="border-t" key={r[0]}>
                  {r.map((x, i) => (
                    <td
                      className={`p-5 text-sm ${i ? 'text-muted-foreground' : 'font-semibold'}`}
                      key={x}
                    >
                      {t(x)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/arkhitekturnyi-kamin/materialy" className="rounded-full border px-5 py-3 text-sm">
            {t('Переглянути матеріали')}
          </Link>
          <Link
            href="/arkhitekturnyi-kamin/kalkulyator"
            className="rounded-full bg-primary px-5 py-3 text-sm text-primary-foreground"
          >
            {t('Оцінити бюджет')}
          </Link>
        </div>
        <Faq items={faq.category.slice(0, 3)} />
      </section>
    </main>
  )
}
