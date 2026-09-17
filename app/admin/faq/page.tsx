"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Plus, Trash2, Pencil, Check, X, ArrowUp, ArrowDown, EyeOff, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFaqStore, type FaqItem } from "@/lib/store/faq"
import type { SaveResult } from "@/lib/store/result"
import { MultilingualField } from "@/components/admin/multilingual-field"
import type { Locale } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function AdminFaqPage() {
  const rows = useFaqStore((s) => s.items)
  const loadError = useFaqStore((s) => s.error)
  const hydrate = useFaqStore((s) => s.hydrate)
  const add = useFaqStore((s) => s.add)
  const update = useFaqStore((s) => s.update)
  const remove = useFaqStore((s) => s.remove)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const items = useMemo(() => rows.map((r) => r.data), [rows])
  const sorted = [...items].sort((a, b) => a.order - b.order)

  const report = (r: SaveResult) => {
    if (!r.ok) toast.error("Не збережено", { description: r.error })
  }

  // Два PATCH послідовно: якщо перший не пройшов, другий не робимо — інакше
  // два питання отримали б однаковий порядок.
  const swapOrder = async (a: FaqItem, b: FaqItem) => {
    const r1 = await update(a.id, { order: b.order })
    if (!r1.ok) return report(r1)
    report(await update(b.id, { order: a.order }))
  }
  const moveUp = (id: string) => {
    const idx = sorted.findIndex((x) => x.id === id)
    if (idx <= 0) return
    void swapOrder(sorted[idx - 1], sorted[idx])
  }
  const moveDown = (id: string) => {
    const idx = sorted.findIndex((x) => x.id === id)
    if (idx < 0 || idx >= sorted.length - 1) return
    void swapOrder(sorted[idx + 1], sorted[idx])
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight-custom">FAQ</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Додавайте, редагуйте та приховуйте часті запитання. Відображаються на головній сторінці.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCreating(true)} className="rounded-xl gap-2">
            <Plus size={16} /> Нове питання
          </Button>
        </div>
      </header>

      <div className="space-y-3">
        {sorted.length === 0 && loadError ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-12 text-center text-sm text-destructive">
            Не вдалось завантажити питання: {loadError}
          </div>
        ) : sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-foreground/15 p-12 text-center text-sm text-muted-foreground">
            Питань немає. Додайте перше.
          </div>
        ) : (
          sorted.map((item, i) => (
            <div
              key={item.id}
              className={cn(
                "rounded-2xl border border-foreground/10 bg-card p-5",
                item.hidden && "opacity-50"
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">№ {i + 1}</div>
                  <div className="mt-1 text-base font-semibold">{item.q.uk}</div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a.uk}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveUp(item.id)}
                    disabled={i === 0}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => moveDown(item.id)}
                    disabled={i === sorted.length - 1}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    onClick={() => update(item.id, { hidden: !item.hidden }).then(report)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                    title={item.hidden ? "Показати" : "Сховати"}
                  >
                    {item.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    onClick={() => setEditingId(item.id)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => remove(item.id).then(report)}
                    className="rounded-md p-1.5 text-destructive/70 hover:bg-destructive/10"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {editingId && (
        <FaqEditor
          item={sorted.find((x) => x.id === editingId)!}
          title="Редагувати питання"
          onSave={async (patch) => {
            const r = await update(editingId, patch)
            if (r.ok) setEditingId(null)
            return r
          }}
          onCancel={() => setEditingId(null)}
        />
      )}
      {creating && (
        <FaqEditor
          item={{
            id: "",
            order: sorted.length,
            q: { uk: "", en: "", pl: "", de: "", lt: "" },
            a: { uk: "", en: "", pl: "", de: "", lt: "" },
          }}
          title="Нове питання"
          onSave={async (patch) => {
            const r = await add({
              q: patch.q || { uk: "", en: "", pl: "", de: "", lt: "" },
              a: patch.a || { uk: "", en: "", pl: "", de: "", lt: "" },
            })
            if (r.ok) setCreating(false)
            return r
          }}
          onCancel={() => setCreating(false)}
        />
      )}
    </div>
  )
}

function FaqEditor({
  item,
  title,
  onSave,
  onCancel,
}: {
  item: FaqItem
  title: string
  onSave: (patch: Partial<FaqItem>) => Promise<SaveResult>
  onCancel: () => void
}) {
  const [q, setQ] = useState<Record<Locale, string>>({ ...item.q })
  const [a, setA] = useState<Record<Locale, string>>({ ...item.a })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setSaving(true)
    setError(null)
    const r = await onSave({ q, a })
    // При успіху батько закриває модалку — далі стан не чіпаємо.
    if (r.ok) return
    setSaving(false)
    setError(r.error)
  }
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-foreground/10 bg-card p-6 shadow-hover">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight-custom">{title}</h2>
          <button onClick={onCancel} aria-label="Закрити" className="rounded-full p-2 hover:bg-foreground/5">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-5">
          <MultilingualField label="Питання" value={q} onChange={setQ} />
          <MultilingualField label="Відповідь" value={a} onChange={setA} multiline rows={5} />
        </div>
        {error && <p className="mt-4 text-sm text-destructive">Не збережено: {error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} className="rounded-xl">
            Скасувати
          </Button>
          <Button onClick={submit} disabled={saving} className="rounded-xl gap-2">
            <Check size={16} /> {saving ? "Зберігаю…" : "Зберегти"}
          </Button>
        </div>
      </div>
    </div>
  )
}
