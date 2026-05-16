"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Bell, Check, Clock, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRemindersStore } from "@/lib/crm/store"
import { REMINDER_KIND_LABELS_UK } from "@/lib/crm/types"
import { formatDateTime, formatRelative } from "@/lib/admin-format"
import { cn } from "@/lib/utils"

export default function RemindersPage() {
  const items = useRemindersStore((s) => s.items)
  const loading = useRemindersStore((s) => s.loading)
  const load = useRemindersStore((s) => s.load)
  const complete = useRemindersStore((s) => s.complete)
  const snooze = useRemindersStore((s) => s.snooze)
  const cancel = useRemindersStore((s) => s.cancel)
  const [filter, setFilter] = useState<"all" | "today" | "overdue" | "upcoming">("all")

  useEffect(() => {
    load({ status: "pending" })
  }, [load])

  const groups = useMemo(() => {
    const now = Date.now()
    const today = new Date(); today.setHours(23, 59, 59, 999)
    const todayEnd = today.getTime()

    const overdue = items.filter((r) => new Date(r.due_at).getTime() < now)
    const todayList = items.filter((r) => {
      const t = new Date(r.due_at).getTime()
      return t >= now && t <= todayEnd
    })
    const upcoming = items.filter((r) => new Date(r.due_at).getTime() > todayEnd)

    return { overdue, today: todayList, upcoming, all: items }
  }, [items])

  const visible = filter === "all" ? items
    : filter === "overdue" ? groups.overdue
    : filter === "today" ? groups.today
    : groups.upcoming

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight-custom">Нагадування</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Усі активні нагадування. Cron надсилає їх у Telegram і email кожні 5 хв.
        </p>
      </header>

      <div className="flex gap-1 rounded-full bg-foreground/5 p-1 w-fit">
        {(
          [
            ["all", `Усі (${groups.all.length})`],
            ["overdue", `Прострочені (${groups.overdue.length})`],
            ["today", `Сьогодні (${groups.today.length})`],
            ["upcoming", `Наперед (${groups.upcoming.length})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              filter === key ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && items.length === 0 && (
        <div className="rounded-xl border border-foreground/10 bg-card p-6 text-center text-sm text-muted-foreground">
          Завантаження…
        </div>
      )}

      {!loading && visible.length === 0 && (
        <div className="rounded-2xl border border-dashed border-foreground/15 p-12 text-center text-sm text-muted-foreground">
          🎉 Немає активних нагадувань у цій категорії.
        </div>
      )}

      <div className="space-y-2">
        {visible.map((r) => {
          const overdue = new Date(r.due_at).getTime() < Date.now()
          return (
            <div
              key={r.id}
              className={cn(
                "rounded-2xl border bg-card p-4 flex flex-wrap items-center gap-3",
                overdue ? "border-amber-500/30 bg-amber-500/5" : "border-foreground/10"
              )}
            >
              {overdue && <AlertCircle size={16} className="text-amber-600 shrink-0" />}
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-xs">{REMINDER_KIND_LABELS_UK[r.kind]}</span>
                  <span className={cn("text-xs", overdue ? "text-amber-700 font-medium" : "text-muted-foreground")}>
                    {formatDateTime(r.due_at)} · {formatRelative(r.due_at)}
                  </span>
                </div>
                <div className="font-medium">{r.title}</div>
                {r.description && <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>}
                {r.deal_id && (
                  <Link href={`/admin/deals/${r.deal_id}`} className="mt-1 inline-block text-xs text-accent hover:underline">
                    → Перейти до угоди
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" onClick={() => complete(r.id)} className="rounded-full gap-1.5 text-xs">
                  <Check size={12} /> Готово
                </Button>
                <Button size="sm" variant="outline" onClick={() => snooze(r.id, 60)} className="rounded-full gap-1.5 text-xs">
                  <Clock size={12} /> +1 год
                </Button>
                <Button size="sm" variant="outline" onClick={() => snooze(r.id, 60 * 24)} className="rounded-full gap-1.5 text-xs">
                  <Clock size={12} /> Завтра
                </Button>
                <Button size="sm" variant="ghost" onClick={() => cancel(r.id)} className="rounded-full text-destructive">
                  <X size={12} />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
