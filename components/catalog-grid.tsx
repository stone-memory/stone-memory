"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { StoneCard } from "@/components/stone-card"
import { CatalogFilters, applyFilters, emptyFilters, type FiltersState } from "@/components/catalog-filters"
import { CatalogPager } from "@/components/catalog-pager"
import { useHideOnScroll, usePassedTop } from "@/lib/use-scroll-direction"
import { useSelectionStore } from "@/lib/store/selection"
import { useOrdersStore } from "@/lib/store/orders"
import { usePopularity } from "@/lib/store/popularity"
import { useTranslation } from "@/lib/i18n/context"
import { useStones } from "@/lib/store/stones"
import { filterLabels } from "@/lib/i18n/filters"
import { findFacet } from "@/lib/catalog-taxonomy"
import type { Category, StoneItem } from "@/lib/types"

type CatalogGridProps = {
  initialStones: StoneItem[]
  /**
   * Pin the grid to one category and hide the category switch.
   *
   * Every caller passes this today — the catalogue lives at /memorial/pamyatnyky,
   * whose URL, h1 and title all name one category, so the grid must not be able
   * to show anything else underneath them.
   */
  lockedCategory?: Category
  /**
   * Facet slug from lib/catalog-taxonomy. Passed as a string, not a predicate,
   * because props crossing the server/client boundary must be serializable —
   * the match function is looked up from the slug on this side.
   */
  facetSlug?: string
  heading?: string
  intro?: string
}

export function CatalogGrid({
  initialStones,
  lockedCategory,
  facetSlug,
  heading,
  intro,
}: CatalogGridProps) {
  const storedCategory = useSelectionStore((state) => state.category)
  const setCategory = useSelectionStore((state) => state.setCategory)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Use a stable "memorial" on SSR to prevent hydration mismatch from persisted category
  const category: Category = lockedCategory ?? (mounted ? storedCategory : "memorial")

  // Keep the persisted store in step with a pinned route, so the sidebar and
  // any later navigation back to the open catalogue start from this vertical.
  useEffect(() => {
    if (lockedCategory && mounted && storedCategory !== lockedCategory) {
      setCategory(lockedCategory)
    }
  }, [lockedCategory, mounted, storedCategory, setCategory])
  const { t, locale } = useTranslation()
  const L = filterLabels[locale]
  const storeStones = useStones()
  // Server-provided list is the source of truth for the first paint; the store
  // takes over once it hydrates so admin edits still appear live.
  const stones = storeStones.length > 0 ? storeStones : initialStones

  const facet = facetSlug ? findFacet(facetSlug) : undefined
  const baseItems = useMemo(
    () => stones.filter((s) => s.category === category && (!facet || facet.match(s))),
    [category, stones, facet]
  )

  // Popularity: combine "add to cart" counts (client) + submitted order counts (global)
  const addCounts = usePopularity()
  const orders = useOrdersStore((s) => s.orders)
  const popularity = useMemo(() => {
    const map = new Map<string, number>()
    // add-to-cart counts × 1
    for (const [id, n] of addCounts) {
      map.set(id, (map.get(id) || 0) + n)
    }
    // completed/submitted orders × 3 (stronger signal)
    for (const o of orders) {
      for (const i of o.items) {
        map.set(i.id, (map.get(i.id) || 0) + 3)
      }
    }
    return map
  }, [addCounts, orders])

  const [filtersByCategory, setFiltersByCategory] = useState<Record<Category, FiltersState>>({
    memorial: emptyFilters,
    home: emptyFilters,
  })
  const filters = filtersByCategory[category]
  const setFilters = (next: FiltersState) =>
    setFiltersByCategory((prev) => ({ ...prev, [category]: next }))

  const filteredStones = useMemo(
    () => applyFilters(baseItems, filters, popularity),
    [baseItems, filters, popularity]
  )

  // Посторінковий вивід: 15 карток на телефоні, 30 на десктопі.
  const pageSize = usePageSize()
  const [page, setPage] = useState(1)
  const sectionRef = useRef<HTMLElement>(null)
  // Панель фільтрів ховається при прокрутці вниз — але лише після того, як
  // перша картка пішла під шапку. Раніше під сховану панель відкривалась
  // порожня смуга: `sticky` зберігає місце в потоці, тому контент знизу
  // не піднімається.
  const scrollingDown = useHideOnScroll()
  const { ref: firstCardRef, passed: pastFirstCard } = usePassedTop(56)

  const pageCount = Math.max(1, Math.ceil(filteredStones.length / pageSize))

  // Новий фільтр — новий набір, тому повертаємось на першу сторінку.
  useEffect(() => {
    setPage(1)
  }, [category, filters])

  // Зміна ширини екрана міняє розмір сторінки, а з ним і їх кількість. Тут
  // саме притискаємо номер до наявного діапазону, а не скидаємо на першу:
  // після повороту телефона людина має лишитись приблизно там, де читала.
  useEffect(() => {
    setPage((p) => Math.min(p, pageCount))
  }, [pageCount])

  const visibleStones = filteredStones.slice((page - 1) * pageSize, page * pageSize)

  const goToPage = (next: number) => {
    setPage(next)
    // Без цього нова сторінка відкривається на висоті, де людина натиснула
    // перемикач, — тобто одразу в кінці списку.
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <section
      id="catalog"
      ref={sectionRef}
      className="mx-auto max-w-7xl px-6 pt-6 pb-16 md:pt-8 md:pb-20 scroll-mt-14"
    >
      <div className="mb-6 md:mb-8">
        {/* h1, not h2: this is the catalogue page's main heading and the route
            previously shipped no h1 at all. */}
        <h1 className="text-4xl font-semibold tracking-tight-custom md:text-6xl text-balance">
          {heading ?? t.catalog.heading}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance md:text-lg">
          {intro ?? t.catalog.subheading}
        </p>
      </div>

      <div className="mb-5 flex items-center justify-between gap-3">
        <span />
        <span className="text-sm text-muted-foreground tabular-nums">
          {filteredStones.length} {t.catalog.count}
        </span>
      </div>

      <CatalogFilters
        category={category}
        items={baseItems}
        value={filters}
        onChange={setFilters}
        totalCount={filteredStones.length}
        hidden={scrollingDown && pastFirstCard}
      />

      {filteredStones.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-lg text-muted-foreground">{L.noResults}</p>
        </div>
      ) : (
        <>
          {/* Вартовий на верхній межі сітки: поки він у полі зору, перша
              картка ще не пішла під шапку, і ховати панель зарано — під нею
              лишилась би порожня смуга. */}
          <div ref={firstCardRef} aria-hidden className="mt-8 h-px -mb-px" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleStones.map((stone, i) => (
              // First three are above the fold on every breakpoint (1/2/3 cols).
              <StoneCard key={stone.id} item={stone} priority={i < 3} />
            ))}
          </div>
          <CatalogPager
            page={page}
            pageCount={pageCount}
            onChange={goToPage}
            labels={t.catalog}
          />
        </>
      )}
    </section>
  )
}

/**
 * Скільки карток на сторінці: 15 на телефоні, 30 від планшета вгору.
 *
 * На сервері віддаємо десктопне значення, бо ширини там немає, а 30 — це
 * надмножина: мобільний браузер після монтування просто обріже список до 15.
 * Зворотний порядок дав би на десктопі порожні місця в сітці до гідратації.
 */
function usePageSize(): number {
  const [size, setSize] = useState(30)

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    const apply = () => setSize(mq.matches ? 30 : 15)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  return size
}
