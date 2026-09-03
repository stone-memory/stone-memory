"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { StoneCard } from "@/components/stone-card"
import { SegmentedControl } from "@/components/segmented-control"
import { CatalogFilters, applyFilters, emptyFilters, type FiltersState } from "@/components/catalog-filters"
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
   * Pin the grid to one vertical and hide the memorial/home switch.
   *
   * /memorial/pamyatnyky is a category URL, so letting the visitor flip to
   * "Дім і сад" there would show content the URL, h1 and title all disagree
   * with — the exact mismatch the ?cat= structure was replaced to fix.
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
  const urlParamApplied = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Use a stable "memorial" on SSR to prevent hydration mismatch from persisted category
  const category: Category = lockedCategory ?? (mounted ? storedCategory : "memorial")

  // Apply ?cat= only once on initial mount — subsequent button clicks must not
  // be overridden by the stale param still sitting in the URL.
  //
  // Read from window rather than useSearchParams(): calling that hook during
  // render opts the whole subtree out of static generation, so Next served an
  // empty shell and the grid only appeared after hydration — which is exactly
  // the crawlability bug this page had. The param is only consulted on mount,
  // so window is sufficient and keeps the route prerenderable.
  useEffect(() => {
    if (lockedCategory || !mounted || urlParamApplied.current) return
    const cat = new URLSearchParams(window.location.search).get("cat")
    if (cat === "memorial" || cat === "home") {
      setCategory(cat)
    }
    urlParamApplied.current = true
  }, [lockedCategory, mounted, setCategory])

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

  // Render the grid in windows and grow it as the user scrolls, so the page
  // mounts ~one screen of cards instead of all 60+ at once.
  const PAGE_SIZE = 9
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [category, filters])

  const visibleStones = filteredStones.slice(0, visibleCount)
  const hasMore = visibleCount < filteredStones.length

  useEffect(() => {
    if (!hasMore) return
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setVisibleCount((c) => c + PAGE_SIZE)
      },
      { rootMargin: "600px 0px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [hasMore, filteredStones.length])

  return (
    <section id="catalog" className="mx-auto max-w-7xl px-6 pt-6 pb-16 md:pt-8 md:pb-20 scroll-mt-14">
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
        {lockedCategory ? <span /> : <SegmentedControl value={category} onChange={setCategory} />}
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
      />

      {filteredStones.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-lg text-muted-foreground">{L.noResults}</p>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleStones.map((stone) => (
              <StoneCard key={stone.id} item={stone} />
            ))}
          </div>
          {hasMore && <div ref={sentinelRef} aria-hidden className="h-12" />}
        </>
      )}
    </section>
  )
}
