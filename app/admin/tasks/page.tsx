"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AlertCircle, Check, Clock, Plus, RotateCcw, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRemindersStore, useTeamStore } from "@/lib/crm/store"
import { REMINDER_KIND_LABELS_UK, type ReminderKind, type ReminderRow } from "@/lib/crm/types"
import { useCurrentRole } from "@/lib/auth/use-current-role"
import { formatDateTime, formatRelative } from "@/lib/admin-format"
import { cn } from "@/lib/utils"

/**
 * Один розділ замість «Особистих задач» і «Нагадувань».
 *
 * Усе живе в таблиці reminders: особиста задача — це запис без угоди
 * (kind = custom), нагадування по угоді створюється зі сторінки угоди.
 * Коли настає час, cron шле в Telegram (і email, якщо позначено), а запис
 * лишається у списку, поки його не відмітять «Готово».
 */

type When = "1h" | "today" | "tomorrow" | "3d" | "1w" | "custom"
const WHEN_OPTIONS: Array<[When, string]> = [
  ["1h", "Через 1 год"],
  ["today", "Сьогодні 18:00"],
  ["tomorrow", "Завтра 9:00"],
  ["3d", "Через 3 дні"],
  ["1w", "Через тиждень"],
  ["custom", "Інше…"],
]

function dueFor(when: When, custom: string): Date | null {
  const now = new Date()
  const at = (days: number, hour: number) => {
    const d = new Date(now)
    d.setDate(d.getDate() + days)
    d.setHours(hour, 0, 0, 0)
    return d
  }
  switch (when) {
    case "1h":
      return new Date(now.getTime() + 3600_000)
    case "today": {
      const d = at(0, 18)
      return d.getTime() > now.getTime() ? d : new Date(now.getTime() + 3600_000)
    }
    case "tomorrow":
      return at(1, 9)
    case "3d":
      return at(3, 9)
    case "1w":
      return at(7, 9)
    case "custom": {
      if (!custom) return null
      const d = new Date(custom)
      return Number.isNaN(d.getTime()) ? null : d
    }
  }
}

const KIND_OPTIONS = (Object.keys(REMINDER_KIND_LABELS_UK) as ReminderKind[]).filter(
  (k) => k !== "sla_warning"
)

type OpenFilter = "all" | "overdue" | "today" | "upcoming"

export default function TasksPage() {
  const items = useRemindersStore((s) => s.items)
  const loading = useRemindersStore((s) => s.loading)
  const loaded = useRemindersStore((s) => s.loaded)
  const load = useRemindersStore((s) => s.load)
  const create = useRemindersStore((s) => s.create)
  const complete = useRemindersStore((s) => s.complete)
  const snooze = useRemindersStore((s) => s.snooze)
  const cancel = useRemindersStore((s) => s.cancel)
  const reopen = useRemindersStore((s) => s.reopen)
  const remove = useRemindersStore((s) => s.remove)

  const members = useTeamStore((s) => s.members)
  const loadTeam = useTeamStore((s) => s.load)
  const { capabilities } = useCurrentRole()
  const seesAll = capabilities.includes("deals.view_all")

  const [view, setView] = useState<"open" | "done">("open")
  const [scope, setScope] = useState<"mine" | "all">("mine")
  const [filter, setFilter] = useState<OpenFilter>("all")
  const [q, setQ] = useState("")

  useEffect(() => {
    void load({ status: view, scope: seesAll ? scope : "mine" })
  }, [view, scope, seesAll, load])
  useEffect(() => {
    if (seesAll) void loadTeam()
  }, [seesAll, loadTeam])

  const memberName = useMemo(() => {
    const m = new Map<string, string>()
    for (const t of members) m.set(t.id, t.display_name || t.email)
    return m
  }, [members])

  // Форма швидкого додавання
  const [title, setTitle] = useState("")
  const [details, setDetails] = useState("")
  const [when, setWhen] = useState<When>("tomorrow")
  const [customDate, setCustomDate] = useState("")
  const [kind, setKind] = useState<ReminderKind>("custom")
  const [notifyTelegram, setNotifyTelegram] = useState(true)
  const [notifyEmail, setNotifyEmail] = useState(false)
  const [assignee, setAssignee] = useState("")
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!title.trim()) return
    const due = dueFor(when, customDate)
    if (!due) {
      setFormError("Вкажіть дату і час")
      return
    }
    setBusy(true)
    try {
      const created = await create({
        title: title.trim(),
        description: details.trim() || null,
        due_at: due.toISOString(),
        kind,
        notify_via: [notifyTelegram ? "telegram" : "", notifyEmail ? "email" : ""].filter(Boolean),
        assigned_to: assignee || undefined,
      })
      if (!created) {
        setFormError("Не вдалось зберегти. Спробуйте ще раз.")
        return
      }
      setTitle("")
      setDetails("")
      setCustomDate("")
      setWhen("tomorrow")
      setKind("custom")
    } finally {
      setBusy(false)
    }
  }

  const groups = useMemo(() => {
    const now = Date.now()
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)
    const eod = endOfDay.getTime()
    const t = (r: ReminderRow) => new Date(r.due_at).getTime()
    return {
      overdue: items.filter((r) => t(r) < now),
      today: items.filter((r) => t(r) >= now && t(r) <= eod),
      upcoming: items.filter((r) => t(r) > eod),
    }
  }, [items])

  const visible = useMemo(() => {
    let list = view === "done" || filter === "all" ? items : groups[filter]
    if (q.trim()) {
      const needle = q.trim().toLowerCase()
      list = list.filter((r) =>
        [r.title, r.description, r.deals?.reference, r.deals?.customers?.name]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(needle)
      )
    }
    return list
  }, [items, groups, view, filter, q])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight-custom">Задачі й нагадування</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Особисті задачі та нагадування по угодах в одному списку. Коли настає час, cron надсилає
          нагадування в Telegram кожні 5 хв; запис лишається тут, доки не натиснете «Готово».
        </p>
      </header>

      <form
        onSubmit={submit}
        className="space-y-3 rounded-2xl border border-foreground/10 bg-card p-4"
      >
        <div className="flex flex-col gap-2 md:flex-row">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Що зробити? Напр.: передзвонити клієнту, перевірити замір…"
            className="flex-1"
          />
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as ReminderKind)}
            className="h-10 rounded-xl border border-foreground/10 bg-background px-3 text-sm"
            aria-label="Тип"
          >
            {KIND_OPTIONS.map((k) => (
              <option key={k} value={k}>
                {REMINDER_KIND_LABELS_UK[k]}
              </option>
            ))}
          </select>
          {seesAll && (
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="h-10 rounded-xl border border-foreground/10 bg-background px-3 text-sm"
              aria-label="Кому"
            >
              <option value="">Собі</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.display_name || m.email}
                </option>
              ))}
            </select>
          )}
        </div>
        <Input
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Деталі (необовʼязково)"
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {WHEN_OPTIONS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setWhen(key)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs",
                  when === key ? "border-foreground bg-foreground text-background" : "border-foreground/15"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {when === "custom" && (
            <Input
              type="datetime-local"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="w-56"
              aria-label="Дата і час"
            />
          )}
          <label className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            <input type="checkbox" checked={notifyTelegram} onChange={(e) => setNotifyTelegram(e.target.checked)} />
            Telegram
          </label>
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />
            Email
          </label>
          <Button type="submit" disabled={busy || !title.trim()} className="rounded-xl gap-2">
            <Plus size={16} /> Додати
          </Button>
        </div>
        {formError && <p className="text-sm text-destructive">{formError}</p>}
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-full bg-foreground/5 p-1">
          {(
            [
              ["open", "Відкриті"],
              ["done", "Виконані"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                view === key ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {view === "open" && (
          <div className="flex gap-1 rounded-full bg-foreground/5 p-1">
            {(
              [
                ["all", `Усі · ${items.length}`],
                ["overdue", `Прострочені · ${groups.overdue.length}`],
                ["today", `Сьогодні · ${groups.today.length}`],
                ["upcoming", `Наперед · ${groups.upcoming.length}`],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  filter === key ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        {seesAll && (
          <div className="flex gap-1 rounded-full bg-foreground/5 p-1">
            {(
              [
                ["mine", "Мої"],
                ["all", "Уся команда"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setScope(key)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  scope === key ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        <Input placeholder="Пошук…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      </div>

      {loading && !loaded && (
        <div className="rounded-xl border border-foreground/10 bg-card p-6 text-center text-sm text-muted-foreground">
          Завантаження…
        </div>
      )}

      {loaded && visible.length === 0 && (
        <div className="rounded-2xl border border-dashed border-foreground/15 p-12 text-center text-sm text-muted-foreground">
          {view === "done" ? "Виконаних задач ще немає." : "Немає задач у цій категорії."}
        </div>
      )}

      <div className="space-y-2">
        {visible.map((r) => (
          <Row
            key={r.id}
            r={r}
            done={view === "done"}
            assigneeName={r.assigned_to ? memberName.get(r.assigned_to) : undefined}
            showAssignee={seesAll && scope === "all"}
            onComplete={() => complete(r.id)}
            onSnooze={(min) => snooze(r.id, min)}
            onCancel={() => cancel(r.id)}
            onReopen={() => reopen(r.id)}
            onRemove={() => {
              if (confirm("Видалити запис назавжди?")) void remove(r.id)
            }}
          />
        ))}
      </div>
    </div>
  )
}

function Row({
  r,
  done,
  assigneeName,
  showAssignee,
  onComplete,
  onSnooze,
  onCancel,
  onReopen,
  onRemove,
}: {
  r: ReminderRow
  done: boolean
  assigneeName?: string
  showAssignee: boolean
  onComplete: () => void
  onSnooze: (minutes: number) => void
  onCancel: () => void
  onReopen: () => void
  onRemove: () => void
}) {
  const overdue = !done && new Date(r.due_at).getTime() < Date.now()
  const cancelled = r.status === "cancelled"
  const customer = r.deals?.customers
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4",
        overdue ? "border-amber-500/30 bg-amber-500/5" : "border-foreground/10",
        done && "opacity-70"
      )}
    >
      {overdue && <AlertCircle size={16} className="shrink-0 text-amber-600" />}
      <div className="min-w-[200px] flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-xs">{REMINDER_KIND_LABELS_UK[r.kind]}</span>
          <span className={cn("text-xs", overdue ? "font-medium text-amber-700" : "text-muted-foreground")}>
            {formatDateTime(r.due_at)} · {formatRelative(r.due_at)}
          </span>
          {r.status === "sent" && !done && (
            <span className="text-xs text-muted-foreground">· нагадано</span>
          )}
          {done && (
            <span className="text-xs text-muted-foreground">
              · {cancelled ? "скасовано" : "виконано"}
              {r.completed_at ? ` ${formatRelative(r.completed_at)}` : ""}
            </span>
          )}
          {showAssignee && assigneeName && (
            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-700">{assigneeName}</span>
          )}
        </div>
        <div className={cn("font-medium", done && "line-through")}>{r.title}</div>
        {r.description && <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>}
        {r.deal_id && (
          <Link href={`/admin/deals/${r.deal_id}`} className="mt-1 inline-block text-xs text-accent hover:underline">
            → Угода {r.deals?.reference || ""}
            {customer?.name ? ` · ${customer.name}` : ""}
            {customer?.phone ? ` · ${customer.phone}` : ""}
          </Link>
        )}
      </div>
      <div className="flex items-center gap-1">
        {done ? (
          <>
            <Button size="sm" variant="outline" onClick={onReopen} className="rounded-full gap-1.5 text-xs">
              <RotateCcw size={12} /> Повернути
            </Button>
            <button
              onClick={onRemove}
              aria-label="Видалити"
              className="rounded-md p-1.5 text-destructive/70 hover:bg-destructive/10"
            >
              <Trash2 size={14} />
            </button>
          </>
        ) : (
          <>
            <Button size="sm" variant="outline" onClick={onComplete} className="rounded-full gap-1.5 text-xs">
              <Check size={12} /> Готово
            </Button>
            <Button size="sm" variant="outline" onClick={() => onSnooze(60)} className="rounded-full gap-1.5 text-xs">
              <Clock size={12} /> +1 год
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const d = new Date()
                d.setDate(d.getDate() + 1)
                d.setHours(9, 0, 0, 0)
                onSnooze(Math.max(1, Math.round((d.getTime() - Date.now()) / 60_000)))
              }}
              className="rounded-full gap-1.5 text-xs"
            >
              <Clock size={12} /> Завтра 9:00
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancel} aria-label="Скасувати" className="rounded-full text-destructive">
              <X size={12} />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
