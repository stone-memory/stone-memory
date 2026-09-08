import { pageMetadata } from '@/lib/stone/seo'
import { FinishSlider } from '@/components/stone/interactive/stone-tools'
import { PageHero } from '@/components/stone/pages/primitives'

export const metadata = pageMetadata('/arkhitekturnyi-kamin/materialy/finishi/porivnyannya', {
  title: 'Порівняння фінішів каменю',
})
export default function Page() {
  return (
    <PageHero
      eyebrow="Тактильність і світло"
      title="Як фініш змінює поверхню."
      copy="Перетягніть розділювач або керуйте ним із клавіатури."
    >
      <FinishSlider />
    </PageHero>
  )
}
