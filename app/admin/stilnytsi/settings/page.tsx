"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { authedFetch } from "@/lib/authed-fetch"
import { SchemaForm, type Doc } from "@/components/admin/stilnytsi/schema-form"
import { settingsSchemas } from "@/lib/stilnytsi/schemas"
import { cn } from "@/lib/utils"

const KEYS = Object.keys(settingsSchemas)
/** Ключі, значення яких — обʼєкт «слаг → запис»; у формі це поле __root. */
const ROOT_RECORD = new Set(["support", "comparisons", "geo"])

export default function StilnytsiSettingsPage() {
  const [key, setKey] = useState(KEYS[0])
  const [doc, setDoc] = useState<Doc | null>(null)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setDoc(null)
    setMsg(null)
    fetch(`/api/content/stilnytsi-settings/${key}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return
        const data = j.data as Doc | null
        setDoc(ROOT_RECORD.has(key) ? { __root: data ?? {} } : (data ?? {}))
        setUpdatedAt(j.updatedAt ?? null)
        setDirty(false)
      })
      .catch(() => !cancelled && setMsg("Не вдалось завантажити"))
    return () => {
      cancelled = true
    }
  }, [key])

  const save = async () => {
    if (!doc) return
    setBusy(true)
    setMsg(null)
    try {
      const data = ROOT_RECORD.has(key) ? doc.__root : doc
      const r = await authedFetch(`/api/content/stilnytsi-settings/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || "Не вдалось зберегти")
      setUpdatedAt(j.updatedAt ?? null)
      setDirty(false)
      setMsg("Збережено. Сайт оновиться за кілька секунд.")
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Помилка")
    } finally {
      setBusy(false)
    }
  }

  const schema = settingsSchemas[key]
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight-custom">Стільниці · Налаштування сайту</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Контакти, ставки калькулятора, FAQ і тексти службових сторінок сайту стільниць. Зберігається одним документом на вкладку.
        </p>
      </header>

      <div className="flex flex-wrap gap-1 rounded-full bg-foreground/5 p-1 w-fit">
        {KEYS.map((k) => (
          <button
            key={k}
            onClick={() => {
              if (dirty && !confirm("Є незбережені зміни. Перейти без збереження?")) return
              setKey(k)
            }}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              key === k ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {settingsSchemas[k].title}
          </button>
        ))}
      </div>

      <section className="rounded-2xl border border-foreground/10 bg-card p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{schema.title}</h2>
            <p className="text-sm text-muted-foreground">{schema.help}</p>
            {updatedAt && <p className="mt-1 text-xs text-muted-foreground">Оновлено {new Date(updatedAt).toLocaleString("uk-UA")}</p>}
          </div>
          <Button className="rounded-xl" disabled={busy || !doc || !dirty} onClick={save}>
            {busy ? "Зберігаю…" : "Зберегти"}
          </Button>
        </div>
        {!doc ? (
          <p className="text-sm text-muted-foreground">Завантаження…</p>
        ) : (
          <SchemaForm
            fields={schema.fields}
            value={doc}
            onChange={(next) => {
              setDoc(next)
              setDirty(true)
            }}
            folder="stilnytsi-settings"
          />
        )}
        {msg && <p className="mt-4 text-sm">{msg}</p>}
      </section>
    </div>
  )
}
