"use client"

import { useState } from "react"
import { Check, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  type Article,
  type ArticleCategory,
  categoryTitles,
} from "@/lib/data/articles"
import type { Locale } from "@/lib/types"
import { MultilingualField } from "@/components/admin/multilingual-field"
import { ImageUploader } from "@/components/admin/image-uploader"
import { cn } from "@/lib/utils"

const CATEGORIES: ArticleCategory[] = ["stone", "memorials", "design", "care", "history"]
const LOCALES: Locale[] = ["uk", "en", "pl", "de", "lt"]
const LOCALE_FLAGS: Record<Locale, string> = {
  uk: "🇺🇦",
  en: "🇬🇧",
  pl: "🇵🇱",
  de: "🇩🇪",
  lt: "🇱🇹",
}

/** Convert blocks to a flat textarea string. Blocks with a heading become
 *  `## heading\n\nbody`; blocks without become just the text. Multiple
 *  blocks are joined by a blank line.
 *
 *  This keeps the editor simple while preserving the existing block shape
 *  used by the public renderer in app/blog/[slug]/page.tsx.
 */
function blocksToText(blocks: Article["body"][Locale]): string {
  return blocks
    .map((b) => (b.heading ? `## ${b.heading}\n\n${b.text}` : b.text))
    .join("\n\n")
}

/** Reverse of blocksToText. Each paragraph becomes a `{ text }` block; if a
 *  paragraph starts with `## `, the next paragraph (if any) becomes the body
 *  of a `{ heading, text }` block. */
function textToBlocks(text: string): Article["body"][Locale] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
  const out: Article["body"][Locale] = []
  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i]
    if (p.startsWith("## ")) {
      const heading = p.slice(3).trim()
      const next = paragraphs[i + 1]
      if (next && !next.startsWith("## ")) {
        out.push({ heading, text: next })
        i++ // consume the body paragraph
      } else {
        out.push({ heading, text: "" })
      }
    } else {
      out.push({ text: p })
    }
  }
  return out
}

export function ArticleEditor({
  article,
  title,
  onSave,
  onCancel,
}: {
  article: Article
  title: string
  onSave: (a: Article) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState<Article>({ ...article })
  const [bodyDrafts, setBodyDrafts] = useState<Record<Locale, string>>(() => ({
    uk: blocksToText(article.body.uk || []),
    en: blocksToText(article.body.en || []),
    pl: blocksToText(article.body.pl || []),
    de: blocksToText(article.body.de || []),
    lt: blocksToText(article.body.lt || []),
  }))
  const [activeBodyLocale, setActiveBodyLocale] = useState<Locale>("uk")

  const save = () => {
    const body: Article["body"] = {
      uk: textToBlocks(bodyDrafts.uk),
      en: textToBlocks(bodyDrafts.en),
      pl: textToBlocks(bodyDrafts.pl),
      de: textToBlocks(bodyDrafts.de),
      lt: textToBlocks(bodyDrafts.lt),
    }
    onSave({ ...draft, body })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl border border-foreground/10 bg-card p-6 shadow-hover">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight-custom">{title}</h2>
          <button onClick={onCancel} className="rounded-full p-2 hover:bg-foreground/5">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Slug (URL)">
            <Input
              value={draft.slug}
              onChange={(e) => setDraft({ ...draft, slug: e.target.value.trim() })}
              placeholder="how-to-choose-granite"
            />
          </Field>
          <Field label="Категорія">
            <select
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value as ArticleCategory })}
              className="h-10 w-full rounded-xl border border-foreground/10 bg-background px-3 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {categoryTitles[c].uk}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Дата">
            <Input
              type="date"
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            />
          </Field>
          <Field label="Час читання (хв)">
            <Input
              type="text"
              inputMode="numeric"
              value={draft.readMinutes || ""}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, "")
                setDraft({ ...draft, readMinutes: raw ? Number(raw) : 1 })
              }}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Обкладинка">
              <ImageUploader
                value={draft.cover}
                onChange={(url) => setDraft({ ...draft, cover: url })}
                folder="blog"
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <MultilingualField
              label="Заголовок"
              value={draft.title}
              onChange={(v) => setDraft({ ...draft, title: v })}
            />
          </div>
          <div className="md:col-span-2">
            <MultilingualField
              label="Анонс (excerpt)"
              value={draft.excerpt}
              onChange={(v) => setDraft({ ...draft, excerpt: v })}
              multiline
              rows={3}
            />
          </div>

          {/* Body — custom locale-tabbed textarea since MultilingualField
              only handles flat strings, not block arrays. */}
          <div className="md:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Текст статті
              </span>
              <span className="text-[11px] text-muted-foreground">
                Параграфи розділяйте порожнім рядком · підзаголовок: <code className="font-mono">## текст</code>
              </span>
            </div>
            <div className="flex flex-wrap gap-1 rounded-xl bg-foreground/[0.03] p-1">
              {LOCALES.map((l) => {
                const isActive = activeBodyLocale === l
                const missing = !bodyDrafts[l]?.trim()
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setActiveBodyLocale(l)}
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
                      <AlertCircle size={10} className="text-destructive" aria-label="Текст відсутній" />
                    )}
                  </button>
                )
              })}
            </div>
            <textarea
              value={bodyDrafts[activeBodyLocale]}
              onChange={(e) =>
                setBodyDrafts({ ...bodyDrafts, [activeBodyLocale]: e.target.value })
              }
              rows={10}
              className="mt-2 w-full rounded-xl border border-foreground/10 bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/5"
              placeholder="Введіть текст статті. Розділяйте параграфи порожнім рядком."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} className="rounded-xl">
            Скасувати
          </Button>
          <Button onClick={save} className="rounded-xl gap-2" disabled={!draft.slug.trim()}>
            <Check size={16} /> Зберегти
          </Button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}
