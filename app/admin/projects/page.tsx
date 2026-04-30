"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Plus, Trash2, RotateCcw, Pencil, Eye, EyeOff, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  categoryLabels,
  type Project,
  type ProjectCategory,
} from "@/lib/data/projects"
import { useProjectsAdminStore } from "@/lib/store/projects"
import { MultilingualField } from "@/components/admin/multilingual-field"
import { ImageUploader } from "@/components/admin/image-uploader"
import { cn } from "@/lib/utils"

const CATEGORIES: ProjectCategory[] = [
  "monument",
  "countertop",
  "window-sill",
  "stairs",
  "fireplace",
  "paving",
  "facade",
  "interior",
]

export default function AdminProjectsPage() {
  const items = useProjectsAdminStore((s) => s.items)
  const hidden = useProjectsAdminStore((s) => s.hiddenCategories)
  const hasHydrated = useProjectsAdminStore((s) => s.hasHydrated)
  const hydrate = useProjectsAdminStore((s) => s.hydrate)
  const upsert = useProjectsAdminStore((s) => s.upsert)
  const softDelete = useProjectsAdminStore((s) => s.softDelete)
  const restore = useProjectsAdminStore((s) => s.restore)
  const remove = useProjectsAdminStore((s) => s.remove)
  const toggleCategory = useProjectsAdminStore((s) => s.toggleCategory)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [showHidden, setShowHidden] = useState(false)

  const filtered = showHidden ? items : items.filter((r) => !r.hidden)

  const save = (slug: string, draft: Project) => {
    upsert({ ...draft, slug })
    setEditingSlug(null)
  }

  const create = (draft: Project) => {
    if (!draft.slug) draft.slug = `p-${Date.now().toString(36)}`
    upsert(draft)
    setCreating(false)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight-custom">Портфоліо</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Керуйте проектами і розділами портфоліо. Як Lego — вмикайте/вимикайте розділи, додавайте/редагуйте/ховайте проекти.
          </p>
        </div>
        <Button onClick={() => setCreating(true)} className="rounded-xl gap-2">
          <Plus size={16} /> Новий проект
        </Button>
      </header>

      <section className="rounded-2xl border border-foreground/10 bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Розділи на сайті
          </h2>
          <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={showHidden}
              onChange={(e) => setShowHidden(e.target.checked)}
              className="h-4 w-4 accent-foreground"
            />
            Показати приховані проекти
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const isHidden = hidden.includes(c)
            return (
              <button
                key={c}
                onClick={() => toggleCategory(c)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  isHidden
                    ? "bg-foreground/5 text-muted-foreground"
                    : "bg-foreground text-background"
                )}
              >
                {isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
                {categoryLabels[c].uk}
              </button>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Клікніть на розділ щоб приховати його з /projects. Приховані розділи не видно користувачам сайту.
        </p>
      </section>

      <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-foreground/5 bg-foreground/[0.02] text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Фото</th>
              <th className="px-4 py-3 text-left">Проект</th>
              <th className="px-4 py-3 text-left">Розділ</th>
              <th className="px-4 py-3 text-left">Місто</th>
              <th className="px-4 py-3 text-left">Рік</th>
              <th className="px-4 py-3 text-right">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/5">
            {filtered.map((row) => {
              const p = row.data
              return (
                <tr key={row.slug} className={cn(row.hidden && "opacity-50")}>
                  <td className="px-4 py-3">
                    <div className="relative h-10 w-14 overflow-hidden rounded-md bg-foreground/5">
                      <Image src={p.cover} alt="" fill className="object-cover" sizes="56px" unoptimized />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.title.uk}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-sm">{p.description.uk}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{categoryLabels[p.category].uk}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.city}</td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">{p.year}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      {row.hidden ? (
                        <button onClick={() => restore(row.slug)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-foreground/5 hover:text-foreground">
                          <RotateCcw size={14} /> Відновити
                        </button>
                      ) : (
                        <>
                          <button onClick={() => setEditingSlug(row.slug)} className="rounded-md p-1.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground">
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => softDelete(row.slug)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                            title="Приховати"
                          >
                            <Trash2 size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Видалити назавжди?")) remove(row.slug)
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
            {filtered.length === 0 && hasHydrated && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  Проектів немає
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingSlug && (
        <ProjectEditor
          project={items.find((r) => r.slug === editingSlug)!.data}
          title={`Редагувати: ${items.find((r) => r.slug === editingSlug)?.data.title.uk}`}
          onSave={(p) => save(editingSlug, p)}
          onCancel={() => setEditingSlug(null)}
        />
      )}
      {creating && (
        <ProjectEditor
          project={{
            slug: `p-${Date.now().toString(36)}`,
            category: "monument",
            cover: "/stones/memorial-01.svg",
            year: new Date().getFullYear(),
            city: "",
            title: { uk: "", en: "", pl: "", de: "", lt: "" },
            description: { uk: "", en: "", pl: "", de: "", lt: "" },
            materials: { uk: "", en: "", pl: "", de: "", lt: "" },
          }}
          title="Новий проект"
          onSave={(p) => create(p)}
          onCancel={() => setCreating(false)}
        />
      )}
    </div>
  )
}

function ProjectEditor({
  project,
  title,
  onSave,
  onCancel,
}: {
  project: Project
  title: string
  onSave: (p: Project) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState<Project>({ ...project })
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-foreground/10 bg-card p-6 shadow-hover">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight-custom">{title}</h2>
          <button onClick={onCancel} className="rounded-full p-2 hover:bg-foreground/5">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Slug (URL)">
            <Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value.trim() })} />
          </Field>
          <Field label="Розділ">
            <select
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value as ProjectCategory })}
              className="h-10 w-full rounded-xl border border-foreground/10 bg-background px-3 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{categoryLabels[c].uk}</option>
              ))}
            </select>
          </Field>
          <Field label="Місто">
            <Input value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
          </Field>
          <Field label="Рік">
            <Input type="number" value={draft.year} onChange={(e) => setDraft({ ...draft, year: Number(e.target.value) || new Date().getFullYear() })} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Фото проекту">
              <ImageUploader
                value={draft.cover}
                onChange={(url) => setDraft({ ...draft, cover: url })}
                folder="projects"
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <MultilingualField
              label="Назва проекту"
              value={draft.title}
              onChange={(v) => setDraft({ ...draft, title: v })}
            />
          </div>
          <div className="md:col-span-2">
            <MultilingualField
              label="Опис"
              value={draft.description}
              onChange={(v) => setDraft({ ...draft, description: v })}
              multiline
              rows={3}
            />
          </div>
          <div className="md:col-span-2">
            <MultilingualField
              label="Матеріали"
              value={draft.materials}
              onChange={(v) => setDraft({ ...draft, materials: v })}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} className="rounded-xl">Скасувати</Button>
          <Button onClick={() => onSave(draft)} className="rounded-xl gap-2">
            <Check size={16} /> Зберегти
          </Button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
