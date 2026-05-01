"use client"

import { useEffect, useState } from "react"
import { Send, Users, User, Mail, Check, AlertCircle, Trash2, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authedFetch } from "@/lib/authed-fetch"
import { cn } from "@/lib/utils"

type Subscriber = {
  id: string
  email: string
  locale: string
  status: "active" | "unsubscribed"
  created_at: string
}

type Target = "subscribers" | "clients" | "specific"
type Mode = "html" | "marketing"

type Highlight = { imageUrl?: string; title: string; description?: string; priceFrom?: number }

export default function AdminBroadcastPage() {
  const [subs, setSubs] = useState<Subscriber[]>([])
  const [target, setTarget] = useState<Target>("subscribers")
  const [specificEmails, setSpecificEmails] = useState("")

  const [mode, setMode] = useState<Mode>("marketing")
  const [subject, setSubject] = useState("")
  const [html, setHtml] = useState("")

  // Marketing fields
  const [headline, setHeadline] = useState("")
  const [intro, setIntro] = useState("")
  const [ctaLabel, setCtaLabel] = useState("Переглянути каталог")
  const [ctaUrl, setCtaUrl] = useState("https://stonememory.com.ua/catalog")
  const [outro, setOutro] = useState("")
  const [highlights, setHighlights] = useState<Highlight[]>([])

  const [scheduleAt, setScheduleAt] = useState("")
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent?: number; failed?: number; total?: number; scheduled?: boolean } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadSubs = async () => {
    const res = await authedFetch("/api/subscribers", { cache: "no-store" })
    if (!res.ok) return
    const json = await res.json()
    setSubs(json.subscribers || [])
  }

  useEffect(() => {
    loadSubs()
  }, [])

  const activeCount = subs.filter((s) => s.status === "active").length

  const removeSub = async (id: string) => {
    if (!confirm("Видалити підписника?")) return
    await authedFetch(`/api/subscribers/${id}`, { method: "DELETE" })
    loadSubs()
  }

  const addHighlight = () => setHighlights((h) => [...h, { title: "" }])
  const updateHighlight = (i: number, patch: Partial<Highlight>) =>
    setHighlights((h) => h.map((x, idx) => (idx === i ? { ...x, ...patch } : x)))
  const removeHighlight = (i: number) => setHighlights((h) => h.filter((_, idx) => idx !== i))

  const send = async () => {
    setError(null)
    setResult(null)

    if (!subject.trim()) {
      setError("Введіть тему")
      return
    }

    if (mode === "html" && !html.trim()) {
      setError("Заповніть HTML вміст")
      return
    }
    if (mode === "marketing") {
      if (!headline.trim() || !intro.trim() || !ctaLabel.trim() || !ctaUrl.trim()) {
        setError("Marketing-шаблон: заповніть заголовок, опис, текст і URL кнопки")
        return
      }
    }

    let targetPayload: object
    if (target === "specific") {
      const emails = specificEmails.split(/[\s,;]+/).map((e) => e.trim()).filter(Boolean)
      if (emails.length === 0) {
        setError("Введіть хоча б один email")
        return
      }
      targetPayload = { kind: "specific", emails }
    } else if (target === "subscribers") {
      targetPayload = { kind: "subscribers" }
    } else {
      targetPayload = { kind: "clients" }
    }

    setSending(true)
    try {
      const payload: Record<string, unknown> = { subject, target: targetPayload }
      if (scheduleAt) payload.scheduleAt = new Date(scheduleAt).toISOString()

      if (mode === "html") {
        payload.html = html
      } else {
        payload.template = "marketing"
        payload.fields = {
          headline,
          intro,
          ctaLabel,
          ctaUrl,
          outro: outro || undefined,
          highlights: highlights.filter((h) => h.title.trim()),
        }
      }

      const res = await authedFetch("/api/admin/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || "Помилка відправки")
      } else if (data.scheduled) {
        setResult({ scheduled: true })
        setSubject("")
        setHtml("")
        setHeadline("")
        setIntro("")
        setOutro("")
        setHighlights([])
        setScheduleAt("")
      } else {
        setResult({ sent: data.sent, failed: data.failed, total: data.total })
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight-custom">Розсилка</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Відправляйте листи всім підписникам, усім клієнтам із замовлень, або конкретним адресам.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Stat label="Активних підписників" value={activeCount} />
        <Stat label="Відписаних" value={subs.length - activeCount} />
        <Stat label="Всього у базі" value={subs.length} />
      </div>

      <section className="rounded-2xl border border-foreground/10 bg-card p-6 space-y-5">
        <h2 className="text-lg font-semibold">Новий лист</h2>

        {/* Mode switcher */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
            Формат
          </label>
          <div className="flex flex-wrap gap-2">
            <ModePill active={mode === "marketing"} onClick={() => setMode("marketing")} label="Marketing-шаблон" />
            <ModePill active={mode === "html"} onClick={() => setMode("html")} label="Власний HTML" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {mode === "marketing"
              ? "Готовий шаблон із заголовком, текстом, блоками товарів і CTA. Підходить для 'Нові надходження' / 'Акція' / 'Сезонний гайд'."
              : "Для кастомних листів. Пишете HTML вручну — він вкладається у брендовий макет Stone Memory."}
          </p>
        </div>

        {/* Recipient picker */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
            Кому
          </label>
          <div className="flex flex-wrap gap-2">
            <TargetPill active={target === "subscribers"} onClick={() => setTarget("subscribers")} icon={<Users size={14} />} label={`Усім підписникам (${activeCount})`} />
            <TargetPill active={target === "clients"} onClick={() => setTarget("clients")} icon={<Users size={14} />} label="Усім клієнтам" />
            <TargetPill active={target === "specific"} onClick={() => setTarget("specific")} icon={<User size={14} />} label="Конкретним адресам" />
          </div>
        </div>

        {target === "specific" && (
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
              Email(и) через кому
            </label>
            <textarea
              value={specificEmails}
              onChange={(e) => setSpecificEmails(e.target.value)}
              rows={2}
              placeholder="client1@example.com, client2@example.com"
              className="w-full rounded-xl border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30 font-mono"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
            Тема
          </label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Нові надходження цього тижня" />
        </div>

        {mode === "html" && (
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
              HTML
            </label>
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              rows={10}
              placeholder="<p>Привіт!</p><p>У нас нові надходження...</p>"
              className="w-full rounded-xl border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30 font-mono"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Підтримує HTML теги. Брендова обгортка (шапка + футер з unsubscribe) додається автоматично.
            </p>
            {html && (
              <div className="mt-3 rounded-xl border border-foreground/10 bg-background p-4 text-sm" dangerouslySetInnerHTML={{ __html: html }} />
            )}
          </div>
        )}

        {mode === "marketing" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                Заголовок
              </label>
              <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Три нові камені у каталозі" />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                Вступний текст
              </label>
              <textarea
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                rows={3}
                placeholder="Цього тижня ми додали до каталогу три нові позиції з Покостівського граніту..."
                className="w-full rounded-xl border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Блоки-highlights (опціонально)
                </label>
                <Button type="button" variant="outline" size="sm" onClick={addHighlight} className="rounded-xl gap-1">
                  <Plus size={14} /> Додати блок
                </Button>
              </div>
              {highlights.length === 0 && (
                <p className="text-xs text-muted-foreground">Блоки не обов'язкові. Без них лист містить тільки заголовок + вступ + CTA.</p>
              )}
              <div className="space-y-3">
                {highlights.map((h, i) => (
                  <div key={i} className="rounded-xl border border-foreground/10 bg-background p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Блок {i + 1}</span>
                      <button onClick={() => removeHighlight(i)} className="text-muted-foreground hover:text-destructive">
                        <X size={14} />
                      </button>
                    </div>
                    <Input placeholder="Заголовок" value={h.title} onChange={(e) => updateHighlight(i, { title: e.target.value })} />
                    <Input placeholder="URL зображення (необов'язково)" value={h.imageUrl || ""} onChange={(e) => updateHighlight(i, { imageUrl: e.target.value })} />
                    <div className="flex gap-2">
                      <Input placeholder="Опис (необов'язково)" value={h.description || ""} onChange={(e) => updateHighlight(i, { description: e.target.value })} />
                      <Input
                        type="number"
                        placeholder="Ціна від €"
                        value={h.priceFrom ?? ""}
                        onChange={(e) => updateHighlight(i, { priceFrom: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-32"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                  Текст кнопки
                </label>
                <Input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                  URL кнопки
                </label>
                <Input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://stonememory.com.ua/catalog" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                Післятекст (опціонально)
              </label>
              <textarea
                value={outro}
                onChange={(e) => setOutro(e.target.value)}
                rows={2}
                placeholder="З повагою,&#10;команда Stone Memory"
                className="w-full rounded-xl border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
            Запланувати (опціонально)
          </label>
          <Input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} className="max-w-xs" />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={send} disabled={sending} className="rounded-xl gap-2">
            <Send size={16} />
            {sending ? (scheduleAt ? "Планую…" : "Відправляю…") : scheduleAt ? "Запланувати" : "Відправити"}
          </Button>
          {result?.scheduled && (
            <div className="inline-flex items-center gap-2 text-sm text-success">
              <Check size={16} /> Лист у черзі.
            </div>
          )}
          {result && !result.scheduled && (
            <div className="inline-flex items-center gap-2 text-sm text-success">
              <Check size={16} /> Відправлено: {result.sent} з {result.total}
              {(result.failed ?? 0) > 0 && <span className="text-destructive">· Помилок: {result.failed}</span>}
            </div>
          )}
          {error && (
            <div className="inline-flex items-center gap-2 text-sm text-destructive">
              <AlertCircle size={16} /> {error}
            </div>
          )}
        </div>
      </section>

      {/* Subscribers list */}
      <section className="rounded-2xl border border-foreground/10 bg-card">
        <header className="px-6 py-4 border-b border-foreground/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Підписники</h2>
          <span className="text-xs text-muted-foreground tabular-nums">{subs.length}</span>
        </header>
        {subs.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Підписників немає. Футер-форма на сайті додає їх сюди автоматично.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Мова</th>
                <th className="px-4 py-3 text-left">Статус</th>
                <th className="px-4 py-3 text-left">Додано</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {subs.map((s) => (
                <tr key={s.id}>
                  <td className="px-6 py-3 font-mono text-xs"><Mail size={12} className="inline mr-2" />{s.email}</td>
                  <td className="px-4 py-3 uppercase text-muted-foreground">{s.locale}</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-block rounded-full px-2 py-0.5 text-[11px] font-medium",
                      s.status === "active" ? "bg-success/10 text-success" : "bg-foreground/5 text-muted-foreground"
                    )}>
                      {s.status === "active" ? "Активний" : "Відписаний"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">
                    {new Date(s.created_at).toLocaleDateString("uk-UA")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => removeSub(s.id)} className="rounded-md p-1.5 text-destructive/70 hover:bg-destructive/10" title="Видалити">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  )
}

function ModePill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active ? "border-foreground bg-foreground text-background" : "border-foreground/15 bg-background text-foreground hover:bg-foreground/5"
      )}
    >
      {label}
    </button>
  )
}

function TargetPill({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active ? "border-foreground bg-foreground text-background" : "border-foreground/15 bg-background text-foreground hover:bg-foreground/5"
      )}
    >
      {icon}
      {label}
    </button>
  )
}
