"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, RotateCcw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  useChatSettingsStore,
  defaultQuickReplies,
  defaultFallback,
  type QuickReply,
} from "@/lib/store/chat-settings"
import type { Locale } from "@/lib/types"
import { cn } from "@/lib/utils"

const LOCALES: { code: Locale; label: string }[] = [
  { code: "uk", label: "Українська" },
  { code: "en", label: "English" },
  { code: "pl", label: "Polski" },
  { code: "de", label: "Deutsch" },
  { code: "lt", label: "Lietuvių" },
]

function makeId() {
  return `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`
}

export default function AdminChatSettingsPage() {
  const overrides = useChatSettingsStore((s) => s.overrides)
  const hasHydrated = useChatSettingsStore((s) => s.hasHydrated)
  const hydrate = useChatSettingsStore((s) => s.hydrate)
  const setQuickReplies = useChatSettingsStore((s) => s.setQuickReplies)
  const setFallback = useChatSettingsStore((s) => s.setFallback)
  const resetLocale = useChatSettingsStore((s) => s.resetLocale)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const [locale, setLocale] = useState<Locale>("uk")
  const [saved, setSaved] = useState(false)
  const [draftReplies, setDraftReplies] = useState<QuickReply[]>([])
  const [draftFallback, setDraftFallback] = useState("")

  useEffect(() => {
    if (!hasHydrated) return
    const o = overrides[locale]
    setDraftReplies(o?.quickReplies ?? defaultQuickReplies[locale])
    setDraftFallback(o?.fallback ?? defaultFallback[locale])
  }, [locale, hasHydrated, overrides])

  const save = () => {
    setQuickReplies(locale, draftReplies)
    setFallback(locale, draftFallback)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }
  const reset = () => {
    resetLocale(locale)
    setDraftReplies(defaultQuickReplies[locale])
    setDraftFallback(defaultFallback[locale])
  }

  const update = (i: number, patch: Partial<QuickReply>) => {
    const next = draftReplies.slice()
    next[i] = { ...next[i], ...patch }
    setDraftReplies(next)
  }
  const add = () =>
    setDraftReplies([
      ...draftReplies,
      { id: makeId(), label: "", answer: "", order: draftReplies.length + 1 },
    ])
  const remove = (i: number) => setDraftReplies(draftReplies.filter((_, idx) => idx !== i))
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= draftReplies.length) return
    const next = draftReplies.slice()
    ;[next[i], next[j]] = [next[j], next[i]]
    setDraftReplies(next.map((q, idx) => ({ ...q, order: idx + 1 })))
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight-custom">Налаштування чату</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Швидкі відповіді показуються під вікном чату після того, як користувач залишив ім'я і телефон. Fallback — це відповідь, коли бот не знайшов FAQ-співпадіння.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reset} className="rounded-xl gap-2">
            <RotateCcw size={16} /> Скинути {locale.toUpperCase()}
          </Button>
          <Button onClick={save} className="rounded-xl gap-2">
            {saved ? <Check size={16} /> : null}
            {saved ? "Збережено" : "Зберегти"}
          </Button>
        </div>
      </header>

      <div className="flex gap-1 rounded-full bg-foreground/5 p-1 w-fit">
        {LOCALES.map((l) => (
          <button
            key={l.code}
            onClick={() => setLocale(l.code)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              locale === l.code
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {l.label}
          </button>
        ))}
      </div>

      <section className="rounded-2xl border border-foreground/10 bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Швидкі відповіді ({draftReplies.length})
          </h2>
          <Button variant="outline" size="sm" onClick={add} className="rounded-lg gap-1">
            <Plus size={14} /> Додати
          </Button>
        </div>
        <div className="space-y-3">
          {draftReplies.map((q, i) => (
            <div key={q.id} className="rounded-xl border border-foreground/10 bg-background p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >▲</button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === draftReplies.length - 1}
                    className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >▼</button>
                </div>
                <Input
                  value={q.label}
                  onChange={(e) => update(i, { label: e.target.value })}
                  placeholder="Текст на кнопці"
                  className="flex-1"
                />
                <button
                  onClick={() => remove(i)}
                  className="rounded-lg p-2 text-destructive/80 hover:bg-destructive/10"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <textarea
                value={q.answer}
                onChange={(e) => update(i, { answer: e.target.value })}
                placeholder="Відповідь бота…"
                rows={3}
                className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
              />
              <TriggersField
                value={q.triggers ?? []}
                onChange={(triggers) => update(i, { triggers })}
                placeholderLabel={q.label}
              />
            </div>
          ))}
          {draftReplies.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-6">
              Немає швидких відповідей. Додайте хоча б одну.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-foreground/10 bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Fallback-відповідь
        </h2>
        <p className="mb-2 text-xs text-muted-foreground">
          Показується, коли користувач написав щось, чого немає у FAQ і не збігається з нашими ключовими словами. Зазвичай — «зв'яжіться з менеджером» + телефон.
        </p>
        <textarea
          value={draftFallback}
          onChange={(e) => setDraftFallback(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
        />
      </section>
    </div>
  )
}

// ----------------------------------------------------------------
// TriggersField — chip-style synonyms editor.
//
// Each trigger is a normalized phrase the bot recognises as "this
// question". Bot matches with fuzzy/typo tolerance + word-stem
// substrings, so editors don't need to enter every conjugation —
// "почому" automatically covers "почому коштує", "почому стільниця"
// etc.
//
// UX: existing triggers render as removable chips; new ones added via
// the input on Enter, Tab, or comma. Backspace on empty input removes
// the last chip. Deduplicates case-insensitively.
// ----------------------------------------------------------------
function TriggersField({
  value,
  onChange,
  placeholderLabel,
}: {
  value: string[]
  onChange: (v: string[]) => void
  placeholderLabel?: string
}) {
  const [draft, setDraft] = useState("")

  const commit = (raw: string) => {
    const tokens = raw
      .split(/[,\n]/)
      .map((t) => t.trim())
      .filter(Boolean)
    if (tokens.length === 0) return
    const lower = new Set(value.map((v) => v.toLowerCase()))
    const next = [...value]
    for (const t of tokens) {
      const k = t.toLowerCase()
      if (lower.has(k)) continue
      lower.add(k)
      next.push(t)
    }
    onChange(next)
    setDraft("")
  }

  const removeAt = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i))
  }

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Tab" || e.key === ",") {
      e.preventDefault()
      commit(draft)
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      removeAt(value.length - 1)
    }
  }

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Тригери / синоніми
        </label>
        <span className="text-[11px] text-muted-foreground/70">
          {value.length === 0
            ? "Без тригерів бот шукатиме лише за текстом кнопки"
            : `${value.length} ${value.length === 1 ? "тригер" : value.length < 5 ? "тригери" : "тригерів"}`}
        </span>
      </div>

      <div
        className={cn(
          "flex flex-wrap items-center gap-1.5 rounded-lg border border-foreground/10 bg-background px-2 py-1.5 text-sm",
          "focus-within:border-foreground/30"
        )}
        onClick={(e) => {
          // Clicking empty space focuses the input
          const target = e.target as HTMLElement
          if (target.tagName === "DIV") {
            ;(target.querySelector("input") as HTMLInputElement | null)?.focus()
          }
        }}
      >
        {value.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className="inline-flex items-center gap-1 rounded-md bg-foreground/5 px-2 py-0.5 text-xs"
          >
            {t}
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="rounded-full p-0.5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
              aria-label={`Видалити «${t}»`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => commit(draft)}
          onKeyDown={onKey}
          placeholder={
            value.length === 0
              ? placeholderLabel
                ? `напр. «${placeholderLabel}», синоніми…`
                : "Enter / кома щоб додати"
              : "+ ще тригер"
          }
          className="flex-1 min-w-[120px] border-0 bg-transparent px-1 py-0.5 text-xs outline-none placeholder:text-muted-foreground/60"
        />
      </div>

      <p className="mt-1 text-[11px] text-muted-foreground">
        Бот вже терпить друкарські помилки і відмінки автоматично —
        додавайте лише принципово інші формулювання («почому» для «скільки коштує»,
        «коли буде готово» для «термін» тощо).
      </p>
    </div>
  )
}
