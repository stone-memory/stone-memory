"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Plus, Search, Trash2, RotateCcw, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useStonesAdminStore } from "@/lib/store/stones"
import { ImageUploader } from "@/components/admin/image-uploader"
import type { StoneItem, StoneColor, StoneShape, StoneFinish, StoneMaterial, Category } from "@/lib/types"
import { cn } from "@/lib/utils"

const COLORS: StoneColor[] = ["black", "grey", "white", "red", "green", "blue", "brown", "beige", "multi"]
const SHAPES: StoneShape[] = ["classic", "arch", "heart", "cross", "modern", "obelisk", "natural"]
const FINISHES: StoneFinish[] = ["polished", "honed", "flamed", "antique", "natural", "split"]
const MATERIALS: StoneMaterial[] = ["granite", "gabbro", "marble", "labradorite", "quartzite", "limestone", "sandstone", "onyx"]
const CATEGORIES: Category[] = ["memorial", "home"]

function nextId(existing: string[]): string {
  let n = 900000
  const set = new Set(existing)
  while (set.has(String(n))) n++
  return String(n)
}

export default function AdminStonesPage() {
  const items = useStonesAdminStore((s) => s.items)
  const hasHydrated = useStonesAdminStore((s) => s.hasHydrated)
  const hydrate = useStonesAdminStore((s) => s.hydrate)
  const upsert = useStonesAdminStore((s) => s.upsert)
  const softDelete = useStonesAdminStore((s) => s.softDelete)
  const restore = useStonesAdminStore((s) => s.restore)
  const remove = useStonesAdminStore((s) => s.remove)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const [query, setQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<"all" | Category>("all")
  const [showHidden, setShowHidden] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((r) => {
      if (!showHidden && r.hidden) return false
      if (categoryFilter !== "all" && r.data.category !== categoryFilter) return false
      if (q && !r.id.toLowerCase().includes(q)) return false
      return true
    })
  }, [items, query, categoryFilter, showHidden])

  const totals = {
    all: items.filter((r) => !r.hidden).length,
    memorial: items.filter((r) => r.data.category === "memorial" && !r.hidden).length,
    home: items.filter((r) => r.data.category === "home" && !r.hidden).length,
    hidden: items.filter((r) => r.hidden).length,
  }

  const saveEdit = (id: string, draft: StoneItem) => {
    upsert({ ...draft, id })
    setEditingId(null)
  }

  const createNew = (draft: StoneItem) => {
    upsert(draft)
    setCreating(false)
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight-custom">Товари</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            CRUD усіх позицій каталогу. Зміни зберігаються у Supabase і відображаються на сайті.
          </p>
        </div>
        <Button onClick={() => setCreating(true)} className="rounded-xl gap-2">
          <Plus size={16} /> Новий товар
        </Button>
      </header>

      {!hasHydrated && (
        <div className="rounded-xl border border-foreground/10 bg-card p-4 text-sm text-muted-foreground">
          Завантаження…
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Всього активних" value={totals.all} />
        <Stat label="Пам'ятники" value={totals.memorial} />
        <Stat label="Дім і сад" value={totals.home} />
        <Stat label="Прихованих" value={totals.hidden} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
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
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Пошук за номером…"
            className="pl-9"
          />
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={showHidden}
            onChange={(e) => setShowHidden(e.target.checked)}
            className="h-4 w-4 accent-foreground"
          />
          Показати приховані
        </label>
      </div>

      {creating && (
        <StoneEditor
          stone={{
            id: nextId(items.map((r) => r.id)),
            category: "memorial",
            imagePath: "/logo-512.png",
            priceFrom: 0,
          }}
          title="Новий товар"
          onSave={(s) => createNew(s)}
          onCancel={() => setCreating(false)}
        />
      )}

      <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-foreground/5 bg-foreground/[0.02] text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Фото</th>
              <th className="px-4 py-3 text-left">№</th>
              <th className="px-4 py-3 text-left">Категорія</th>
              <th className="px-4 py-3 text-left">Матеріал</th>
              <th className="px-4 py-3 text-left">Колір</th>
              <th className="px-4 py-3 text-left">Форма</th>
              <th className="px-4 py-3 text-right">Ціна від</th>
              <th className="px-4 py-3 text-center">Популярний</th>
              <th className="px-4 py-3 text-right">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/5">
            {filtered.map((row) => {
              const s = row.data
              return (
                <tr key={row.id} className={cn(row.hidden && "opacity-50")}>
                  <td className="px-4 py-3">
                    <div className="relative h-10 w-14 overflow-hidden rounded-md bg-foreground/5">
                      <Image src={s.imagePath} alt={`№ ${row.id}`} fill className="object-cover" sizes="56px" unoptimized />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium tabular-nums">№ {row.id}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.category === "memorial" ? "Пам'ятник" : "Дім і сад"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.materialType || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.color || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.shape || s.finish || "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums">€ {s.priceFrom}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => upsert({ ...s, isFeatured: !s.isFeatured })}
                      className={cn(
                        "inline-flex h-5 w-9 items-center rounded-full border transition-colors",
                        s.isFeatured ? "justify-end border-accent bg-accent" : "justify-start border-foreground/20 bg-foreground/5"
                      )}
                    >
                      <span className="block h-3.5 w-3.5 rounded-full bg-white shadow" />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      {row.hidden ? (
                        <button
                          onClick={() => restore(row.id)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                          title="Відновити"
                        >
                          <RotateCcw size={14} /> Відновити
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingId(row.id)}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                            title="Редагувати"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => softDelete(row.id)}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                            title="Приховати"
                          >
                            <Trash2 size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Видалити назавжди?")) remove(row.id)
                            }}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
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
            {filtered.length === 0 && hasHydrated && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  Нічого не знайдено
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingId && (
        <StoneEditor
          stone={items.find((r) => r.id === editingId)!.data}
          title={`Редагувати № ${editingId}`}
          onSave={(s) => saveEdit(editingId, s)}
          onCancel={() => setEditingId(null)}
        />
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  )
}

function StoneEditor({
  stone,
  title,
  onSave,
  onCancel,
}: {
  stone: StoneItem
  title: string
  onSave: (s: StoneItem) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState<StoneItem>(stone)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-card shadow-hover">
        <header className="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
          <Field label="ID">
            <Input value={draft.id} onChange={(e) => setDraft({ ...draft, id: e.target.value })} />
          </Field>
          <Field label="Категорія">
            <select
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value as Category })}
              className="h-10 w-full rounded-xl bg-foreground/5 px-3"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Зображення">
            <ImageUploader
              value={draft.imagePath}
              onChange={(url) => setDraft({ ...draft, imagePath: url })}
              folder="stones"
            />
          </Field>
          <Field label="Ціна від (€)">
            <Input
              type="number"
              value={draft.priceFrom}
              onChange={(e) => setDraft({ ...draft, priceFrom: Number(e.target.value) })}
            />
          </Field>
          <Field label="Матеріал">
            <select
              value={draft.materialType || ""}
              onChange={(e) => setDraft({ ...draft, materialType: (e.target.value || undefined) as StoneMaterial | undefined })}
              className="h-10 w-full rounded-xl bg-foreground/5 px-3"
            >
              <option value="">—</option>
              {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Колір">
            <select
              value={draft.color || ""}
              onChange={(e) => setDraft({ ...draft, color: (e.target.value || undefined) as StoneColor | undefined })}
              className="h-10 w-full rounded-xl bg-foreground/5 px-3"
            >
              <option value="">—</option>
              {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Форма">
            <select
              value={draft.shape || ""}
              onChange={(e) => setDraft({ ...draft, shape: (e.target.value || undefined) as StoneShape | undefined })}
              className="h-10 w-full rounded-xl bg-foreground/5 px-3"
            >
              <option value="">—</option>
              {SHAPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Обробка">
            <select
              value={draft.finish || ""}
              onChange={(e) => setDraft({ ...draft, finish: (e.target.value || undefined) as StoneFinish | undefined })}
              className="h-10 w-full rounded-xl bg-foreground/5 px-3"
            >
              <option value="">—</option>
              {FINISHES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>
          <Field label="Походження">
            <Input value={draft.origin || ""} onChange={(e) => setDraft({ ...draft, origin: e.target.value })} />
          </Field>
          <Field label="Розмір (напр. 100×50×10 см)">
            <Input value={draft.sizeCm || ""} onChange={(e) => setDraft({ ...draft, sizeCm: e.target.value })} />
          </Field>
          <Field label="Вага (кг)">
            <Input
              type="number"
              value={draft.weightKg ?? ""}
              onChange={(e) => setDraft({ ...draft, weightKg: e.target.value ? Number(e.target.value) : undefined })}
            />
          </Field>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(draft.isFeatured)}
              onChange={(e) => setDraft({ ...draft, isFeatured: e.target.checked })}
              className="h-4 w-4"
            />
            Бестселер
          </label>
        </div>
        <footer className="flex justify-end gap-2 border-t border-foreground/10 px-6 py-4">
          <Button variant="ghost" onClick={onCancel}>Скасувати</Button>
          <Button onClick={() => onSave(draft)}>Зберегти</Button>
        </footer>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}
