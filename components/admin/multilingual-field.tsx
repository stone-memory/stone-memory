"use client"

import { useState } from "react"
import { Globe, Check, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Locale } from "@/lib/types"
import { cn } from "@/lib/utils"

const LOCALE_ORDER: Locale[] = ["uk", "en", "pl", "de", "lt"]
const LOCALE_LABELS: Record<Locale, string> = {
  uk: "Українська",
  en: "English",
  pl: "Polski",
  de: "Deutsch",
  lt: "Lietuvių",
}
const LOCALE_FLAGS: Record<Locale, string> = {
  uk: "🇺🇦",
  en: "🇬🇧",
  pl: "🇵🇱",
  de: "🇩🇪",
  lt: "🇱🇹",
}

type Props = {
  label: string
  value: Record<Locale, string>
  onChange: (v: Record<Locale, string>) => void
  multiline?: boolean
  rows?: number
  /** Locale used as the source for auto-translation */
  sourceLocale?: Locale
}

/**
 * Accordion-style editor for a multilingual string. Shows Ukrainian by default.
 * Has an "Auto-translate from UK" button that fills the other 4 locales via /api/translate.
 * Missing-translation indicator for each locale in the tab bar.
 */
export function MultilingualField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
  sourceLocale = "uk",
}: Props) {
  const [activeLocale, setActiveLocale] = useState<Locale>(sourceLocale)
  const [translating, setTranslating] = useState(false)
  const [provider, setProvider] = useState<string | null>(null)

  const autoTranslate = async () => {
    const source = sourceLocale
    const text = value[source]?.trim()
    if (!text) return
    setTranslating(true)
    setProvider(null)
    try {
      const targets = LOCALE_ORDER.filter((l) => l !== source)
      const r = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, source, targets }),
      })
      if (!r.ok) throw new Error(String(r.status))
      const data = (await r.json()) as {
        ok?: boolean
        provider?: "deepl" | "google" | "mock"
        result?: Partial<Record<Locale, string>>
      }
      if (!data.ok || !data.result) throw new Error("translate failed")
      const next = { ...value }
      for (const l of targets) if (data.result[l]) next[l] = data.result[l] as string
      onChange(next)
      setProvider(data.provider || null)
    } catch {
      setProvider("error")
    } finally {
      setTranslating(false)
    }
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={autoTranslate}
          disabled={translating || !value[sourceLocale]?.trim()}
          className="h-7 rounded-lg gap-1.5 text-[11px]"
        >
          {translating ? <Loader2 size={12} className="animate-spin" /> : <Globe size={12} />}
          {translating
            ? "Перекладаю…"
            : provider === "deepl"
            ? "DeepL ✓"
            : provider === "google"
            ? "Google ✓"
            : provider === "mock"
            ? "Mock (локальний)"
            : provider === "error"
            ? "Помилка"
            : `Автопереклад з ${sourceLocale.toUpperCase()}`}
        </Button>
      </div>

      <div className="flex flex-wrap gap-1 rounded-xl bg-foreground/[0.03] p-1">
        {LOCALE_ORDER.map((l) => {
          const isActive = activeLocale === l
          const missing = !value[l]?.trim()
          return (
            <button
              key={l}
              type="button"
              onClick={() => setActiveLocale(l)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "bg-foreground text-background shadow-soft"
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              )}
              aria-label={`Edit in ${LOCALE_LABELS[l]}`}
            >
              <span aria-hidden>{LOCALE_FLAGS[l]}</span>
              <span>{l.toUpperCase()}</span>
              {missing && !isActive && (
                <AlertCircle size={10} className="text-destructive" aria-label="Missing translation" />
              )}
              {!missing && !isActive && l !== sourceLocale && (
                <Check size={10} className={isActive ? "opacity-0" : "text-accent"} aria-hidden />
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-2">
        {multiline ? (
          <textarea
            value={value[activeLocale] || ""}
            onChange={(e) => onChange({ ...value, [activeLocale]: e.target.value })}
            rows={rows}
            className="w-full rounded-xl border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/5"
            placeholder={
              activeLocale === sourceLocale
                ? "Введіть текст і натисніть «Автопереклад»…"
                : `Переклад на ${LOCALE_LABELS[activeLocale]}`
            }
          />
        ) : (
          <Input
            value={value[activeLocale] || ""}
            onChange={(e) => onChange({ ...value, [activeLocale]: e.target.value })}
            placeholder={
              activeLocale === sourceLocale
                ? "Введіть текст…"
                : `Переклад на ${LOCALE_LABELS[activeLocale]}`
            }
          />
        )}
      </div>
    </div>
  )
}
