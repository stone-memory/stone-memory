import { withLocale } from '@/lib/i18n/with-locale'
import { pageMetadata } from '@/lib/stone/seo'
import { getCollections } from '@/lib/stone/cms'
import { MaterialCatalog } from '@/components/stone/interactive/tools'
import { PageHero } from '@/components/stone/pages/primitives'

export const metadata = pageMetadata('/arkhitekturnyi-kamin/materialy', { title: 'Матеріали' })
async function Page() {
  return (
    <PageHero
      eyebrow="Бібліотека матеріалів"
      title="Оберіть характер поверхні."
      copy="Колекції, фініші та застосування в одному каталозі."
    >
      <MaterialCatalog collections={await getCollections()} />
    </PageHero>
  )
}
export default withLocale(Page)
