import { pageMetadata } from '@/lib/stone/seo'
import { StoneCompareTable } from '@/components/stone/interactive/stone-tools'
import { PageHero } from '@/components/stone/pages/primitives'

export const metadata = pageMetadata('/kamin/porivnyannya/materialiv', {
  title: 'Порівняння матеріалів на одній площині',
})
export default function Page() {
  return (
    <PageHero
      eyebrow="Матеріали без міфів"
      title="Порівняйте камінь на одній площині."
      copy="Ключові відмінності для проєктування, експлуатації та догляду."
    >
      <StoneCompareTable />
    </PageHero>
  )
}
