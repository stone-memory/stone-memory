import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SelectionSidebar } from "@/components/selection-sidebar"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { CatalogGrid } from "@/components/catalog-grid"
import { CatalogIndex } from "@/components/catalog-index"
import { CatalogPageSections } from "@/components/catalog-page-sections"
import {
  MEMORIAL_FACETS,
  catalogPageCount,
  catalogPagePath,
  facetItems,
  type Facet,
} from "@/lib/catalog-taxonomy"
import { absoluteUrl } from "@/lib/site-config"
import { CATALOG_COPY } from "@/lib/i18n/copy/catalog"
import { FACET_H1 } from "@/lib/i18n/copy/common"
import { locales, type Locale, type StoneItem } from "@/lib/types"

type Props = {
  stones: StoneItem[]
  /** Немає — це кореневий каталог. */
  facet?: Facet
  page: number
}

/** Мапа «мова → рядок» з одного поля словника, для клієнтських крихт і заголовків. */
const perLocale = (get: (l: Locale) => string) =>
  Object.fromEntries(locales.map((l) => [l, get(l)])) as Record<Locale, string>

/**
 * Сторінка каталогу — кореневого або фасета, будь-якої сторінки пагінації.
 *
 * Одна серверна розкладка на чотири адреси (/pamyatnyky, /pamyatnyky/
 * storinka-2, /pamyatnyky/chorni, /pamyatnyky/chorni/storinka-2), щоб
 * пагінація й фасети не розійшлись у верстці. Пагінація тут — справжні
 * посилання: раніше сторінки перемикались станом React, і бот бачив лише
 * перші 30 з 122 товарів.
 *
 * Мову знає лише клієнт, тому тексти передаються мапами за локаллю, а секції
 * під сіткою рендерить клієнтський CatalogPageSections. Сам `Facet` містить
 * функцію `match` і через межу сервер/клієнт не проходить — далі йдуть лише
 * його рядкові поля.
 */
export function CatalogPage({ stones, facet, page }: Props) {
  const monuments = stones.filter((s) => s.category === "memorial")
  const items = facet ? facetItems(stones, facet) : monuments
  const pageCount = catalogPageCount(items.length)
  const slug = facet?.slug ?? null
  const hrefFor = (n: number) => catalogPagePath(slug, n)
  const siblings = MEMORIAL_FACETS.filter((f) => f.slug !== facet?.slug)
    .map((f) => ({ slug: f.slug, h1: f.h1, count: facetItems(stones, f).length }))
    .filter((f) => f.count > 0)

  const catalogCrumb = perLocale((l) => CATALOG_COPY[l].crumb)
  const facetHeading = facet ? { ...FACET_H1[facet.slug], uk: facet.h1 } : undefined

  return (
    <>
      {/* React 19 переносить <link> у <head>: prev/next — сигнал для бота, що
          це один список, розбитий на сторінки. */}
      {page > 1 && <link rel="prev" href={absoluteUrl(hrefFor(page - 1))} />}
      {page < pageCount && <link rel="next" href={absoluteUrl(hrefFor(page + 1))} />}

      <Header />
      <main id="main-content">
        <div className="mx-auto max-w-7xl px-6 pt-6">
          <Breadcrumbs
            items={
              facet && facetHeading
                ? [{ name: catalogCrumb, href: "/memorial/pamyatnyky" }, { name: facetHeading }]
                : [{ name: catalogCrumb }]
            }
          />
        </div>

        <CatalogGrid
          initialStones={stones}
          lockedCategory="memorial"
          facetSlug={facet?.slug}
          heading={facetHeading ?? perLocale((l) => CATALOG_COPY[l].rootHeading)}
          // Опис фасета існує лише українською; інші мови отримують перекладений кореневий вступ.
          intro={facet ? { ...perLocale((l) => CATALOG_COPY[l].rootIntro), uk: facet.description } : perLocale((l) => CATALOG_COPY[l].rootIntro)}
          initialPage={page}
          linkedPages
        />

        <CatalogPageSections
          facet={facet ? { slug: facet.slug, h1: facet.h1, intro: facet.intro } : undefined}
          page={page}
          monumentsCount={monuments.length}
          minPrice={minPrice(monuments)}
          siblings={siblings}
        />

        {!facet && page === 1 && <CatalogIndex stones={stones} />}
      </main>
      <Footer />
      <SelectionSidebar />
    </>
  )
}

function minPrice(stones: StoneItem[]): number | null {
  const prices = stones.map((s) => s.priceFrom).filter((p): p is number => typeof p === "number" && p > 0)
  return prices.length ? Math.min(...prices) : null
}
