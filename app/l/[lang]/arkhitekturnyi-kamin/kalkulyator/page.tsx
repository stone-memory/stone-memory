import { withLocale } from '@/lib/i18n/with-locale'
import { pageMetadata } from '@/lib/stone/seo'
import { getCollections, getSetting } from '@/lib/stone/cms'
import { Calculator } from '@/components/stone/interactive/tools'
import { Faq, PageHero } from '@/components/stone/pages/primitives'

export const metadata = pageMetadata('/arkhitekturnyi-kamin/kalkulyator', { title: 'Калькулятор виробів' })
async function Page() {
  const [collections, rates, faq] = await Promise.all([
    getCollections(),
    getSetting('calculator'),
    getSetting('faq'),
  ])
  return (
    <PageHero
      eyebrow="Онлайн інструмент"
      title="Орієнтовний розрахунок"
      copy="Вкажіть базову конфігурацію виробу й отримайте орієнтир вартості."
    >
      <Calculator collections={collections} rates={rates} />
      <Faq items={faq.calculator} />
    </PageHero>
  )
}
export default withLocale(Page)
