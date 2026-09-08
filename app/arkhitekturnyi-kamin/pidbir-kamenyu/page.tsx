import { pageMetadata } from '@/lib/stone/seo'
import { getCollections } from '@/lib/stone/cms'
import { StoneQuiz } from '@/components/stone/interactive/stone-tools'
import { PageHero } from '@/components/stone/pages/primitives'

export const metadata = pageMetadata('/arkhitekturnyi-kamin/pidbir-kamenyu', { title: 'Підбір каменю за сценарієм' })
export default async function Page() {
  return (
    <PageHero
      eyebrow="4 короткі кроки"
      title="Підбір каменю за вашим сценарієм."
      copy="Відповіді сформують shortlist із реальних колекцій каталогу."
    >
      <StoneQuiz collections={await getCollections()} />
    </PageHero>
  )
}
