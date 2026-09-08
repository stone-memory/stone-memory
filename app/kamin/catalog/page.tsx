import { pageMetadata } from '@/lib/stone/seo'
import { getCollections } from '@/lib/stone/cms'
import { FacetedCatalog } from '@/components/stone/catalog/faceted-catalog'
import { Breadcrumbs } from '@/components/stone/pages/primitives'

export const metadata = pageMetadata('/kamin/catalog', { title: 'Каталог каменю' })
export default async function Page() {
  const collections = await getCollections()
  return (
    <main>
      <Breadcrumbs items={[{ name: 'Каталог каменю' }]} />
      <section className="page-shell pt-16">
        <p className="eyebrow text-accent">{collections.length} колекцій</p>
        <h1 className="mt-5 max-w-4xl text-balance text-6xl font-semibold tracking-[-.055em] md:text-8xl">
          Каталог каменю
        </h1>
        <p className="mt-7 max-w-xl leading-7 text-muted-foreground">
          Фільтруйте натуральний камінь, кварц і керамограніт за застосуванням, тоном та технічними
          параметрами.
        </p>
      </section>
      <FacetedCatalog collections={collections} />
    </main>
  )
}
