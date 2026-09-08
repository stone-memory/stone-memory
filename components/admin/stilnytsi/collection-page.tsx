"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authedFetch } from "@/lib/authed-fetch"
import { shouldBypassOptimizer } from "@/lib/image-source"
import { stilnytsiImageUrl } from "@/lib/stilnytsi/images"
import { SchemaForm, type Doc, type Field } from "@/components/admin/stilnytsi/schema-form"
import { cn } from "@/lib/utils"

/**
 * Універсальна сторінка «список + редактор» для контенту сайту стільниць.
 * Працює через загальний /api/content/<resource>: список публічний, запис —
 * для ролей з content.editorial. Після кожного збереження CRM сама
 * повідомляє сайт стільниць, і сторінки там оновлюються за секунду.
 */
export type Row = { id: string; data: Doc; hidden: boolean; position: number }

export function useStilnytsiCollection(resource: string, idKey: string) {
  const [rows, setRows] = useState<Row[]>([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/content/${resource}`, { cache: "no-store" })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || "load failed")
      const items = (j.items as Array<Record<string, unknown>>).map((it) => ({
        id: String(it[idKey]),
        data: (it.data as Doc) || {},
        hidden: Boolean(it.hidden),
        position: Number(it.position ?? 0),
      }))
      setRows(items)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не вдалось завантажити")
    } finally {
      setLoaded(true)
    }
  }, [resource, idKey])

  useEffect(() => {
    void load()
  }, [load])

  const save = async (id: string, data: Doc, extra?: { hidden?: boolean; position?: number }) => {
    const r = await authedFetch(`/api/content/${resource}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [idKey]: id, data, ...extra }),
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(j.error || "Не вдалось зберегти")
    await load()
  }
  const patch = async (id: string, body: Partial<{ hidden: boolean; position: number }>) => {
    const r = await authedFetch(`/api/content/${resource}/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!r.ok) throw new Error("Не вдалось оновити")
    await load()
  }
  const remove = async (id: string) => {
    const r = await authedFetch(`/api/content/${resource}/${encodeURIComponent(id)}`, { method: "DELETE" })
    if (!r.ok) throw new Error("Не вдалось видалити")
    await load()
  }
  const reorder = async (ids: string[]) => {
    const r = await authedFetch(`/api/content/${resource}/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
    if (!r.ok) throw new Error("Не вдалось змінити порядок")
    await load()
  }
  return { rows, loaded, error, load, save, patch, remove, reorder }
}

export function slugOk(s: string) {
  return /^[a-z0-9][a-z0-9-–]*$/i.test(s)
}

export function StilnytsiCollectionPage({
  resource,
  idKey,
  title,
  description,
  fields,
  summary,
  blank,
  folder,
  searchKeys = ["name", "title"],
}: {
  resource: string
  idKey: "slug" | "id"
  title: string
  description: string
  fields: Field[]
  summary: (data: Doc) => { title: string; subtitle?: string; image?: string }
  blank: () => Doc
  folder: string
  searchKeys?: string[]
}) {
  const col = useStilnytsiCollection(resource, idKey)
  const [editing, setEditing] = useState<{ id: string | null; data: Doc } | null>(null)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [q, setQ] = useState("")
  const [showHidden, setShowHidden] = useState(true)

  const visible = useMemo(() => {
    let list = col.rows
    if (!showHidden) list = list.filter((r) => !r.hidden)
    if (q.trim()) {
      const n = q.trim().toLowerCase()
      list = list.filter((r) =>
        [r.id, ...searchKeys.map((k) => String(r.data[k] ?? ""))].join(" ").toLowerCase().includes(n)
      )
    }
    return list
  }, [col.rows, q, showHidden, searchKeys])

  const submit = async () => {
    if (!editing) return
    setFormError(null)
    const id = String(editing.data[idKey] ?? "").trim()
    if (!id) return setFormError(`Вкажіть ${idKey === "slug" ? "слаг" : "артикул"}`)
    if (idKey === "slug" && !slugOk(id)) return setFormError("Слаг: лише латиниця, цифри й дефіси")
    if (editing.id && editing.id !== id) return setFormError("Ідентифікатор існуючого запису змінювати не можна — створіть новий.")
    if (!editing.id && col.rows.some((r) => r.id === id)) return setFormError("Такий запис уже є")
    setBusy(true)
    try {
      const existing = col.rows.find((r) => r.id === id)
      await col.save(id, { ...editing.data, [idKey]: id }, existing ? undefined : { position: col.rows.length })
      setEditing(null)
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Помилка")
    } finally {
      setBusy(false)
    }
  }

  const move = async (i: number, d: -1 | 1) => {
    const ids = col.rows.map((r) => r.id)
    const j = i + d
    if (j < 0 || j >= ids.length) return
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
    await col.reorder(ids)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight-custom">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
        <Button onClick={() => { setFormError(null); setEditing({ id: null, data: blank() }) }} className="rounded-xl gap-2">
          <Plus size={16} /> Додати
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder="Пошук…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" className="h-4 w-4 accent-foreground" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} />
          Показувати приховані
        </label>
        <span className="text-xs text-muted-foreground">
          Усього {col.rows.length}, на сайті {col.rows.filter((r) => !r.hidden).length}
        </span>
      </div>

      {col.error && <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{col.error}</p>}
      {!col.loaded && <div className="rounded-xl border border-foreground/10 bg-card p-6 text-center text-sm text-muted-foreground">Завантаження…</div>}
      {col.loaded && col.rows.length === 0 && (
        <div className="rounded-2xl border border-dashed border-foreground/15 p-12 text-center text-sm text-muted-foreground">
          Записів ще немає. Якщо це перший запуск — виконайте SQL початкового імпорту (stilnytsi-cms-2-seed.sql), або додайте перший запис вручну.
        </div>
      )}

      <div className="space-y-2">
        {visible.map((r) => {
          const s = { ...summary(r.data), image: stilnytsiImageUrl(summary(r.data).image) }
          const i = col.rows.findIndex((x) => x.id === r.id)
          return (
            <div key={r.id} className={cn("flex flex-wrap items-center gap-3 rounded-2xl border border-foreground/10 bg-card p-3", r.hidden && "opacity-50")}>
              {s.image ? (
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-foreground/5">
                  <Image src={s.image} alt="" fill sizes="80px" className="object-cover" unoptimized={shouldBypassOptimizer(s.image)} />
                </div>
              ) : (
                <div className="h-14 w-20 shrink-0 rounded-lg bg-foreground/5" />
              )}
              <div className="min-w-[200px] flex-1">
                <div className="font-medium">{s.title}</div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-mono">{r.id}</span>
                  {s.subtitle ? ` · ${s.subtitle}` : ""}
                  {r.hidden ? " · приховано" : ""}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => move(i, -1)} className="rounded-md p-1.5 text-muted-foreground hover:bg-foreground/5" title="Вище"><ArrowUp size={14} /></button>
                <button onClick={() => move(i, 1)} className="rounded-md p-1.5 text-muted-foreground hover:bg-foreground/5" title="Нижче"><ArrowDown size={14} /></button>
                <button onClick={() => col.patch(r.id, { hidden: !r.hidden })} className="rounded-md p-1.5 text-muted-foreground hover:bg-foreground/5" title={r.hidden ? "Показати на сайті" : "Сховати з сайту"}>
                  {r.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => { setFormError(null); setEditing({ id: r.id, data: r.data }) }} className="rounded-md p-1.5 text-muted-foreground hover:bg-foreground/5" title="Редагувати"><Pencil size={14} /></button>
                <button onClick={() => { if (confirm(`Видалити «${s.title}» назавжди? Краще сховати.`)) void col.remove(r.id) }} className="rounded-md p-1.5 text-destructive/70 hover:bg-destructive/10" title="Видалити"><Trash2 size={14} /></button>
              </div>
            </div>
          )
        })}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onClick={() => setEditing(null)}>
          <div className="my-6 w-full max-w-3xl rounded-2xl border border-foreground/10 bg-card p-6 shadow-hover" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing.id ? "Редагування" : "Новий запис"}</h2>
              <button onClick={() => setEditing(null)} className="rounded-md p-1.5 hover:bg-foreground/5" aria-label="Закрити"><X size={16} /></button>
            </div>
            <SchemaForm fields={fields} value={editing.data} onChange={(data) => setEditing({ ...editing, data })} folder={folder} />
            {formError && <p className="mt-3 text-sm text-destructive">{formError}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setEditing(null)}>Скасувати</Button>
              <Button className="rounded-xl" disabled={busy} onClick={submit}>{busy ? "Зберігаю…" : "Зберегти"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
