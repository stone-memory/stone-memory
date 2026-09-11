"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export const ADMIN_PAGE_SIZE = 30

/**
 * Посторінковий вивід уже відфільтрованого списку. Фільтр і пошук працюють по
 * всьому масиву (він і так у пам'яті), пагінація лише обмежує кількість
 * рядків у DOM: 150 рядків із фото робили вкладку помітно повільнішою.
 *
 * `resetKey` — рядок, зміна якого повертає на першу сторінку (пошук, фільтри).
 */
export function usePagination<T>(items: T[], resetKey: string, pageSize = ADMIN_PAGE_SIZE) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))

  useEffect(() => {
    setPage(1)
  }, [resetKey])

  // якщо після видалення записів сторінка стала порожньою — крок назад
  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  const safePage = Math.min(page, pageCount)
  const from = (safePage - 1) * pageSize
  const to = Math.min(from + pageSize, items.length)
  const pageItems = useMemo(() => items.slice(from, to), [items, from, to])

  return { page: safePage, setPage, pageCount, pageItems, from, to, total: items.length }
}

type Props = {
  page: number
  pageCount: number
  from: number
  to: number
  total: number
  onChange: (page: number) => void
  className?: string
}

/** Компактні номери сторінок: перша, остання, поточна ±2, «…» між ними. */
function pageNumbers(page: number, count: number): (number | "…")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1)
  const set = new Set<number>([1, count, page - 2, page - 1, page, page + 1, page + 2].filter((n) => n >= 1 && n <= count))
  const sorted = Array.from(set).sort((a, b) => a - b)
  const out: (number | "…")[] = []
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push("…")
    out.push(n)
  })
  return out
}

export function Pagination({ page, pageCount, from, to, total, onChange, className }: Props) {
  if (total === 0) return null
  return (
    <nav aria-label="Сторінки" className={cn("flex flex-wrap items-center justify-between gap-3 text-sm", className)}>
      <p className="text-xs text-muted-foreground tabular-nums">
        Показано {from + 1}–{to} з {total}
      </p>
      {pageCount > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onChange(page - 1)}
            disabled={page <= 1}
            aria-label="Попередня сторінка"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-foreground/5 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          </button>
          {pageNumbers(page, pageCount).map((n, i) =>
            n === "…" ? (
              <span key={`gap-${i}`} className="px-1 text-muted-foreground">
                …
              </span>
            ) : (
              <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                aria-current={n === page ? "page" : undefined}
                className={cn(
                  "h-8 min-w-8 rounded-lg px-2 text-sm tabular-nums transition-colors",
                  n === page ? "bg-foreground text-background" : "text-muted-foreground hover:bg-foreground/5"
                )}
              >
                {n}
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => onChange(page + 1)}
            disabled={page >= pageCount}
            aria-label="Наступна сторінка"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-foreground/5 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      )}
    </nav>
  )
}
