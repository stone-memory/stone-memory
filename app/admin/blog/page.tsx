"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { shouldBypassOptimizer } from "@/lib/image-source"
import { Pin, PinOff, Plus, Pencil, Trash2, RotateCcw, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBlogStore } from "@/lib/store/blog"
import { type Article, categoryTitles } from "@/lib/data/articles"
import { ArticleEditor } from "@/components/admin/article-editor"
import { cn } from "@/lib/utils"

const NEW_ARTICLE_TEMPLATE = (): Article => ({
  slug: `art-${Date.now().toString(36)}`,
  category: "stone",
  cover: "",
  readMinutes: 5,
  date: new Date().toISOString().slice(0, 10),
  title: { uk: "", en: "", pl: "", de: "", lt: "" },
  excerpt: { uk: "", en: "", pl: "", de: "", lt: "" },
  body: { uk: [], en: [], pl: [], de: [], lt: [] },
})

export default function AdminBlogPage() {
  const articles = useBlogStore((s) => s.articles)
  const heroMode = useBlogStore((s) => s.heroMode)
  const pinnedSlug = useBlogStore((s) => s.pinnedSlug)
  const hasHydrated = useBlogStore((s) => s.hasHydrated)
  const hydrate = useBlogStore((s) => s.hydrate)
  const setMode = useBlogStore((s) => s.setMode)
  const setPinned = useBlogStore((s) => s.setPinned)
  const upsertArticle = useBlogStore((s) => s.upsertArticle)
  const softDeleteArticle = useBlogStore((s) => s.softDeleteArticle)
  const restoreArticle = useBlogStore((s) => s.restoreArticle)
  const removeArticle = useBlogStore((s) => s.removeArticle)
  const seedArticles = useBlogStore((s) => s.seedArticles)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [showHidden, setShowHidden] = useState(false)
  const [seeding, setSeeding] = useState(false)

  const visible = showHidden ? articles : articles.filter((r) => !r.hidden)
  const sorted = [...visible].sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  )

  // Hero pinning info — only shows DB articles (matches public site).
  const currentPinned = hasHydrated ? pinnedSlug : null
  const dbVisibleSorted = articles
    .filter((r) => !r.hidden)
    .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime())
  const heroSubject =
    currentPinned
      ? articles.find((r) => r.slug === currentPinned)?.data.title.uk
      : dbVisibleSorted[0]?.data.title.uk

  const save = (slug: string, draft: Article) => {
    upsertArticle({ ...draft, slug })
    setEditingSlug(null)
  }

  const create = (draft: Article) => {
    if (!draft.slug.trim()) draft.slug = `art-${Date.now().toString(36)}`
    upsertArticle(draft)
    setCreating(false)
  }

  const handleSeed = async () => {
    setSeeding(true)
    try {
      const result = await seedArticles()
      alert(`Імпортовано: ${result.imported}, пропущено: ${result.skipped}`)
    } finally {
      setSeeding(false)
    }
  }

  const editingArticle = editingSlug
    ? articles.find((r) => r.slug === editingSlug)?.data
    : null

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight-custom">Блог</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Створюйте, редагуйте, ховайте та закріплюйте статті блогу. Зміни зберігаються у Supabase.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={showHidden}
              onChange={(e) => setShowHidden(e.target.checked)}
              className="h-4 w-4 accent-foreground"
            />
            Показати приховані
          </label>
          <Button onClick={() => setCreating(true)} className="rounded-xl gap-2">
            <Plus size={16} /> Нова стаття
          </Button>
        </div>
      </header>

      {!hasHydrated && (
        <div className="rounded-xl border border-foreground/10 bg-card p-4 text-sm text-muted-foreground">
          Завантаження…
        </div>
      )}

      {/* One-time seed import — only shown when DB is empty so admin can
          start from the curated default articles instead of a blank slate. */}
      {hasHydrated && articles.length === 0 && (
        <section className="rounded-2xl border border-accent/40 bg-accent/5 p-5">
          <h2 className="text-sm font-semibold">База статей порожня</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            На сайті зараз показуються 10 статей за замовчуванням. Імпортуйте їх до бази, щоб мати змогу редагувати, видаляти або додавати нові.
          </p>
          <Button
            onClick={handleSeed}
            disabled={seeding}
            className="mt-3 rounded-xl gap-2"
          >
            <Download size={16} /> {seeding ? "Імпортую…" : "Імпортувати 10 початкових статей"}
          </Button>
        </section>
      )}

      {/* Hero pinning — preserves the original UX. Disabled when DB is
          empty since pinning only makes sense for DB-backed articles. */}
      {hasHydrated && articles.length > 0 && (
        <section className="rounded-2xl border border-foreground/10 bg-card p-5">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Hero-секція блогу
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-1 rounded-full bg-foreground/5 p-1">
              <button
                onClick={() => {
                  setMode("latest")
                  setPinned(null)
                }}
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
              <Button
                variant="outline"
                onClick={() => setPinned(null)}
                className="rounded-xl gap-2"
              >
                <PinOff size={14} /> Відкріпити
              </Button>
            )}
            <div className="ml-auto text-xs text-muted-foreground">
              Зараз у hero:{" "}
              <span className="font-medium text-foreground">{heroSubject || "—"}</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Клікніть на будь-яку статтю в таблиці нижче, щоб закріпити її як hero (іконка кнопки), або натисніть «Найновіша» для автоматичного режиму.
          </p>
        </section>
      )}

      <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-foreground/5 bg-foreground/[0.02] text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Обкладинка</th>
              <th className="px-4 py-3 text-left">Стаття</th>
              <th className="px-4 py-3 text-left">Категорія</th>
              <th className="px-4 py-3 text-left">Дата</th>
              <th className="px-4 py-3 text-right">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/5">
            {sorted.map((row) => {
              const a = row.data
              const isPinned = currentPinned === row.slug
              return (
                <tr key={row.slug} className={cn(row.hidden && "opacity-50")}>
                  <td className="px-4 py-3">
                    <div className="relative h-10 w-14 overflow-hidden rounded-md bg-foreground/5">
                      {a.cover && (
                        <Image
                          src={a.cover}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                          unoptimized={shouldBypassOptimizer(a.cover)}
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{a.title.uk || row.slug}</div>
                      {isPinned && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                          <Pin size={10} /> Hero
                        </span>
                      )}
                    </div>
                    <div className="max-w-md truncate text-xs text-muted-foreground">
                      {a.excerpt.uk}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {categoryTitles[a.category]?.uk || a.category}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">
                    {new Date(a.date).toLocaleDateString("uk-UA")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      {row.hidden ? (
                        <button
                          onClick={() => restoreArticle(row.slug)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                        >
                          <RotateCcw size={14} /> Відновити
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setPinned(isPinned ? null : row.slug)}
                            className={cn(
                              "rounded-md p-1.5 hover:bg-foreground/5",
                              isPinned ? "text-accent" : "text-muted-foreground hover:text-foreground"
                            )}
                            title={isPinned ? "Відкріпити з hero" : "Закріпити в hero"}
                          >
                            <Pin size={14} />
                          </button>
                          <button
                            onClick={() => setEditingSlug(row.slug)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => softDeleteArticle(row.slug)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                            title="Приховати"
                          >
                            <Trash2 size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Видалити «${a.title.uk || row.slug}» назавжди?`)) {
                                removeArticle(row.slug)
                              }
                            }}
                            className="rounded-md p-1.5 text-destructive/80 hover:bg-destructive/10"
                            title="Видалити назавжди"
                          >
                            ✕
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {sorted.length === 0 && hasHydrated && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  Статей немає. Натисніть «Нова стаття» щоб створити першу.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingSlug && editingArticle && (
        <ArticleEditor
          article={editingArticle}
          title={`Редагувати: ${editingArticle.title.uk || editingSlug}`}
          onSave={(a) => save(editingSlug, a)}
          onCancel={() => setEditingSlug(null)}
        />
      )}
      {creating && (
        <ArticleEditor
          article={NEW_ARTICLE_TEMPLATE()}
          title="Нова стаття"
          onSave={(a) => create(a)}
          onCancel={() => setCreating(false)}
        />
      )}
    </div>
  )
}
