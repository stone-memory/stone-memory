import { withLocale } from '@/lib/i18n/with-locale'
import { pageMetadata } from '@/lib/stone/seo'
import { getSlabs } from '@/lib/stone/cms'
import { Inventory } from '@/components/stone/interactive/tools'
import { PageHero } from '@/components/stone/pages/primitives'

export const metadata = pageMetadata('/arkhitekturnyi-kamin/b2b/slyaby', {
  title: 'Сляби в наявності',
  image: '/detail-stone-edge.webp',
})
async function Page() {
  return (
    <PageHero
      eyebrow="Live inventory"
      title="Кожен сляб — окремий вибір."
      copy="Фільтруйте фактичні сляби за матеріалом, кольором, товщиною та статусом."
    >
      <Inventory slabs={await getSlabs()} />
    </PageHero>
  )
}
export default withLocale(Page)
