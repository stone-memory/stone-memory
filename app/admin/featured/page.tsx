"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Check, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useStones } from "@/lib/store/stones"
import { useFeaturedStore } from "@/lib/store/featured"
import { cn } from "@/lib/utils"

const MAX = 6

export default function AdminFeaturedPage() {
  const { ids, toggle, clear, setIds, hydrate } = useFeaturedStore()
  const stones = useStones()

  useEffect(() => {
    hydrate()
  }, [hydrate])
  const [query, setQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<"all" | "memorial" | "home">("all")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return stones.filter((s) => {
      if (categoryFilter !== "all" && s.category !== categoryFilter) return false
      if (!q) return true
      return s.id.toLowerCase().includes(q)
    })
  }, [query, categoryFilter, stones])

  const selectedStones = ids
    .map((id) => stones.find((s) => s.id === id))
    .filter((s): s is (typeof stones)[number] => Boolean(s))

  const moveUp = (id: string) => {
    const idx = ids.indexOf(id)
    if (idx <= 0) return
    const next = [...ids]
    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    setIds(next)
  }
  const moveDown = (id: string) => {
    const idx = ids.indexOf(id)
    if (idx < 0 || idx >= ids.length - 1) return
    const next = [...ids]
    ;[next[idx + 1], next[idx]] = [next[idx], next[idx + 1]]
    setIds(next)
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight-custom">Популярне</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Виберіть до {MAX} позицій для блоку на головній. Зміни зберігаються автоматично.
          </p>
        </div>
        {ids.length > 0 && (
          <Button variant="outline" size="sm" onClick={clear}>
            Очистити все
          </Button>
        )}
      </header>

      {/* Selected items */}
      <section className="rounded-2xl border border-foreground/10 bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Обрано ({ids.length}/{MAX})
          </h2>
          <span className="text-xs text-muted-foreground">
            Порядок визначає порядок на головній
          </span>
        </div>
        {selectedStones.length === 0 ? (
          <div className="rounded-xl border border-dashed border-foreground/15 p-8 text-center text-sm text-muted-foreground">
            Ще нічого не обрано. Клікніть позицію знизу, щоб додати.
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {selectedStones.map((stone, i) => (
              <li
                key={stone.id}
                className="flex items-center gap-3 rounded-xl border border-foreground/10 bg-background p-3"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-foreground/5">
                  <Image src={stone.imagePath} alt={`№ ${stone.id}`} fill className="object-cover" sizes="56px" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium tabular-nums">№ {stone.id}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    #{i + 1} · {stone.category === "memorial" ? "Пам'ятник" : "Для дому"}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveUp(stone.id)}
                    disabled={i === 0}
                    className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                    aria-label="Up"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveDown(stone.id)}
                    disabled={i === selectedStones.length - 1}
                    className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                    aria-label="Down"
                  >
                    ▼
                  </button>
                </div>
                <button
                  onClick={() => toggle(stone.id)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                  aria-label="Remove"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Catalog picker */}
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 rounded-full bg-foreground/5 p-1">
            {(["all", "memorial", "home"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  categoryFilter === c
                    ? "bg-card text-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {c === "all" ? "Всі" : c === "memorial" ? "Пам'ятники" : "Дім і сад"}
              </button>
            ))}
          </div>
          <div className="relative max-w-sm sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Пошук за номером…"
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((stone) => {
            const selected = ids.includes(stone.id)
            const disabled = !selected && ids.length >= MAX
            return (
              <button
                key={stone.id}
                type="button"
                disabled={disabled}
                onClick={() => toggle(stone.id)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border text-left transition-all",
                  selected
                    ? "border-accent ring-2 ring-accent/40 shadow-hover"
                    : "border-foreground/10 bg-card hover:shadow-hover hover:-translate-y-0.5",
                  disabled && "opacity-40 cursor-not-allowed"
                )}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-foreground/5">
                  <Image
                    src={stone.imagePath}
                    alt={`№ ${stone.id}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  {selected && (
                    <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-soft">
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="truncate text-sm font-medium tabular-nums">№ {stone.id}</div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">
                    {stone.category === "memorial" ? "Пам'ятник" : "Для дому й саду"}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-foreground/15 p-12 text-center text-sm text-muted-foreground">
            Нічого не знайдено
          </div>
        )}
      </section>
    </div>
  )
}
