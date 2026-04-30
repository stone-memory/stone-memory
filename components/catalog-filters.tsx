"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, Search, X, SlidersHorizontal } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "@/lib/i18n/context"
import {
  filterLabels,
  shapeLabels,
  toneLabels,
  materialLabels,
} from "@/lib/i18n/filters"
import {
  toneFromColor,
  type Category,
  type StoneShape,
  type StoneTone,
  type StoneMaterial,
  type StoneItem,
} from "@/lib/types"
import { cn, toggleArr } from "@/lib/utils"
import { useDismissable } from "@/hooks/use-dismissable"

export type SortKey = "featured" | "popular" | "priceAsc" | "priceDesc"

export type FiltersState = {
  q: string
  tones: StoneTone[]
  materials: StoneMaterial[]
  shapes: StoneShape[]
  sort: SortKey
}

export const emptyFilters: FiltersState = {
  q: "",
  tones: [],
  materials: [],
  shapes: [],
  sort: "featured",
}

type Props = {
  category: Category
  items: StoneItem[]
  value: FiltersState
  onChange: (v: FiltersState) => void
  totalCount: number
}

function Popover({
  label,
  count,
  children,
}: {
  label: string
  count: number
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useDismissable(ref, open, () => setOpen(false))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all",
          count > 0
            ? "border-foreground bg-foreground text-background"
            : "border-foreground/15 bg-background text-foreground hover:bg-foreground/5"
        )}
      >
        {label}
        {count > 0 && (
          <span className="rounded-full bg-background/25 px-1.5 text-[11px]">{count}</span>
        )}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} strokeWidth={2.25} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 top-full z-40 mt-2 w-72 max-w-[calc(100vw-2rem)] origin-top rounded-2xl border border-foreground/10 bg-card p-3 shadow-hover"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Check({
  label,
  count,
  checked,
  onChange,
}: {
  label: string
  count?: number
  checked: boolean
  onChange: () => void
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        "flex w-full items-center justify-between rounded-xl px-3 py-2 text-[14px] transition-colors",
        checked ? "bg-foreground/5 font-medium" : "hover:bg-foreground/5"
      )}
    >
      <span className="flex items-center gap-2">
        <span>{label}</span>
        {typeof count === "number" && (
          <span className="text-[11px] text-muted-foreground tabular-nums">{count}</span>
        )}
      </span>
      <span
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded-[4px] border transition-colors",
          checked ? "border-foreground bg-foreground" : "border-foreground/25"
        )}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="h-3 w-3 text-background" fill="none">
            <path d="M2.5 6.5l2.5 2.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  )
}

export function CatalogFilters({ category, items, value, onChange, totalCount }: Props) {
  const { locale } = useTranslation()
  const L = filterLabels[locale]

  const toneCounts = useMemo(() => {
    const map = new Map<StoneTone, number>()
    for (const s of items) {
      const t = toneFromColor(s.color)
      if (t) map.set(t, (map.get(t) || 0) + 1)
    }
    return map
  }, [items])

  const materialCounts = useMemo(() => {
    const map = new Map<StoneMaterial, number>()
    for (const s of items) if (s.materialType) map.set(s.materialType, (map.get(s.materialType) || 0) + 1)
    return map
  }, [items])

  const shapeCounts = useMemo(() => {
    const map = new Map<StoneShape, number>()
    for (const s of items) if (s.shape) map.set(s.shape, (map.get(s.shape) || 0) + 1)
    return map
  }, [items])

  const availableTones = useMemo(
    () =>
      Array.from(toneCounts.keys()).sort(
        (a, b) => (toneCounts.get(b) || 0) - (toneCounts.get(a) || 0)
      ),
    [toneCounts]
  )
  const availableMaterials = useMemo(
    () =>
      Array.from(materialCounts.keys()).sort(
        (a, b) => (materialCounts.get(b) || 0) - (materialCounts.get(a) || 0)
      ),
    [materialCounts]
  )
  const availableShapes = useMemo(
    () =>
      Array.from(shapeCounts.keys()).sort(
        (a, b) => (shapeCounts.get(b) || 0) - (shapeCounts.get(a) || 0)
      ),
    [shapeCounts]
  )

  const activeCount =
    (value.q ? 1 : 0) +
    value.tones.length +
    value.materials.length +
    value.shapes.length

  const clearAll = () => onChange({ ...emptyFilters, sort: value.sort })

  return (
    <div className="sticky top-14 z-30 -mx-6 border-b border-foreground/5 bg-background px-6 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[160px] md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
          <input
            type="search"
            value={value.q}
            onChange={(e) => onChange({ ...value, q: e.target.value })}
            placeholder={L.searchPlaceholder}
            className="h-9 w-full rounded-full border border-foreground/10 bg-card pl-9 pr-9 text-[14px] outline-none transition-colors focus:border-foreground/30 focus:ring-2 focus:ring-foreground/5"
          />
          {value.q && (
            <button
              type="button"
              onClick={() => onChange({ ...value, q: "" })}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
              aria-label={L.clear}
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Desktop popovers (≥lg) — plenty of room */}
        <div className="hidden lg:flex flex-wrap items-center gap-2">
          {availableTones.length > 0 && (
            <Popover label={L.tone} count={value.tones.length}>
              <div className="max-h-64 overflow-auto">
                {availableTones.map((t) => (
                  <Check
                    key={t}
                    label={toneLabels[t][locale]}
                    count={toneCounts.get(t)}
                    checked={value.tones.includes(t)}
                    onChange={() => onChange({ ...value, tones: toggleArr(value.tones, t) })}
                  />
                ))}
              </div>
            </Popover>
          )}

          {availableMaterials.length > 0 && (
            <Popover label={L.material} count={value.materials.length}>
              <div className="max-h-64 overflow-auto">
                {availableMaterials.map((m) => (
                  <Check
                    key={m}
                    label={materialLabels[m][locale]}
                    count={materialCounts.get(m)}
                    checked={value.materials.includes(m)}
                    onChange={() => onChange({ ...value, materials: toggleArr(value.materials, m) })}
                  />
                ))}
              </div>
            </Popover>
          )}

          {category === "memorial" && availableShapes.length > 0 && (
            <Popover label={L.shape} count={value.shapes.length}>
              <div className="max-h-64 overflow-auto">
                {availableShapes.map((s) => (
                  <Check
                    key={s}
                    label={shapeLabels[s][locale]}
                    count={shapeCounts.get(s)}
                    checked={value.shapes.includes(s)}
                    onChange={() => onChange({ ...value, shapes: toggleArr(value.shapes, s) })}
                  />
                ))}
              </div>
            </Popover>
          )}
        </div>

        {/* Mobile/tablet drawer trigger (<lg) — covers mobile and tablet */}
        <MobileDrawer
          activeCount={activeCount}
          category={category}
          value={value}
          onChange={onChange}
          availableTones={availableTones}
          availableMaterials={availableMaterials}
          availableShapes={availableShapes}
          toneCounts={toneCounts}
          materialCounts={materialCounts}
          shapeCounts={shapeCounts}
        />

        <SortMenu value={value.sort} onChange={(s) => onChange({ ...value, sort: s })} />

        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="hidden lg:inline-flex shrink-0 text-[13px] font-medium text-muted-foreground hover:text-foreground"
          >
            {L.clear}
          </button>
        )}
      </div>

      {activeCount > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {value.tones.map((t) => (
            <Chip key={`t-${t}`} label={toneLabels[t][locale]} onRemove={() => onChange({ ...value, tones: value.tones.filter((x) => x !== t) })} />
          ))}
          {value.materials.map((m) => (
            <Chip key={`m-${m}`} label={materialLabels[m][locale]} onRemove={() => onChange({ ...value, materials: value.materials.filter((x) => x !== m) })} />
          ))}
          {value.shapes.map((s) => (
            <Chip key={`s-${s}`} label={shapeLabels[s][locale]} onRemove={() => onChange({ ...value, shapes: value.shapes.filter((x) => x !== s) })} />
          ))}
          <span className="ml-auto text-xs text-muted-foreground tabular-nums">{totalCount}</span>
        </div>
      )}
    </div>
  )
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-foreground/5 px-2.5 py-1 text-[12px] font-medium text-foreground/85">
      {label}
      <button onClick={onRemove} aria-label="Remove" className="-mr-0.5 rounded-full p-0.5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground">
        <X className="h-3 w-3" strokeWidth={2.5} />
      </button>
    </span>
  )
}

function SortMenu({ value, onChange }: { value: SortKey; onChange: (s: SortKey) => void }) {
  const { locale } = useTranslation()
  const L = filterLabels[locale]
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useDismissable(ref, open, () => setOpen(false))

  const items: [SortKey, string][] = [
    ["featured", L.sort.featured],
    ["popular", L.sort.popular],
    ["priceAsc", L.sort.priceAsc],
    ["priceDesc", L.sort.priceDesc],
  ]

  return (
    <div ref={ref} className="relative shrink-0 lg:ml-auto">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-background px-3.5 py-1.5 text-[13px] font-medium text-foreground hover:bg-foreground/5"
      >
        {L.sortBy}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} strokeWidth={2.25} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full z-40 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-2xl border border-foreground/10 bg-card p-1.5 shadow-hover"
          >
            {items.map(([k, l]) => (
              <button
                key={k}
                onClick={() => {
                  onChange(k)
                  setOpen(false)
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 text-[14px] transition-colors",
                  value === k ? "bg-foreground text-background" : "hover:bg-foreground/5"
                )}
              >
                {l}
                {value === k && <span className="text-xs opacity-90">✓</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MobileDrawer(props: {
  activeCount: number
  category: Category
  value: FiltersState
  onChange: (v: FiltersState) => void
  availableTones: StoneTone[]
  availableMaterials: StoneMaterial[]
  availableShapes: StoneShape[]
  toneCounts: Map<StoneTone, number>
  materialCounts: Map<StoneMaterial, number>
  shapeCounts: Map<StoneShape, number>
}) {
  const { locale } = useTranslation()
  const L = filterLabels[locale]
  const [open, setOpen] = useState(false)
  const { value, onChange, activeCount } = props

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "lg:hidden inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
          activeCount > 0
            ? "border-foreground bg-foreground text-background"
            : "border-foreground/15 bg-background text-foreground"
        )}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2} />
        {L.showFilters}
        {activeCount > 0 && (
          <span className="rounded-full bg-background/25 px-1.5 text-[11px]">{activeCount}</span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 36 }}
              className="fixed inset-x-0 bottom-0 z-[100] flex max-h-[85vh] flex-col rounded-t-3xl bg-card"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
              <div className="px-6 pt-4 pb-2">
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-foreground/20" />
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold tracking-tight-custom">{L.heading}</h3>
                  <button onClick={() => setOpen(false)} aria-label={L.close} className="rounded-full p-2 hover:bg-foreground/5">
                    <X className="h-5 w-5" strokeWidth={1.75} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-4">
                <div className="space-y-6">
                  {props.availableTones.length > 0 && (
                    <Section label={L.tone}>
                      <div className="flex flex-wrap gap-2">
                        {props.availableTones.map((t) => (
                          <PillToggle
                            key={t}
                            label={toneLabels[t][locale]}
                            count={props.toneCounts.get(t)}
                            active={value.tones.includes(t)}
                            onClick={() => onChange({ ...value, tones: toggleArr(value.tones, t) })}
                          />
                        ))}
                      </div>
                    </Section>
                  )}

                  {props.availableMaterials.length > 0 && (
                    <Section label={L.material}>
                      <div className="flex flex-wrap gap-2">
                        {props.availableMaterials.map((m) => (
                          <PillToggle
                            key={m}
                            label={materialLabels[m][locale]}
                            count={props.materialCounts.get(m)}
                            active={value.materials.includes(m)}
                            onClick={() => onChange({ ...value, materials: toggleArr(value.materials, m) })}
                          />
                        ))}
                      </div>
                    </Section>
                  )}

                  {props.category === "memorial" && props.availableShapes.length > 0 && (
                    <Section label={L.shape}>
                      <div className="flex flex-wrap gap-2">
                        {props.availableShapes.map((s) => (
                          <PillToggle
                            key={s}
                            label={shapeLabels[s][locale]}
                            count={props.shapeCounts.get(s)}
                            active={value.shapes.includes(s)}
                            onClick={() => onChange({ ...value, shapes: toggleArr(value.shapes, s) })}
                          />
                        ))}
                      </div>
                    </Section>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3 border-t border-foreground/5 bg-card px-6 py-4">
                <button
                  onClick={() => onChange({ ...value, tones: [], materials: [], shapes: [], q: "" })}
                  className="flex-1 rounded-full border border-foreground/15 px-5 py-3 text-sm font-medium text-foreground"
                >
                  {L.clear}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"
                >
                  {L.showResults}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  )
}

function PillToggle({ label, count, active, onClick }: { label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[14px] font-medium transition-colors",
        active ? "border-foreground bg-foreground text-background" : "border-foreground/15 bg-background text-foreground hover:bg-foreground/5"
      )}
    >
      {label}
      {typeof count === "number" && (
        <span className={cn("text-[11px] tabular-nums", active ? "text-background/65" : "text-muted-foreground")}>
          {count}
        </span>
      )}
    </button>
  )
}

export function applyFilters(
  items: StoneItem[],
  f: FiltersState,
  popularity?: Map<string, number>
): StoneItem[] {
  let out = items.slice()
  const q = f.q.trim().toLowerCase()
  if (q) {
    out = out.filter((s) => s.id.toLowerCase().includes(q))
  }
  if (f.tones.length) {
    out = out.filter((s) => {
      const t = toneFromColor(s.color)
      return t ? f.tones.includes(t) : false
    })
  }
  if (f.materials.length) {
    out = out.filter((s) => s.materialType && f.materials.includes(s.materialType))
  }
  if (f.shapes.length) out = out.filter((s) => s.shape && f.shapes.includes(s.shape))

  switch (f.sort) {
    case "priceAsc":
      out.sort((a, b) => a.priceFrom - b.priceFrom)
      break
    case "priceDesc":
      out.sort((a, b) => b.priceFrom - a.priceFrom)
      break
    case "popular":
      out.sort(
        (a, b) =>
          (popularity?.get(b.id) ?? 0) - (popularity?.get(a.id) ?? 0) ||
          (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
      )
      break
    case "featured":
    default:
      out.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
  }
  return out
}
