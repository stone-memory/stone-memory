import { pageMetadata } from '@/lib/stone/seo'
import { getCollections } from '@/lib/stone/cms'
import { FacetedCatalog } from '@/components/stone/catalog/faceted-catalog'
import { Breadcrumbs } from '@/components/stone/pages/primitives'
import { getStoneT } from '@/lib/i18n/stone/server'

export const metadata = pageMetadata('/arkhitekturnyi-kamin/catalog', { title: 'Каталог каменю' })
export default async function Page() {
  const [collections, { t }] = await Promise.all([getCollections(), getStoneT()])
  return (
    <main id="main-content">
      <Breadcrumbs items={[{ name: 'Каталог каменю' }]} />
      <section className="page-shell pt-16">
        <p className="eyebrow text-accent">{collections.length} {t('колекцій')}</p>
        <h1 className="mt-5 max-w-4xl text-balance text-4xl font-semibold tracking-[-.055em] sm:text-6xl md:text-8xl">
          {t('Каталог каменю')}
        </h1>
        <p className="mt-7 max-w-xl leading-7 text-muted-foreground">
          {t('Фільтруйте натуральний камінь, кварц і керамограніт за застосуванням, тоном та технічними параметрами.')}
        </p>
      </section>
      <FacetedCatalog collections={collections} />
    </main>
  )
}
