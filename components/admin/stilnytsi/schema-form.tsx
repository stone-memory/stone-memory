"use client"

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageUploader } from "@/components/admin/image-uploader"
import { stilnytsiImageUrl } from "@/lib/stilnytsi/images"
import { cn } from "@/lib/utils"

/**
 * Редактор за схемою для контенту сайту стільниць. Кожен тип контенту
 * (матеріал, проєкт, стаття, налаштування) описується списком полів
 * (lib/stilnytsi/schemas.ts), а ця форма малює їх і повертає jsonb-документ
 * у тому вигляді, в якому його читає сайт.
 */
export type Field =
  | { type: "text" | "textarea" | "number" | "boolean" | "image" | "date"; key: string; label: string; help?: string; required?: boolean; span?: 1 | 2; placeholder?: string }
  | { type: "select"; key: string; label: string; options: string[]; help?: string; span?: 1 | 2 }
  /** string[] — вводяться через кому */
  | { type: "tags"; key: string; label: string; help?: string; span?: 1 | 2 }
  /** number[] — через кому */
  | { type: "numbers"; key: string; label: string; help?: string; span?: 1 | 2 }
  /** string[][] — рядок = рядок таблиці, клітинки через « | » */
  | { type: "rows"; key: string; label: string; help?: string; span?: 1 | 2 }
  /** вкладений обʼєкт */
  | { type: "group"; key: string; label: string; fields: Field[] }
  /** масив обʼєктів */
  | { type: "list"; key: string; label: string; fields: Field[]; itemTitle?: string; help?: string }
  /** Record<string, obj>: ключ = слаг у URL */
  | { type: "record"; key: string; label: string; keyLabel: string; fields: Field[]; help?: string }
  /** Record<string, number> — назва → число (ставки калькулятора) */
  | { type: "numberMap"; key: string; label: string; help?: string; span?: 1 | 2 }
  /** string[] фото */
  | { type: "images"; key: string; label: string; help?: string }

export type Doc = Record<string, unknown>

const asStr = (v: unknown) => (v === undefined || v === null ? "" : String(v))
const asArr = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])
const asObj = (v: unknown): Doc => (v && typeof v === "object" && !Array.isArray(v) ? (v as Doc) : {})

function Label({ text, help, required }: { text: string; help?: string; required?: boolean }) {
  return (
    <div className="mb-1">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {text}
        {required && <span className="text-destructive"> *</span>}
      </span>
      {help && <p className="text-[11px] text-muted-foreground/80">{help}</p>}
    </div>
  )
}

export function SchemaForm({
  fields,
  value,
  onChange,
  folder = "stilnytsi",
  depth = 0,
}: {
  fields: Field[]
  value: Doc
  onChange: (next: Doc) => void
  folder?: string
  depth?: number
}) {
  const set = (key: string, v: unknown) => onChange({ ...value, [key]: v })
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {fields.map((f) => {
        const wide = ("span" in f && f.span === 2) || f.type === "textarea" || f.type === "rows" || f.type === "group" || f.type === "list" || f.type === "record" || f.type === "numberMap" || f.type === "images"
        return (
          <div key={f.key} className={cn(wide && "md:col-span-2")}>
            <FieldInput field={f} value={value[f.key]} onChange={(v) => set(f.key, v)} folder={folder} depth={depth} />
          </div>
        )
      })}
    </div>
  )
}

function FieldInput({
  field: f,
  value,
  onChange,
  folder,
  depth,
}: {
  field: Field
  value: unknown
  onChange: (v: unknown) => void
  folder: string
  depth: number
}) {
  switch (f.type) {
    case "text":
    case "date":
      return (
        <label className="block">
          <Label text={f.label} help={f.help} required={f.required} />
          <Input type={f.type === "date" ? "date" : "text"} value={asStr(value)} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />
        </label>
      )
    case "number":
      return (
        <label className="block">
          <Label text={f.label} help={f.help} required={f.required} />
          <Input type="number" value={asStr(value)} onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} />
        </label>
      )
    case "textarea":
      return (
        <label className="block">
          <Label text={f.label} help={f.help} required={f.required} />
          <Textarea value={asStr(value)} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} className="min-h-[110px]" />
        </label>
      )
    case "boolean":
      return (
        <label className="flex items-center gap-2 pt-5 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-foreground" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          <span>{f.label}</span>
          {f.help && <span className="text-xs text-muted-foreground">— {f.help}</span>}
        </label>
      )
    case "select":
      return (
        <label className="block">
          <Label text={f.label} help={f.help} />
          <select value={asStr(value)} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-xl border border-foreground/10 bg-background px-3 text-sm">
            {!f.options.includes(asStr(value)) && <option value={asStr(value)}>{asStr(value) || "—"}</option>}
            {f.options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </label>
      )
    case "image":
      return (
        <div>
          <Label text={f.label} help={f.help ?? "Завантажте фото або вкажіть шлях до файлу на сайті, напр. /materials/x.webp"} />
          <ImageUploader value={stilnytsiImageUrl(asStr(value))} onChange={onChange} folder={folder} />
          <Input value={asStr(value)} onChange={(e) => onChange(e.target.value)} placeholder="/шлях/до/фото.webp або https://…" className="mt-2" />
        </div>
      )
    case "tags":
      return (
        <label className="block">
          <Label text={f.label} help={f.help ?? "Через кому"} />
          <Input value={asArr(value).map(asStr).join(", ")} onChange={(e) => onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
        </label>
      )
    case "numbers":
      return (
        <label className="block">
          <Label text={f.label} help={f.help ?? "Через кому"} />
          <Input value={asArr(value).map(asStr).join(", ")} onChange={(e) => onChange(e.target.value.split(",").map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n)))} />
        </label>
      )
    case "rows": {
      const rows = asArr(value).map((r) => asArr(r).map(asStr))
      return (
        <label className="block">
          <Label text={f.label} help={f.help ?? "Один рядок таблиці на рядок; клітинки через « | »"} />
          <Textarea
            value={rows.map((r) => r.join(" | ")).join("\n")}
            onChange={(e) => onChange(e.target.value.split("\n").filter((l) => l.trim()).map((l) => l.split("|").map((c) => c.trim())))}
            className="min-h-[120px] font-mono text-xs"
          />
        </label>
      )
    }
    case "numberMap": {
      const obj = asObj(value)
      const entries = Object.entries(obj)
      const update = (i: number, k: string, v: number) => {
        const next = entries.map((e, j) => (j === i ? [k, v] : e))
        onChange(Object.fromEntries(next))
      }
      return (
        <div>
          <Label text={f.label} help={f.help} />
          <div className="space-y-2">
            {entries.map(([k, v], i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={k} onChange={(e) => update(i, e.target.value, Number(v))} className="flex-1" placeholder="Назва" />
                <Input type="number" value={asStr(v)} onChange={(e) => update(i, k, Number(e.target.value))} className="w-32" />
                <button type="button" onClick={() => onChange(Object.fromEntries(entries.filter((_, j) => j !== i)))} className="rounded-md p-1.5 text-destructive/70 hover:bg-destructive/10" aria-label="Видалити">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="rounded-lg gap-1" onClick={() => onChange({ ...obj, "": 0 })}>
              <Plus size={14} /> Додати
            </Button>
          </div>
        </div>
      )
    }
    case "images": {
      const urls = asArr(value).map(asStr)
      return (
        <div>
          <Label text={f.label} help={f.help} />
          <div className="grid gap-3 sm:grid-cols-2">
            {urls.map((u, i) => (
              <div key={i} className="rounded-xl border border-foreground/10 p-2">
                <ImageUploader value={stilnytsiImageUrl(u)} onChange={(v) => onChange(urls.map((x, j) => (j === i ? v : x)))} folder={folder} />
                <div className="mt-2 flex items-center gap-2">
                  <Input value={u} onChange={(e) => onChange(urls.map((x, j) => (j === i ? e.target.value : x)))} className="h-8 text-xs" placeholder="/шлях або https://…" />
                  <button type="button" onClick={() => onChange(urls.filter((_, j) => j !== i))} className="rounded p-1 text-destructive/70 hover:bg-destructive/10" aria-label="Видалити"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" className="mt-2 rounded-lg gap-1" onClick={() => onChange([...urls, ""])}>
            <Plus size={14} /> Додати фото
          </Button>
        </div>
      )
    }
    case "group":
      return (
        <fieldset className="rounded-xl border border-foreground/10 p-4">
          <legend className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{f.label}</legend>
          <SchemaForm fields={f.fields} value={asObj(value)} onChange={onChange} folder={folder} depth={depth + 1} />
        </fieldset>
      )
    case "list": {
      const items = asArr(value).map(asObj)
      const setAt = (i: number, v: Doc) => onChange(items.map((it, j) => (j === i ? v : it)))
      const move = (i: number, d: -1 | 1) => {
        const j = i + d
        if (j < 0 || j >= items.length) return
        const next = [...items]
        ;[next[i], next[j]] = [next[j], next[i]]
        onChange(next)
      }
      return (
        <div>
          <Label text={f.label} help={f.help} />
          <div className="space-y-3">
            {items.map((it, i) => (
              <div key={i} className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-3">
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{f.itemTitle ?? "Елемент"} {i + 1}</span>
                  <span className="flex gap-1">
                    <button type="button" onClick={() => move(i, -1)} className="rounded p-1 hover:bg-foreground/5" aria-label="Вгору"><ArrowUp size={12} /></button>
                    <button type="button" onClick={() => move(i, 1)} className="rounded p-1 hover:bg-foreground/5" aria-label="Вниз"><ArrowDown size={12} /></button>
                    <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="rounded p-1 text-destructive/70 hover:bg-destructive/10" aria-label="Видалити"><Trash2 size={12} /></button>
                  </span>
                </div>
                <SchemaForm fields={f.fields} value={it} onChange={(v) => setAt(i, v)} folder={folder} depth={depth + 1} />
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="rounded-lg gap-1" onClick={() => onChange([...items, {}])}>
              <Plus size={14} /> Додати
            </Button>
          </div>
        </div>
      )
    }
    case "record": {
      // Record<string, obj> ↔ [{ __key, ...obj }]
      const obj = asObj(value)
      const items = Object.entries(obj).map(([k, v]) => ({ __key: k, ...asObj(v) }))
      const commit = (next: Doc[]) =>
        onChange(Object.fromEntries(next.map(({ __key, ...rest }) => [asStr(__key), rest])))
      return (
        <div>
          <Label text={f.label} help={f.help} />
          <div className="space-y-3">
            {items.map((it, i) => (
              <div key={i} className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label className="flex flex-1 items-center gap-2 text-xs text-muted-foreground">
                    <span className="shrink-0">{f.keyLabel}</span>
                    <Input value={asStr(it.__key)} onChange={(e) => commit(items.map((x, j) => (j === i ? { ...x, __key: e.target.value } : x)))} className="h-8 font-mono text-xs" />
                  </label>
                  <button type="button" onClick={() => commit(items.filter((_, j) => j !== i))} className="rounded p-1 text-destructive/70 hover:bg-destructive/10" aria-label="Видалити"><Trash2 size={12} /></button>
                </div>
                <SchemaForm fields={f.fields} value={it} onChange={(v) => commit(items.map((x, j) => (j === i ? { ...v, __key: it.__key } : x)))} folder={folder} depth={depth + 1} />
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="rounded-lg gap-1" onClick={() => commit([...items, { __key: "" }])}>
              <Plus size={14} /> Додати
            </Button>
          </div>
        </div>
      )
    }
  }
}
