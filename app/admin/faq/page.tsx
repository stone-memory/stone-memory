"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Trash2, Pencil, Check, X, ArrowUp, ArrowDown, EyeOff, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFaqStore, type FaqItem } from "@/lib/store/faq"
import { MultilingualField } from "@/components/admin/multilingual-field"
import type { Locale } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function AdminFaqPage() {
  const rows = useFaqStore((s) => s.items)
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

  const moveUp = (id: string) => {
    const idx = sorted.findIndex((x) => x.id === id)
    if (idx <= 0) return
    const prev = sorted[idx - 1]
    const cur = sorted[idx]
    update(prev.id, { order: cur.order })
    update(cur.id, { order: prev.order })
  }
  const moveDown = (id: string) => {
    const idx = sorted.findIndex((x) => x.id === id)
    if (idx < 0 || idx >= sorted.length - 1) return
    const next = sorted[idx + 1]
    const cur = sorted[idx]
    update(next.id, { order: cur.order })
    update(cur.id, { order: next.order })
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
        {sorted.length === 0 ? (
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
                    onClick={() => update(item.id, { hidden: !item.hidden })}
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
                    onClick={() => remove(item.id)}
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
          onSave={(patch) => {
            update(editingId, patch)
            setEditingId(null)
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
          onSave={(patch) => {
            add({
              q: patch.q || { uk: "", en: "", pl: "", de: "", lt: "" },
              a: patch.a || { uk: "", en: "", pl: "", de: "", lt: "" },
            })
            setCreating(false)
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
  onSave: (patch: Partial<FaqItem>) => void
  onCancel: () => void
}) {
  const [q, setQ] = useState<Record<Locale, string>>({ ...item.q })
  const [a, setA] = useState<Record<Locale, string>>({ ...item.a })
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
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} className="rounded-xl">
            Скасувати
          </Button>
          <Button onClick={() => onSave({ q, a })} className="rounded-xl gap-2">
            <Check size={16} /> Зберегти
          </Button>
        </div>
      </div>
    </div>
  )
}
