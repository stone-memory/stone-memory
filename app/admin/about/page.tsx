"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Plus, Trash2, RotateCcw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAboutStore, defaultAbout, type Badge, type AboutContent } from "@/lib/store/about"
import { ImageUploader } from "@/components/admin/image-uploader"
import type { Locale } from "@/lib/types"
import { cn } from "@/lib/utils"

const LOCALES: { code: Locale; label: string }[] = [
  { code: "uk", label: "Українська" },
  { code: "en", label: "English" },
  { code: "pl", label: "Polski" },
  { code: "de", label: "Deutsch" },
  { code: "lt", label: "Lietuvių" },
]

const ICONS: Badge["icon"][] = ["award", "shield", "users", "truck"]

export default function AdminAboutPage() {
  const overrides = useAboutStore((s) => s.overrides)
  const hasHydrated = useAboutStore((s) => s.hasHydrated)
  const setOverride = useAboutStore((s) => s.setOverride)
  const resetLocale = useAboutStore((s) => s.resetLocale)

  const [locale, setLocale] = useState<Locale>("uk")
  const [saved, setSaved] = useState(false)

  const current: AboutContent = useMemo(() => {
    if (!hasHydrated) return defaultAbout[locale]
    return { ...defaultAbout[locale], ...(overrides[locale] || {}) }
  }, [hasHydrated, overrides, locale])

  const [draft, setDraft] = useState<AboutContent>(current)

  // Reset draft when locale changes
  useMemo(() => {
    setDraft(current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, hasHydrated])

  const save = () => {
    setOverride(locale, {
      heading: draft.heading,
      paragraphs: draft.paragraphs,
      photo: draft.photo,
      photoAlt: draft.photoAlt,
      badges: draft.badges,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const reset = () => {
    resetLocale(locale)
    setDraft(defaultAbout[locale])
  }

  const updateParagraph = (i: number, v: string) => {
    const next = draft.paragraphs.slice()
    next[i] = v
    setDraft({ ...draft, paragraphs: next })
  }

  const addParagraph = () => setDraft({ ...draft, paragraphs: [...draft.paragraphs, ""] })
  const removeParagraph = (i: number) =>
    setDraft({ ...draft, paragraphs: draft.paragraphs.filter((_, idx) => idx !== i) })

  const updateBadge = (i: number, patch: Partial<Badge>) => {
    const next = draft.badges.slice()
    next[i] = { ...next[i], ...patch }
    setDraft({ ...draft, badges: next })
  }
  const addBadge = () =>
    setDraft({ ...draft, badges: [...draft.badges, { label: "", icon: "award" }] })
  const removeBadge = (i: number) =>
    setDraft({ ...draft, badges: draft.badges.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight-custom">Про нас</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Редагуйте текст, фото і бейджі для сторінки «Про нас». Окремо для кожної мови.
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-foreground/10 bg-card p-5">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Заголовок
            </label>
            <Input
              value={draft.heading}
              onChange={(e) => setDraft({ ...draft, heading: e.target.value })}
            />
          </section>

          <section className="rounded-2xl border border-foreground/10 bg-card p-5 space-y-4">
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Фото
            </label>
            <ImageUploader
              value={draft.photo}
              onChange={(url) => setDraft({ ...draft, photo: url })}
              folder="about"
            />
            <Input
              value={draft.photoAlt}
              onChange={(e) => setDraft({ ...draft, photoAlt: e.target.value })}
              placeholder="Alt-текст"
            />
            {draft.photo && (
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-foreground/5">
                <Image
                  src={draft.photo}
                  alt={draft.photoAlt || "preview"}
                  fill
                  sizes="400px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-foreground/10 bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Абзаци ({draft.paragraphs.length})
              </label>
              <Button variant="outline" size="sm" onClick={addParagraph} className="rounded-lg gap-1">
                <Plus size={14} /> Додати
              </Button>
            </div>
            <div className="space-y-3">
              {draft.paragraphs.map((p, i) => (
                <div key={i} className="flex items-start gap-2">
                  <textarea
                    value={p}
                    onChange={(e) => updateParagraph(i, e.target.value)}
                    rows={3}
                    className="flex-1 rounded-xl border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
                  />
                  <button
                    onClick={() => removeParagraph(i)}
                    className="mt-1 rounded-lg p-2 text-destructive/80 hover:bg-destructive/10"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-foreground/10 bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Бейджі ({draft.badges.length})
              </label>
              <Button variant="outline" size="sm" onClick={addBadge} className="rounded-lg gap-1">
                <Plus size={14} /> Додати
              </Button>
            </div>
            <div className="space-y-2">
              {draft.badges.map((b, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-foreground/10 bg-background p-2">
                  <select
                    value={b.icon}
                    onChange={(e) => updateBadge(i, { icon: e.target.value as Badge["icon"] })}
                    className="h-8 rounded-lg border border-foreground/10 bg-background px-2 text-xs"
                  >
                    {ICONS.map((ic) => (
                      <option key={ic} value={ic}>{ic}</option>
                    ))}
                  </select>
                  <Input
                    value={b.label}
                    onChange={(e) => updateBadge(i, { label: e.target.value })}
                    className="flex-1 h-8"
                  />
                  <button
                    onClick={() => removeBadge(i)}
                    className="rounded-lg p-1.5 text-destructive/80 hover:bg-destructive/10"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-foreground/10 bg-card p-5 text-xs text-muted-foreground">
            <p>Зміни зберігаються у localStorage цього браузера. Для спільної БД — підключіть Supabase/Postgres.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
