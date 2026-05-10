"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Pencil, Check, X, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { type Service } from "@/lib/data/services"
import { useServicesAdminStore } from "@/lib/store/services"
import { MultilingualField } from "@/components/admin/multilingual-field"
import { cn } from "@/lib/utils"

const ICONS: Service["icon"][] = [
  "drafting",
  "chisel",
  "truck",
  "sparkles",
  "shield",
  "landscape",
  "engrave",
  "palette",
]

export default function AdminServicesPage() {
  const items = useServicesAdminStore((s) => s.items)
  const hasHydrated = useServicesAdminStore((s) => s.hasHydrated)
  const hydrate = useServicesAdminStore((s) => s.hydrate)
  const upsert = useServicesAdminStore((s) => s.upsert)
  const softDelete = useServicesAdminStore((s) => s.softDelete)
  const restore = useServicesAdminStore((s) => s.restore)
  const remove = useServicesAdminStore((s) => s.remove)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [showHidden, setShowHidden] = useState(false)

  const filtered = showHidden ? items : items.filter((r) => !r.hidden)

  const save = (slug: string, draft: Service) => {
    upsert({ ...draft, slug })
    setEditingSlug(null)
  }

  const create = (draft: Service) => {
    if (!draft.slug) draft.slug = `svc-${Date.now().toString(36)}`
    upsert(draft)
    setCreating(false)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight-custom">Послуги</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Керуйте картками послуг на сторінці /services. Зміни зберігаються у Supabase.
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
            <Plus size={16} /> Нова послуга
          </Button>
        </div>
      </header>

      {!hasHydrated && (
        <div className="rounded-xl border border-foreground/10 bg-card p-4 text-sm text-muted-foreground">
          Завантаження…
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-foreground/5 bg-foreground/[0.02] text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Slug</th>
              <th className="px-4 py-3 text-left">Назва</th>
              <th className="px-4 py-3 text-left">Іконка</th>
              <th className="px-4 py-3 text-right">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/5">
            {filtered.map((row) => {
              const s = row.data
              return (
                <tr key={row.slug} className={cn(row.hidden && "opacity-50")}>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{row.slug}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{s.title.uk}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-sm">{s.shortDesc.uk}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.icon}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      {row.hidden ? (
                        <button
                          onClick={() => restore(row.slug)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                        >
                          <RotateCcw size={14} /> Відновити
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingSlug(row.slug)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                          >
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
                <td colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  Послуг немає
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingSlug && (
        <ServiceEditor
          service={items.find((r) => r.slug === editingSlug)!.data}
          title={`Редагувати: ${items.find((r) => r.slug === editingSlug)?.data.title.uk}`}
          onSave={(sv) => save(editingSlug, sv)}
          onCancel={() => setEditingSlug(null)}
        />
      )}
      {creating && (
        <ServiceEditor
          service={{
            slug: `svc-${Date.now().toString(36)}`,
            icon: "sparkles",
            image: "",
            title: { uk: "", en: "", pl: "", de: "", lt: "" },
            shortDesc: { uk: "", en: "", pl: "", de: "", lt: "" },
            longDesc: { uk: "", en: "", pl: "", de: "", lt: "" },
            bullets: { uk: [], en: [], pl: [], de: [], lt: [] },
          }}
          title="Нова послуга"
          onSave={(sv) => create(sv)}
          onCancel={() => setCreating(false)}
        />
      )}
    </div>
  )
}

function ServiceEditor({
  service,
  title,
  onSave,
  onCancel,
}: {
  service: Service
  title: string
  onSave: (sv: Service) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState<Service>({ ...service })
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
          <Field label="Іконка">
            <select
              value={draft.icon}
              onChange={(e) => setDraft({ ...draft, icon: e.target.value as Service["icon"] })}
              className="h-10 w-full rounded-xl border border-foreground/10 bg-background px-3 text-sm"
            >
              {ICONS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </Field>
          <div className="md:col-span-2">
            <MultilingualField
              label="Назва послуги"
              value={draft.title}
              onChange={(v) => setDraft({ ...draft, title: v })}
            />
          </div>
          <div className="md:col-span-2">
            <MultilingualField
              label="Короткий опис"
              value={draft.shortDesc}
              onChange={(v) => setDraft({ ...draft, shortDesc: v })}
              multiline
              rows={3}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} className="rounded-xl">
            Скасувати
          </Button>
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
