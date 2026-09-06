"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Номери сторінок із згортанням середини.
 *
 * До семи сторінок показуємо всі — на мобільному це рівно та кількість, що
 * вміщається в рядок. Далі лишаємо першу, останню й вікно навколо поточної,
 * інакше на дев'яти сторінках каталогу перемикач переносився б у два рядки.
 */
function pageList(current: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const out: Array<number | "…"> = [1]
  const from = Math.max(2, current - 1)
  const to = Math.min(total - 1, current + 1)
  if (from > 2) out.push("…")
  for (let i = from; i <= to; i++) out.push(i)
  if (to < total - 1) out.push("…")
  out.push(total)
  return out
}

type Props = {
  page: number
  pageCount: number
  onChange: (page: number) => void
  labels: { pagesLabel: string; page: string; prevPage: string; nextPage: string }
}

export function CatalogPager({ page, pageCount, onChange, labels }: Props) {
  if (pageCount <= 1) return null

  const step = (delta: number) => onChange(Math.min(pageCount, Math.max(1, page + delta)))

  return (
    <nav aria-label={labels.pagesLabel} className="mt-10 flex items-center justify-center gap-1.5">
      <Arrow
        dir="prev"
        label={labels.prevPage}
        disabled={page === 1}
        onClick={() => step(-1)}
      />

      {pageList(page, pageCount).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} aria-hidden className="px-1 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-label={`${labels.page} ${p}`}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "h-9 min-w-9 rounded-full px-3 text-sm tabular-nums transition-colors",
              p === page
                ? "bg-foreground font-medium text-background"
                : "text-foreground/70 hover:bg-foreground/[0.06] hover:text-foreground"
            )}
          >
            {p}
          </button>
        )
      )}

      <Arrow
        dir="next"
        label={labels.nextPage}
        disabled={page === pageCount}
        onClick={() => step(1)}
      />
    </nav>
  )
}

function Arrow({
  dir,
  label,
  disabled,
  onClick,
}: {
  dir: "prev" | "next"
  label: string
  disabled: boolean
  onClick: () => void
}) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "inline-flex h-9 items-center gap-1 rounded-full px-2.5 text-sm transition-colors",
        "text-foreground/70 hover:bg-foreground/[0.06] hover:text-foreground",
        "disabled:pointer-events-none disabled:opacity-35"
      )}
    >
      {dir === "prev" && <Icon className="h-4 w-4" strokeWidth={2} />}
      {/* Підпис ховаємо на вузьких екранах: там на нього немає місця поруч
          із номерами, а стрілка сама по собі зрозуміла. */}
      <span className="hidden sm:inline">{label}</span>
      {dir === "next" && <Icon className="h-4 w-4" strokeWidth={2} />}
    </button>
  )
}
