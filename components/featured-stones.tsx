"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { StoneCard } from "@/components/stone-card"
import { useStones } from "@/lib/store/stones"
import { useTranslation } from "@/lib/i18n/context"
import { useFeaturedStore } from "@/lib/store/featured"
import type { Locale, StoneItem } from "@/lib/types"

const labels: Record<Locale, { heading: string; cta: string }> = {
  uk: { heading: "Що купують найчастіше", cta: "Весь каталог" },
  pl: { heading: "Najczęściej kupowane", cta: "Cały katalog" },
  en: { heading: "Most ordered this month", cta: "Full catalog" },
  de: { heading: "Am häufigsten bestellt", cta: "Ganzer Katalog" },
  lt: { heading: "Perkamiausi šį mėnesį", cta: "Visas katalogas" },
}

function pickFallback(stones: StoneItem[]): StoneItem[] {
  const byFeaturedFlag = stones.filter((s) => s.isFeatured)
  const rest = stones.filter((s) => !s.isFeatured)
  return [...byFeaturedFlag, ...rest].slice(0, 6)
}

function pickFromIds(ids: string[], stones: StoneItem[]): StoneItem[] {
  const selected = ids
    .map((id) => stones.find((s) => s.id === id))
    .filter((s): s is StoneItem => Boolean(s))
  if (selected.length >= 6) return selected.slice(0, 6)
  const pool = stones.filter((s) => !ids.includes(s.id))
  return [...selected, ...pool].slice(0, 6)
}

export function FeaturedStones() {
  const { locale } = useTranslation()
  const L = labels[locale]
  const ids = useFeaturedStore((state) => state.ids)
  const hasHydrated = useFeaturedStore((state) => state.hasHydrated)
  const hydrate = useFeaturedStore((state) => state.hydrate)
  const stones = useStones()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    hydrate()
  }, [hydrate])

  const featured = useMemo(() => {
    if (!mounted || !hasHydrated || ids.length === 0) return pickFallback(stones)
    return pickFromIds(ids, stones)
  }, [mounted, hasHydrated, ids, stones])

  return (
    <section id="featured" className="mx-auto max-w-7xl px-6 py-16 md:py-20 scroll-mt-14">
      <div className="mb-8 flex flex-col items-start gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-semibold tracking-tight-custom md:text-6xl text-balance">
            {L.heading}
          </h2>
        </div>
        <Link
          href="/catalog"
          prefetch
          className="group inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:-translate-y-[1px]"
        >
          {L.cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((stone) => (
          <StoneCard key={stone.id} item={stone} showBestseller />
        ))}
      </div>
    </section>
  )
}
