"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { authedFetch } from "@/lib/authed-fetch"
import Image from "next/image"
import { shouldBypassOptimizer } from "@/lib/image-source"
import { Plus, Trash2, Check, Globe, Loader2 } from "lucide-react"
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
  const hydrate = useAboutStore((s) => s.hydrate)
  const setOverride = useAboutStore((s) => s.setOverride)

  // Сторінка раніше не підвантажувала збережене з бази і завжди показувала
  // текст із коду: правки зберігалися, але при наступному відкритті чи
  // перемиканні мови форма знову показувала старий текст.
  useEffect(() => {
    hydrate()
  }, [hydrate])

  const [locale, setLocale] = useState<Locale>("uk")
  const [saved, setSaved] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [translateMsg, setTranslateMsg] = useState<string | null>(null)
  const [draft, setDraft] = useState<AboutContent>(defaultAbout.uk)
  // Є незбережені правки у формі: поки так — store не перезаписує чернетку
  // (інакше збереження іншої мови чи фоновий переклад стирали б набране).
  const [dirty, setDirty] = useState(false)

  const editDraft = (next: AboutContent) => {
    setDraft(next)
    setDirty(true)
  }

  const switchLocale = (code: Locale) => {
    if (code === locale) return
    setDirty(false)
    setLocale(code)
  }

  // Форма завжди показує те, що бачить сайт: збережене в базі для цієї мови.
  // Текст із коду лишається лише запасним варіантом для мови, якої в базі
  // ще немає (те саме робить useAbout на публічній сторінці).
  useEffect(() => {
    if (!hasHydrated || dirty) return
    setDraft({ ...defaultAbout[locale], ...(overrides[locale] || {}) })
  }, [locale, hasHydrated, overrides, dirty])

  const save = async () => {
    const r = await setOverride(locale, {
      heading: draft.heading,
      paragraphs: draft.paragraphs,
      photo: draft.photo,
      photoAlt: draft.photoAlt,
      badges: draft.badges,
    })
    if (!r.ok) {
      toast.error("Не збережено", { description: r.error })
      return
    }
    setDirty(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  // Перекласти всі поля сторінки "Про нас" з обраної мови (sourceLocale)
  // на 4 інші. Після — autosave у Supabase. Це окрема кнопка, бо тут нема
  // <MultilingualField> (структура контенту складніша — масив абзаців + бейджі).
  const autoTranslateAll = async () => {
    const source = locale
    setTranslating(true)
    setTranslateMsg(null)

    try {
      // Збираємо унікальні рядки в один масив для batch-перекладу
      const targets: Locale[] = (["uk", "en", "pl", "de", "lt"] as Locale[]).filter((l) => l !== source)
      const sourceContent = draft
      // Спершу зберігаємо мову-джерело: переклад іде з форми, і без цього
      // сайт показував би переклади нового тексту поруч зі старим оригіналом.
      const sourceSaved = await setOverride(source, {
        heading: sourceContent.heading,
        paragraphs: sourceContent.paragraphs,
        photo: sourceContent.photo,
        photoAlt: sourceContent.photoAlt,
        badges: sourceContent.badges,
      })
      if (!sourceSaved.ok) {
        toast.error("Не збережено", { description: sourceSaved.error })
        return
      }
      setDirty(false)

      const fields: { kind: "heading" | "paragraph" | "photoAlt" | "badge"; index?: number; text: string }[] = [
        { kind: "heading", text: sourceContent.heading },
        { kind: "photoAlt", text: sourceContent.photoAlt },
        ...sourceContent.paragraphs.map((p, i) => ({ kind: "paragraph" as const, index: i, text: p })),
        ...sourceContent.badges.map((b, i) => ({ kind: "badge" as const, index: i, text: b.label })),
      ]

      // На кожне поле — окремий запит. /api/translate за раз перекладає 1 текст
      // на N мов. Робимо паралельно.
      let provider: string = "mock"
      const perField = await Promise.all(
        fields.map(async (f) => {
          if (!f.text.trim()) return { f, result: {} as Partial<Record<Locale, string>> }
          try {
            const r = await authedFetch("/api/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: f.text, source, targets }),
            })
            const data = (await r.json()) as { ok?: boolean; provider?: string; result?: Partial<Record<Locale, string>> }
            if (data.ok && data.result) {
              if (data.provider && data.provider !== "mock") provider = data.provider
              return { f, result: data.result }
            }
          } catch {
            /* ignore — лишимо порожнім */
          }
          return { f, result: {} as Partial<Record<Locale, string>> }
        })
      )

      // Збираємо нові локалі і записуємо через store
      let failed = 0
      let lastError = ""
      for (const target of targets) {
        const targetContent: AboutContent = {
          ...sourceContent, // за замовчуванням — копія source
          paragraphs: [...sourceContent.paragraphs],
          badges: sourceContent.badges.map((b) => ({ ...b })),
        }
        for (const { f, result } of perField) {
          const t = result[target]
          if (!t) continue
          if (f.kind === "heading") targetContent.heading = t
          else if (f.kind === "photoAlt") targetContent.photoAlt = t
          else if (f.kind === "paragraph" && typeof f.index === "number") {
            targetContent.paragraphs[f.index] = t
          } else if (f.kind === "badge" && typeof f.index === "number") {
            targetContent.badges[f.index] = { ...targetContent.badges[f.index], label: t }
          }
        }
        const r = await setOverride(target, {
          heading: targetContent.heading,
          paragraphs: targetContent.paragraphs,
          photo: targetContent.photo,
          photoAlt: targetContent.photoAlt,
          badges: targetContent.badges,
        })
        if (!r.ok) {
          failed++
          lastError = r.error
        }
      }

      if (failed > 0) {
        toast.error("Не збережено", {
          description: `Не вдалось зберегти переклад для ${failed} з ${targets.length} мов: ${lastError}`,
        })
        setTranslateMsg("Помилка збереження")
        setTimeout(() => setTranslateMsg(null), 3000)
        return
      }

      setTranslateMsg(
        provider === "deepl"
          ? "Готово (DeepL)"
          : provider === "google"
          ? "Готово (Google)"
          : provider === "mymemory"
          ? "Готово (MyMemory)"
          : "Готово (Mock)"
      )
      setTimeout(() => setTranslateMsg(null), 3000)
    } finally {
      setTranslating(false)
    }
  }

  const updateParagraph = (i: number, v: string) => {
    const next = draft.paragraphs.slice()
    next[i] = v
    editDraft({ ...draft, paragraphs: next })
  }

  const addParagraph = () => editDraft({ ...draft, paragraphs: [...draft.paragraphs, ""] })
  const removeParagraph = (i: number) =>
    editDraft({ ...draft, paragraphs: draft.paragraphs.filter((_, idx) => idx !== i) })

  const updateBadge = (i: number, patch: Partial<Badge>) => {
    const next = draft.badges.slice()
    next[i] = { ...next[i], ...patch }
    editDraft({ ...draft, badges: next })
  }
  const addBadge = () =>
    editDraft({ ...draft, badges: [...draft.badges, { label: "", icon: "award" }] })
  const removeBadge = (i: number) =>
    editDraft({ ...draft, badges: draft.badges.filter((_, idx) => idx !== i) })

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
          <Button
            variant="outline"
            onClick={autoTranslateAll}
            disabled={translating || !hasHydrated}
            className="rounded-xl gap-2"
            title={`Перекласти всю сторінку «Про нас» з ${locale.toUpperCase()} на інші 4 мови`}
          >
            {translating ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
            {translating ? "Перекладаю…" : translateMsg || `Перекласти на 4 мови`}
          </Button>
          <Button onClick={save} disabled={!hasHydrated} className="rounded-xl gap-2">
            {saved ? <Check size={16} /> : null}
            {saved ? "Збережено" : "Зберегти"}
          </Button>
        </div>
      </header>

      <div className="flex gap-1 rounded-full bg-foreground/5 p-1 w-fit">
        {LOCALES.map((l) => (
          <button
            key={l.code}
            onClick={() => switchLocale(l.code)}
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
              onChange={(e) => editDraft({ ...draft, heading: e.target.value })}
            />
          </section>

          <section className="rounded-2xl border border-foreground/10 bg-card p-5 space-y-4">
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Фото
            </label>
            <ImageUploader
              value={draft.photo}
              onChange={(url) => editDraft({ ...draft, photo: url })}
              folder="about"
            />
            <Input
              value={draft.photoAlt}
              onChange={(e) => editDraft({ ...draft, photoAlt: e.target.value })}
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
                  unoptimized={shouldBypassOptimizer(draft.photo)}
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
        </div>
      </div>
    </div>
  )
}
