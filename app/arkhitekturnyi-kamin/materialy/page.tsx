import { pageMetadata } from '@/lib/stone/seo'
import { getCollections } from '@/lib/stone/cms'
import { MaterialCatalog } from '@/components/stone/interactive/tools'
import { PageHero } from '@/components/stone/pages/primitives'

export const metadata = pageMetadata('/arkhitekturnyi-kamin/materialy', { title: 'Матеріали' })
export default async function Page() {
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
