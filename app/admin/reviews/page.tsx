"use client"

import { useEffect, useMemo, useState } from "react"
import { Star, Plus, Trash2, Home, List, EyeOff, RefreshCw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useReviewsStore, type ReviewPlacement, type Review } from "@/lib/store/reviews"
import { cn } from "@/lib/utils"

const placementLabel: Record<ReviewPlacement, string> = {
  home: "Головна",
  all: "Всі відгуки",
  hidden: "Приховано",
}

const placementIcon: Record<ReviewPlacement, React.ComponentType<{ size?: number; className?: string }>> = {
  home: Home,
  all: List,
  hidden: EyeOff,
}

export default function AdminReviewsPage() {
  const items = useReviewsStore((s) => s.items)
  const hasHydrated = useReviewsStore((s) => s.hasHydrated)
  const hydrate = useReviewsStore((s) => s.hydrate)
  const add = useReviewsStore((s) => s.add)
  const update = useReviewsStore((s) => s.update)
  const remove = useReviewsStore((s) => s.remove)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const reviews = useMemo(() => items.map((r) => r.data), [items])

  const [filter, setFilter] = useState<"all" | ReviewPlacement>("all")
  const [syncing, setSyncing] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [draft, setDraft] = useState<Partial<Review>>({ name: "", text: "", rating: 5 })

  const filtered = useMemo(() => {
    if (filter === "all") return reviews
    return reviews.filter((r) => r.placement === filter)
  }, [reviews, filter])

  const counts = useMemo(() => {
    const c = { home: 0, all: 0, hidden: 0 }
    for (const r of reviews) c[r.placement]++
    return c
  }, [reviews])

  const syncGoogle = async () => {
    setSyncing(true)
    try {
      const r = await fetch("/api/reviews", { cache: "no-store" })
      if (!r.ok) return
      const data = (await r.json()) as { reviews?: Array<{ name: string; text: string; rating: number; date?: string }> }
      if (!data.reviews?.length) return
      const existing = new Set(reviews.map((r) => `${r.name}::${r.text.slice(0, 40)}`))
      for (const g of data.reviews) {
        const key = `${g.name}::${g.text.slice(0, 40)}`
        if (existing.has(key)) continue
        add({
          name: g.name,
          text: g.text,
          rating: g.rating || 5,
          date: g.date || new Date().toLocaleDateString("uk-UA"),
          source: "google",
          placement: "all",
        })
      }
    } finally {
      setSyncing(false)
    }
  }

  const submitAdd = () => {
    if (!draft.name || !draft.text) return
    add({
      name: draft.name,
      text: draft.text,
      rating: draft.rating || 5,
      date: new Date().toLocaleDateString("uk-UA"),
      source: "manual",
      placement: "all",
    })
    setDraft({ name: "", text: "", rating: 5 })
    setShowAdd(false)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight-custom">Відгуки</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Відгуки з Google підтягуються автоматично (через /api/reviews). Ви обираєте які показувати на головній, які на /reviews, а які приховати.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={syncGoogle} disabled={syncing} className="rounded-xl gap-2">
            <RefreshCw size={16} className={cn(syncing && "animate-spin")} />
            {syncing ? "Синхронізую…" : "Синхронізувати з Google"}
          </Button>
          <Button onClick={() => setShowAdd(true)} className="rounded-xl gap-2">
            <Plus size={16} /> Додати вручну
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Stat label="На головній" value={counts.home} cap={6} />
        <Stat label="У каталозі відгуків" value={counts.all} />
        <Stat label="Приховано" value={counts.hidden} />
        <Stat label="Всього" value={reviews.length} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-full bg-foreground/5 p-1">
          {(["all", "home", "hidden"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                filter === f
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f === "all" ? "Всі" : placementLabel[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-foreground/15 p-12 text-center text-sm text-muted-foreground">
            Відгуків немає
          </div>
        ) : (
          filtered.map((r) => <ReviewCard key={r.id} r={r} onPlacement={(p) => update(r.id, { placement: p })} onRemove={() => remove(r.id)} onOrderChange={(o) => update(r.id, { order: o })} />)
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-foreground/10 bg-card p-6 shadow-hover">
            <h2 className="text-lg font-semibold">Додати відгук</h2>
            <div className="mt-4 space-y-3">
              <Input
                placeholder="Ім'я клієнта"
                value={draft.name || ""}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
              <textarea
                placeholder="Текст відгуку"
                rows={4}
                value={draft.text || ""}
                onChange={(e) => setDraft({ ...draft, text: e.target.value })}
                className="w-full rounded-xl border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Рейтинг:</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setDraft({ ...draft, rating: n })}
                    className="text-xl"
                  >
                    <Star className={cn("h-5 w-5", (draft.rating || 0) >= n ? "fill-[#F59E0B] text-[#F59E0B]" : "text-muted-foreground/40")} />
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAdd(false)} className="rounded-xl">Скасувати</Button>
              <Button onClick={submitAdd} className="rounded-xl gap-2"><Check size={14} /> Додати</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, cap }: { label: string; value: number; cap?: number }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        {cap && <span className="text-xs text-muted-foreground">/ {cap}</span>}
      </div>
    </div>
  )
}

function ReviewCard({
  r,
  onPlacement,
  onRemove,
  onOrderChange,
}: {
  r: Review
  onPlacement: (p: ReviewPlacement) => void
  onRemove: () => void
  onOrderChange: (o: number) => void
}) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">{r.name}</span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={i < r.rating ? "h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" : "h-3.5 w-3.5 text-muted-foreground/30"}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{r.date}</span>
            <span className={cn("text-[10px] uppercase tracking-wide rounded px-1.5 py-0.5", r.source === "google" ? "bg-blue-500/10 text-blue-600" : "bg-foreground/5 text-muted-foreground")}>
              {r.source}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">{r.text}</p>
        </div>
        <button onClick={onRemove} className="rounded-md p-1.5 text-destructive/70 hover:bg-destructive/10">
          <Trash2 size={14} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {(["home", "all", "hidden"] as ReviewPlacement[]).map((p) => {
          const Icon = placementIcon[p]
          return (
            <button
              key={p}
              onClick={() => onPlacement(p)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                r.placement === p
                  ? p === "home"
                    ? "bg-accent text-accent-foreground"
                    : p === "hidden"
                    ? "bg-foreground/10 text-foreground/70"
                    : "bg-foreground text-background"
                  : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10"
              )}
            >
              <Icon size={12} /> {placementLabel[p]}
            </button>
          )
        })}
        {r.placement === "home" && (
          <div className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <span>Порядок:</span>
            <input
              type="number"
              min={1}
              max={5}
              value={r.order ?? 99}
              onChange={(e) => onOrderChange(Number(e.target.value) || 99)}
              className="w-14 rounded border border-foreground/10 bg-background px-2 py-0.5 text-xs tabular-nums"
            />
          </div>
        )}
      </div>
    </div>
  )
}
