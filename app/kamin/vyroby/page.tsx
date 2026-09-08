import { pageMetadata } from '@/lib/stone/seo'
import { categories } from '@/lib/stone/content'
import { CardGrid, PageHero } from '@/components/stone/pages/primitives'

export const metadata = pageMetadata('/kamin/vyroby', { title: 'Вироби з каменю' })
export default function Page() {
  return (
    <PageHero
      eyebrow="Каталог виробів"
      title="Камінь у кожному масштабі."
      copy="Вісім напрямів для інтер’єру, архітектури та ландшафту."
    >
      <CardGrid
        items={categories.map((x) => ({
          name: x.name,
          copy: x.blurb,
          href: `/kamin/vyroby/${x.slug}`,
        }))}
      />
    </PageHero>
  )
}
