import { pageMetadata } from '@/lib/stone/seo'
import { getSetting } from '@/lib/stone/cms'
import { CardGrid, PageHero } from '@/components/stone/pages/primitives'

export const metadata = pageMetadata('/arkhitekturnyi-kamin/porivnyannya', { title: 'Порівняння матеріалів' })
export default async function Page() {
  const comparisons = await getSetting('comparisons')
  return (
    <PageHero
      eyebrow="Матеріали без міфів"
      title="Порівняння матеріалів."
      copy="Короткі парні порівняння з висновком спочатку та зведена таблиця всіх матеріалів."
    >
      <CardGrid
        items={[
          ...Object.entries(comparisons).map(([slug, c]) => ({
            name: c.title,
            copy: c.verdict,
            href: `/arkhitekturnyi-kamin/porivnyannya/${slug}`,
          })),
          {
            name: 'Усі матеріали в одній таблиці',
            copy: 'Ключові відмінності для проєктування, експлуатації та догляду.',
            href: '/arkhitekturnyi-kamin/porivnyannya/materialiv',
          },
        ]}
      />
    </PageHero>
  )
}
