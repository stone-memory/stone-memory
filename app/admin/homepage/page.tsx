"use client"

import { useEffect, useState } from "react"
import { Check, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MultilingualField } from "@/components/admin/multilingual-field"
import { ImageUploader } from "@/components/admin/image-uploader"
import {
  useHomepageStore,
  DEFAULT_HOMEPAGE_CATEGORIES,
  type HomepageCategoriesContent,
  type HomepageCategoryCard,
} from "@/lib/store/homepage"
import type { Locale } from "@/lib/types"
import { cn } from "@/lib/utils"

const LOCALES: Locale[] = ["uk", "en", "pl", "de", "lt"]
const LOCALE_FLAGS: Record<Locale, string> = {
  uk: "🇺🇦",
  en: "🇬🇧",
  pl: "🇵🇱",
  de: "🇩🇪",
  lt: "🇱🇹",
}

export default function AdminHomepagePage() {
  const stored = useHomepageStore((s) => s.content)
  const hasHydrated = useHomepageStore((s) => s.hasHydrated)
  const saving = useHomepageStore((s) => s.saving)
  const hydrate = useHomepageStore((s) => s.hydrate)
  const save = useHomepageStore((s) => s.save)

  const [draft, setDraft] = useState<HomepageCategoriesContent>(stored)
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  // Pull store value into local draft once hydration finishes.
  useEffect(() => {
    if (hasHydrated) setDraft(stored)
  }, [hasHydrated, stored])

  const updateCard = (which: "memorial" | "home", patch: Partial<HomepageCategoryCard>) => {
    setDraft((d) => ({ ...d, [which]: { ...d[which], ...patch } }))
  }

  const handleSave = async () => {
    setStatus("idle")
    setErrorMsg(null)
    const res = await save(draft)
    if (res.ok) {
      setStatus("saved")
      setTimeout(() => setStatus("idle"), 2500)
    } else {
      setStatus("error")
      setErrorMsg(res.error || "невідома помилка")
    }
  }

  const handleResetToDefault = () => {
    if (!confirm("Скинути до початкового тексту і фото? Незбережені зміни буде втрачено.")) return
    setDraft(DEFAULT_HOMEPAGE_CATEGORIES)
  }

  return (
    <div className="space-y-6 pb-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight-custom">Головна — секція «Що саме ми робимо»</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Дві картки, які бачать відвідувачі під hero на головній. Заголовок, фото, тексти і список пунктів — усе можна змінити.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleResetToDefault} className="rounded-xl">
            Скинути до дефолту
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !hasHydrated}
            className="rounded-xl gap-2 min-w-[140px]"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Зберігаю…
              </>
            ) : status === "saved" ? (
              <>
                <Check size={14} /> Збережено
              </>
            ) : (
              <>
                <Check size={14} /> Зберегти
              </>
            )}
          </Button>
        </div>
      </header>

      {!hasHydrated && (
        <div className="rounded-xl border border-foreground/10 bg-card p-4 text-sm text-muted-foreground">
          Завантаження…
        </div>
      )}

      {status === "error" && errorMsg && (
        <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle size={14} className="mr-2 inline" />
          Не вдалось зберегти: {errorMsg}
        </div>
      )}

      <section className="rounded-2xl border border-foreground/10 bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Заголовок секції
        </h2>
        <MultilingualField
          label="«Що саме ми робимо»"
          value={draft.heading}
          onChange={(v) => setDraft({ ...draft, heading: v })}
        />
      </section>

      <CardEditor
        cardLabel="Картка 1 — Пам'ятники"
        which="memorial"
        card={draft.memorial}
        onChange={(patch) => updateCard("memorial", patch)}
      />

      <CardEditor
        cardLabel="Картка 2 — Дім і сад"
        which="home"
        card={draft.home}
        onChange={(patch) => updateCard("home", patch)}
      />
    </div>
  )
}

function CardEditor({
  cardLabel,
  which,
  card,
  onChange,
}: {
  cardLabel: string
  which: "memorial" | "home"
  card: HomepageCategoryCard
  onChange: (patch: Partial<HomepageCategoryCard>) => void
}) {
  return (
    <section className="rounded-2xl border border-foreground/10 bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {cardLabel}
      </h2>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="Фото">
          <ImageUploader
            value={card.image}
            onChange={(url) => onChange({ image: url })}
            folder={`homepage/${which}`}
          />
        </Field>
        <Field label="Куди веде кнопка (URL)">
          <Input
            value={card.href}
            onChange={(e) => onChange({ href: e.target.value })}
            placeholder="/catalog?cat=memorial"
            className="font-mono text-xs"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Внутрішній URL, наприклад <code>/catalog?cat=memorial</code>. Буде викликатись для всіх мов.
          </p>
        </Field>
      </div>

      <div className="mt-5 space-y-5">
        <MultilingualField
          label="Заголовок картки"
          value={card.title}
          onChange={(v) => onChange({ title: v })}
        />
        <MultilingualField
          label="Опис під фото"
          value={card.description}
          onChange={(v) => onChange({ description: v })}
          multiline
          rows={3}
        />
        <MultilingualField
          label="Текст кнопки"
          value={card.cta}
          onChange={(v) => onChange({ cta: v })}
        />
        <MultilingualBullets
          label="Список пунктів (по одному на рядок)"
          value={card.items}
          onChange={(items) => onChange({ items })}
        />
      </div>
    </section>
  )
}

/**
 * Editor for `Record<Locale, string[]>` — one textarea per locale,
 * each line becomes a bullet. Mirrors the body editor pattern from
 * the article modal so editors don't have to manage arrays manually.
 */
function MultilingualBullets({
  label,
  value,
  onChange,
}: {
  label: string
  value: Record<Locale, string[]>
  onChange: (next: Record<Locale, string[]>) => void
}) {
  const [active, setActive] = useState<Locale>("uk")
  const text = (value[active] || []).join("\n")
  const update = (raw: string) => {
    const items = raw.split("\n").map((s) => s.trim()).filter(Boolean)
    onChange({ ...value, [active]: items })
  }
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="text-[11px] text-muted-foreground">
          по одному пункту в кожному рядку
        </span>
      </div>
      <div className="flex flex-wrap gap-1 rounded-xl bg-foreground/[0.03] p-1">
        {LOCALES.map((l) => {
          const isActive = active === l
          const missing = !(value[l] && value[l].length)
          return (
            <button
              key={l}
              type="button"
              onClick={() => setActive(l)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "bg-foreground text-background shadow-soft"
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              )}
            >
              <span aria-hidden>{LOCALE_FLAGS[l]}</span>
              <span>{l.toUpperCase()}</span>
              {missing && !isActive && (
                <AlertCircle size={10} className="text-destructive" />
              )}
            </button>
          )
        })}
      </div>
      <textarea
        value={text}
        onChange={(e) => update(e.target.value)}
        rows={6}
        className="mt-2 w-full rounded-xl border border-foreground/10 bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/5"
        placeholder={"Одиночні та парні\nСімейні комплекси\nХрести та обеліски"}
      />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}
