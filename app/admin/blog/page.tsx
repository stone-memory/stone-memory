"use client"

import { useEffect } from "react"
import Image from "next/image"
import { Pin, PinOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBlogStore, useArticles } from "@/lib/store/blog"
import { cn } from "@/lib/utils"

export default function AdminBlogPage() {
  const heroMode = useBlogStore((s) => s.heroMode)
  const pinnedSlug = useBlogStore((s) => s.pinnedSlug)
  const hasHydrated = useBlogStore((s) => s.hasHydrated)
  const hydrate = useBlogStore((s) => s.hydrate)
  const setMode = useBlogStore((s) => s.setMode)
  const setPinned = useBlogStore((s) => s.setPinned)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const articles = useArticles()
  const currentPinned = hasHydrated ? pinnedSlug : null

  const sorted = [...articles].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight-custom">Блог</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Керуйте тим, яка стаття показується у hero-секції блогу. За замовчуванням — найновіша (за датою). Можна закріпити будь-яку.
        </p>
      </header>

      <section className="rounded-2xl border border-foreground/10 bg-card p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-1 rounded-full bg-foreground/5 p-1">
            <button
              onClick={() => { setMode("latest"); setPinned(null) }}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                heroMode === "latest" && !currentPinned
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Найновіша (авто)
            </button>
            <button
              onClick={() => setMode("pinned")}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                heroMode === "pinned" && currentPinned
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Закріплена
            </button>
          </div>
          {currentPinned && (
            <Button variant="outline" onClick={() => setPinned(null)} className="rounded-xl gap-2">
              <PinOff size={14} /> Відкріпити
            </Button>
          )}
          <div className="ml-auto text-xs text-muted-foreground">
            Зараз у hero: <span className="font-medium text-foreground">
              {currentPinned ? articles.find((a) => a.slug === currentPinned)?.title.uk : sorted[0]?.title.uk}
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((a) => {
          const active = currentPinned === a.slug
          return (
            <button
              key={a.slug}
              onClick={() => setPinned(active ? null : a.slug)}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-2xl border bg-card text-left transition-all",
                active
                  ? "border-accent ring-2 ring-accent/40 shadow-hover"
                  : "border-foreground/10 hover:shadow-hover hover:-translate-y-0.5"
              )}
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-foreground/5">
                <Image
                  src={a.cover}
                  alt=""
                  fill
                  sizes="400px"
                  className="object-cover"
                  unoptimized
                />
                {active && (
                  <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-accent-foreground shadow-soft">
                    <Pin size={11} /> Закріплено
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {a.category} · {new Date(a.date).toLocaleDateString("uk-UA")}
                </div>
                <div className="mt-1.5 text-sm font-semibold leading-tight">{a.title.uk}</div>
                <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{a.excerpt.uk}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
