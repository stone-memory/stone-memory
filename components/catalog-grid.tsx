"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { StoneCard } from "@/components/stone-card"
import { SegmentedControl } from "@/components/segmented-control"
import { CatalogFilters, applyFilters, emptyFilters, type FiltersState } from "@/components/catalog-filters"
import { useSelectionStore } from "@/lib/store/selection"
import { useOrdersStore } from "@/lib/store/orders"
import { usePopularity } from "@/lib/store/popularity"
import { useTranslation } from "@/lib/i18n/context"
import { useStones } from "@/lib/store/stones"
import { filterLabels } from "@/lib/i18n/filters"
import type { Category } from "@/lib/types"

export function CatalogGrid() {
  const storedCategory = useSelectionStore((state) => state.category)
  const setCategory = useSelectionStore((state) => state.setCategory)
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const urlParamApplied = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Use a stable "memorial" on SSR to prevent hydration mismatch from persisted category
  const category: Category = mounted ? storedCategory : "memorial"

  // Apply ?cat= URL param only once on initial mount — subsequent button clicks
  // must not be overridden by the stale URL param still sitting in searchParams.
  useEffect(() => {
    if (!mounted || urlParamApplied.current) return
    const cat = searchParams.get("cat")
    if (cat === "memorial" || cat === "home") {
      setCategory(cat)
    }
    urlParamApplied.current = true
  }, [mounted, searchParams, setCategory])
  const { t, locale } = useTranslation()
  const L = filterLabels[locale]
  const stones = useStones()

  const baseItems = useMemo(() => stones.filter((s) => s.category === category), [category, stones])

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

  return (
    <section id="catalog" className="mx-auto max-w-7xl px-6 pt-6 pb-16 md:pt-8 md:pb-20 scroll-mt-14">
      <div className="mb-6 md:mb-8">
        <h2 className="text-4xl font-semibold tracking-tight-custom md:text-6xl text-balance">
          {t.catalog.heading}
        </h2>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance md:text-lg">
          {t.catalog.subheading}
        </p>
      </div>

      <div className="mb-5 flex items-center justify-between gap-3">
        <SegmentedControl value={category} onChange={setCategory} />
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
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStones.map((stone) => (
            <StoneCard key={stone.id} item={stone} />
          ))}
        </div>
      )}
    </section>
  )
}
