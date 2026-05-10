"use client"

import { useEffect, useMemo, useState } from "react"
import {
  TrendingUp,
  Package,
  Users,
  CheckCircle2,
  Clock,
  Globe,
  MessageCircle,
  Mail,
  Phone,
  Repeat,
  Activity,
  AlertCircle,
} from "lucide-react"
import { useOrdersStore } from "@/lib/store/orders"
import { authedFetch } from "@/lib/authed-fetch"
import { formatUAH, formatRelative, ADMIN_LOCALE } from "@/lib/admin-format"
import { cn } from "@/lib/utils"
import { RevenueByDays } from "@/components/admin/revenue-by-days"

type Period = "today" | "7d" | "30d" | "90d" | "ytd" | "all"

const PERIODS: { key: Period; label: string }[] = [
  { key: "today", label: "Сьогодні" },
  { key: "7d", label: "7 днів" },
  { key: "30d", label: "30 днів" },
  { key: "90d", label: "90 днів" },
  { key: "ytd", label: "З початку року" },
  { key: "all", label: "Увесь час" },
]

function startOf(period: Period): Date | null {
  const now = new Date()
  if (period === "all") return null
  if (period === "today") {
    const d = new Date(now)
    d.setHours(0, 0, 0, 0)
    return d
  }
  if (period === "ytd") return new Date(now.getFullYear(), 0, 1)
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90
  const d = new Date(now)
  d.setDate(d.getDate() - days)
  return d
}

const localeFlag: Record<string, string> = {
  uk: "🇺🇦",
  pl: "🇵🇱",
  en: "🇬🇧",
  de: "🇩🇪",
  lt: "🇱🇹",
}
const localeName: Record<string, string> = {
  uk: "Українська",
  pl: "Polski",
  en: "English",
  de: "Deutsch",
  lt: "Lietuvių",
}

type ChatSession = {
  sessionId: string
  name: string
  phone?: string
  locale: string
  lastUserAt: number
  userMessages: { id: string; text: string; at: number }[]
  operatorMessages: { id: string; text: string; at: number }[]
}

type Subscriber = {
  id: string
  email: string
  locale: string
  status: "active" | "unsubscribed"
  created_at: string
}

export default function AnalyticsPage() {
  const orders = useOrdersStore((s) => s.orders)
  const ordersLoading = useOrdersStore((s) => s.loading)
  const [period, setPeriod] = useState<Period>("30d")
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now())

  // Real-time: завантажуємо чат-сесії і підписників раз на хвилину
  useEffect(() => {
    const loadChat = async () => {
      try {
        const r = await authedFetch("/api/chat/sessions", { cache: "no-store" })
        if (r.ok) {
          const j = (await r.json()) as { sessions?: ChatSession[] }
          setChatSessions(j.sessions || [])
        }
      } catch {
        /* ignore */
      }
    }
    const loadSubs = async () => {
      try {
        const r = await authedFetch("/api/subscribers", { cache: "no-store" })
        if (r.ok) {
          const j = (await r.json()) as { subscribers?: Subscriber[] }
          setSubscribers(j.subscribers || [])
        }
      } catch {
        /* ignore */
      }
    }
    loadChat()
    loadSubs()
    const id = setInterval(() => {
      loadChat()
      loadSubs()
      setLastRefresh(Date.now())
    }, 60_000)
    return () => clearInterval(id)
  }, [])

  const from = useMemo(() => startOf(period), [period])

  const filtered = useMemo(
    () => orders.filter((o) => !from || new Date(o.createdAt) >= from),
    [orders, from]
  )

  // ===== Базові KPI (€ суми → UAH) =====
  const totalRevenue = filtered.reduce(
    (sum, o) => sum + o.items.reduce((a, i) => a + i.priceFrom, 0),
    0
  )
  const completed = filtered.filter((o) => o.status === "completed")
  const inProgress = filtered.filter((o) => o.status === "in_progress")
  const newOrders = filtered.filter((o) => o.status === "new")
  const completedRevenue = completed.reduce(
    (s, o) => s + o.items.reduce((a, i) => a + i.priceFrom, 0),
    0
  )
  const avgOrder = filtered.length ? Math.round(totalRevenue / filtered.length) : 0
  const uniqueClients = new Set(filtered.map((o) => o.phone)).size

  // ===== Conversion funnel =====
  // chat sessions з останніх 30 днів → orders → completed
  const funnelFrom = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.getTime()
  }, [])
  const recentChats = chatSessions.filter((s) => s.lastUserAt >= funnelFrom).length
  const recentOrders = orders.filter((o) => new Date(o.createdAt).getTime() >= funnelFrom).length
  const recentCompleted = orders.filter(
    (o) => o.status === "completed" && new Date(o.createdAt).getTime() >= funnelFrom
  ).length

  const funnelChatToOrder = recentChats > 0 ? Math.round((recentOrders / recentChats) * 100) : 0
  const funnelOrderToDone = recentOrders > 0 ? Math.round((recentCompleted / recentOrders) * 100) : 0

  // ===== Status breakdown =====
  const byStatus = {
    new: newOrders.length,
    in_progress: inProgress.length,
    completed: completed.length,
  }

  // ===== Категорії =====
  const byCategory = filtered.reduce(
    (acc, o) => {
      for (const i of o.items) {
        acc[i.category] = (acc[i.category] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>
  )

  // ===== Топ-10 товарів =====
  const topItems = useMemo(() => {
    const counts: Record<string, { count: number; revenue: number }> = {}
    for (const o of filtered) {
      for (const i of o.items) {
        if (!counts[i.id]) counts[i.id] = { count: 0, revenue: 0 }
        counts[i.id].count++
        counts[i.id].revenue += i.priceFrom
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
  }, [filtered])

  // Daily timeline aggregation lives inside <RevenueByDays /> now —
  // it owns its own period state independent from this page-level
  // `period` filter.

  // ===== Time-of-day pattern (коли клієнти найчастіше залишають заявки?) =====
  const hourlyPattern = useMemo(() => {
    const hours = Array.from({ length: 24 }, () => 0)
    for (const o of filtered) {
      const h = new Date(o.createdAt).getHours()
      hours[h]++
    }
    return hours
  }, [filtered])
  const peakHour = hourlyPattern.indexOf(Math.max(...hourlyPattern))
  const maxHourly = Math.max(1, ...hourlyPattern)

  // ===== Day-of-week pattern =====
  const weekdayPattern = useMemo(() => {
    // 0=Sun … 6=Sat. Україна — починаємо з Понеділка
    const map = [0, 0, 0, 0, 0, 0, 0]
    for (const o of filtered) {
      const d = new Date(o.createdAt).getDay()
      map[d]++
    }
    // shift до понеділка
    return [map[1], map[2], map[3], map[4], map[5], map[6], map[0]]
  }, [filtered])
  const weekdayLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"]
  const maxWeekday = Math.max(1, ...weekdayPattern)

  // ===== LTV (повторні клієнти) =====
  const repeatClients = useMemo(() => {
    const byPhone: Record<string, number> = {}
    for (const o of orders) byPhone[o.phone] = (byPhone[o.phone] || 0) + 1
    const repeat = Object.values(byPhone).filter((n) => n > 1).length
    const total = Object.keys(byPhone).length
    return { total, repeat, rate: total > 0 ? Math.round((repeat / total) * 100) : 0 }
  }, [orders])

  // ===== Канали зв'язку =====
  // Чат-сесії → можна знайти ті, які стали замовленнями (ті що з phone)
  const chatToOrderSessions = chatSessions.filter((s) => {
    if (!s.phone) return false
    return orders.some((o) => o.phone.replace(/\D/g, "") === s.phone!.replace(/\D/g, ""))
  }).length

  // ===== Розподіл за локалями =====
  const subscribersByLocale = useMemo(() => {
    const map: Record<string, number> = {}
    for (const s of subscribers) {
      if (s.status !== "active") continue
      map[s.locale] = (map[s.locale] || 0) + 1
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [subscribers])

  const chatByLocale = useMemo(() => {
    const map: Record<string, number> = {}
    for (const s of chatSessions) {
      map[s.locale] = (map[s.locale] || 0) + 1
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [chatSessions])

  // ===== Швидкість відповіді (середній час між першим повідомленням клієнта і відповіддю оператора) =====
  const avgResponseTime = useMemo(() => {
    const samples: number[] = []
    for (const s of chatSessions) {
      const firstUser = s.userMessages[0]
      if (!firstUser) continue
      const firstOp = s.operatorMessages.find((m) => m.at > firstUser.at)
      if (!firstOp) continue
      samples.push(firstOp.at - firstUser.at)
    }
    if (samples.length === 0) return null
    const avg = samples.reduce((a, b) => a + b, 0) / samples.length
    return Math.round(avg / 60_000) // у хвилинах
  }, [chatSessions])

  // ===== Сесії без відповіді (потребують уваги!) =====
  const unrepliedSessions = chatSessions.filter((s) => {
    const lastUser = s.userMessages[s.userMessages.length - 1]
    if (!lastUser) return false
    const lastOp = s.operatorMessages[s.operatorMessages.length - 1]
    if (lastOp && lastOp.at > lastUser.at) return false
    // Старіше ніж 5 хв — потрібна увага
    return Date.now() - lastUser.at > 5 * 60_000
  })

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight-custom">Аналітика</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} замовлень за вибраний період · оновлено {formatRelative(lastRefresh)}
          </p>
        </div>
        <div className="flex gap-1 rounded-full bg-foreground/5 p-1 flex-wrap">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                period === p.key
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      {/* ===== Real-time alerts ===== */}
      {unrepliedSessions.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-900">
              {unrepliedSessions.length}{" "}
              {unrepliedSessions.length === 1 ? "сесія чекає" : "сесій чекають"} на відповідь
            </h3>
            <p className="text-xs text-amber-800/80 mt-0.5">
              Відкрийте «Лайв-чат» — клієнти написали повідомлення, на яке поки немає відповіді понад 5 хвилин.
            </p>
          </div>
          <a
            href="/admin/chat"
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
          >
            Відкрити чат
          </a>
        </div>
      )}

      {/* ===== Top-level KPIs ===== */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={<TrendingUp size={18} />} label="Дохід (pipeline)" value={formatUAH(totalRevenue)} hint={`Виконано: ${formatUAH(completedRevenue)}`} />
        <Kpi icon={<Package size={18} />} label="Замовлень" value={filtered.length} hint={`Нових: ${byStatus.new} · В роботі: ${byStatus.in_progress}`} />
        <Kpi icon={<Users size={18} />} label="Клієнтів" value={uniqueClients} hint={repeatClients.repeat > 0 ? `Повторних: ${repeatClients.repeat} (${repeatClients.rate}%)` : "Усі вперше"} />
        <Kpi icon={<CheckCircle2 size={18} />} label="Середній чек" value={formatUAH(avgOrder)} hint="Базується на «від» цінах" />
      </div>

      {/* ===== Real-time KPIs (chat / subscribers) ===== */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={<MessageCircle size={18} />}
          label="Активних чат-сесій"
          value={chatSessions.length}
          hint={chatToOrderSessions > 0 ? `${chatToOrderSessions} стали замовленнями` : "Real-time"}
          tone={unrepliedSessions.length > 0 ? "warn" : "default"}
        />
        <Kpi
          icon={<Mail size={18} />}
          label="Підписників"
          value={subscribers.filter((s) => s.status === "active").length}
          hint={`Всього у базі: ${subscribers.length}`}
        />
        <Kpi
          icon={<Clock size={18} />}
          label="Сер. час відповіді"
          value={avgResponseTime !== null ? `${avgResponseTime} хв` : "—"}
          hint={avgResponseTime !== null && avgResponseTime <= 5 ? "🟢 Швидко" : avgResponseTime !== null && avgResponseTime <= 30 ? "🟡 Норма" : "🔴 Повільно"}
        />
        <Kpi
          icon={<Activity size={18} />}
          label="Пік активності"
          value={`${peakHour}:00`}
          hint={`Найбільше заявок між ${peakHour}:00 і ${(peakHour + 1) % 24}:00`}
        />
      </div>

      {/* ===== Conversion funnel (30 days) ===== */}
      <section className="rounded-2xl border border-foreground/10 bg-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Воронка конверсії (за 30 днів)
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Чат-сесії → заявки → виконано. Допомагає зрозуміти на якому етапі втрачаєте клієнтів.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <FunnelStep
            label="Чат-сесії"
            value={recentChats}
            total={recentChats || 1}
            color="bg-blue-500"
            hint="100% — точка входу"
          />
          <FunnelStep
            label="Заявки"
            value={recentOrders}
            total={recentChats || 1}
            color="bg-accent"
            hint={`Конверсія: ${funnelChatToOrder}%`}
          />
          <FunnelStep
            label="Виконані"
            value={recentCompleted}
            total={recentChats || 1}
            color="bg-success"
            hint={`Виконання: ${funnelOrderToDone}% від заявок`}
          />
        </div>
      </section>

      {/* ===== Revenue timeline + Status =====
         RevenueByDays is self-contained: owns its own period selector,
         skeleton/empty/data states, and proper Recharts BarChart with
         axes + tooltip. The old inline grey-block bar chart was the
         source of the "broken" look in the screenshot. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RevenueByDays orders={orders} loading={ordersLoading} />

        <div className="rounded-2xl border border-foreground/10 bg-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Статуси
          </h2>
          <div className="mt-4 space-y-3">
            <StatusBar label="Нові" value={byStatus.new} total={filtered.length} color="bg-accent" />
            <StatusBar label="В обробці" value={byStatus.in_progress} total={filtered.length} color="bg-amber-500" />
            <StatusBar label="Завершені" value={byStatus.completed} total={filtered.length} color="bg-success" />
          </div>
          <div className="mt-6 border-t border-foreground/5 pt-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              За категорією
            </h3>
            <div className="mt-3 space-y-2">
              {Object.entries(byCategory).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {k === "memorial" ? "Пам'ятники" : "Дім і сад"}
                  </span>
                  <span className="font-medium tabular-nums">{v}</span>
                </div>
              ))}
              {Object.keys(byCategory).length === 0 && (
                <p className="text-sm text-muted-foreground">—</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Time patterns ===== */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-foreground/10 bg-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Розподіл за годинами доби
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Коли клієнти найчастіше залишають заявки — корисно для розкладу менеджерів.
          </p>
          <div className="mt-5 flex h-32 items-end gap-0.5">
            {hourlyPattern.map((c, h) => (
              <div
                key={h}
                className={cn(
                  "group relative flex-1 rounded-t-sm transition-colors",
                  h === peakHour ? "bg-accent" : "bg-foreground/30 hover:bg-foreground/50"
                )}
                style={{ height: `${Math.max(2, (c / maxHourly) * 100)}%` }}
                title={`${h}:00 — ${c} замовлень`}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>
        </section>

        <section className="rounded-2xl border border-foreground/10 bg-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Розподіл за днями тижня
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            На які дні припадає більшість запитів.
          </p>
          <div className="mt-5 flex h-32 items-end gap-1.5">
            {weekdayPattern.map((c, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-full rounded-t-md transition-colors",
                    i >= 5 ? "bg-foreground/40" : "bg-foreground/70"
                  )}
                  style={{ height: `${Math.max(2, (c / maxWeekday) * 100)}%` }}
                  title={`${weekdayLabels[i]}: ${c}`}
                />
                <span className="text-[10px] text-muted-foreground">{weekdayLabels[i]}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ===== Локалі ===== */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-foreground/10 bg-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <Globe size={14} /> Підписники за мовами
          </h2>
          {subscribersByLocale.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Поки немає підписників</p>
          ) : (
            <div className="mt-4 space-y-2">
              {subscribersByLocale.map(([loc, count]) => (
                <LocaleBar key={loc} loc={loc} count={count} total={subscribers.filter((s) => s.status === "active").length} />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-foreground/10 bg-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <MessageCircle size={14} /> Чат-сесії за мовами
          </h2>
          {chatByLocale.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Поки немає чат-сесій</p>
          ) : (
            <div className="mt-4 space-y-2">
              {chatByLocale.map(([loc, count]) => (
                <LocaleBar key={loc} loc={loc} count={count} total={chatSessions.length} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ===== Топ товарів і повторні клієнти ===== */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-foreground/10 bg-card p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            ТОП-10 товарів
          </h2>
          {topItems.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Немає даних</p>
          ) : (
            <div className="mt-4 divide-y divide-foreground/5">
              {topItems.map(([id, v], i) => (
                <div key={id} className="flex items-center gap-4 py-3">
                  <span className="w-6 text-xs text-muted-foreground">#{i + 1}</span>
                  <span className="font-medium tabular-nums">№ {id}</span>
                  <div className="ml-auto flex items-center gap-6 text-sm">
                    <span className="text-muted-foreground">{v.count} замовлень</span>
                    <span className="font-medium tabular-nums">{formatUAH(v.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-foreground/10 bg-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <Repeat size={14} /> Лояльність
          </h2>
          <div className="mt-5 space-y-4">
            <div>
              <div className="text-3xl font-semibold tabular-nums">{repeatClients.rate}%</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Клієнтів, що повертаються
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Усього клієнтів: <span className="font-medium text-foreground">{repeatClients.total}</span></div>
              <div>Повторні: <span className="font-medium text-foreground">{repeatClients.repeat}</span></div>
              <div>Single-purchase: <span className="font-medium text-foreground">{repeatClients.total - repeatClients.repeat}</span></div>
            </div>
            <div className="rounded-xl bg-foreground/[0.03] p-3 text-xs text-muted-foreground">
              💡 У сегменті меморіальних виробів повторні замовлення рідкісні (раз у житті).
              У сегменті «дім і сад» — часті (стільниці + підвіконня + сходи від одного клієнта).
            </div>
          </div>
        </section>
      </div>

      {/* ===== Активні чат-сесії (real-time) ===== */}
      {chatSessions.length > 0 && (
        <section className="rounded-2xl border border-foreground/10 bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <Activity size={14} /> Останні чат-сесії
            </h2>
            <a href="/admin/chat" className="text-xs text-accent hover:underline">
              Відкрити всі →
            </a>
          </div>
          <div className="divide-y divide-foreground/5">
            {chatSessions.slice(0, 5).map((s) => {
              const isUnreplied = unrepliedSessions.some((u) => u.sessionId === s.sessionId)
              return (
                <div key={s.sessionId} className="flex items-center gap-3 py-3">
                  <span className="text-xl" aria-hidden>{localeFlag[s.locale] || "🌐"}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{s.name || "Гість"}</span>
                      {isUnreplied && (
                        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                          чекає відповіді
                        </span>
                      )}
                    </div>
                    {s.phone && (
                      <a
                        href={`tel:${s.phone.replace(/\s+/g, "")}`}
                        className="text-xs text-accent hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <Phone size={10} /> {s.phone}
                      </a>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground tabular-nums">
                    {formatRelative(s.lastUserAt)}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

function Kpi({
  icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  hint?: string
  tone?: "default" | "warn" | "success"
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        tone === "warn" ? "border-amber-500/30 bg-amber-500/5" : "border-foreground/10 bg-card"
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-3 text-2xl font-semibold tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  )
}

function StatusBar({
  label,
  value,
  total,
  color,
}: {
  label: string
  value: number
  total: number
  color: string
}) {
  const pct = total ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">
          {value} <span className="text-muted-foreground">· {pct}%</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-foreground/5">
        <div className={cn("h-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function FunnelStep({
  label,
  value,
  total,
  color,
  hint,
}: {
  label: string
  value: number
  total: number
  color: string
  hint?: string
}) {
  const pct = total ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums">
          <span className="font-semibold">{value}</span>
          <span className="ml-2 text-xs text-muted-foreground">{hint}</span>
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-foreground/5">
        <div className={cn("h-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function LocaleBar({ loc, count, total }: { loc: string; count: number; total: number }) {
  const pct = total ? Math.round((count / total) * 100) : 0
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <span aria-hidden>{localeFlag[loc] || "🌐"}</span>
          <span>{localeName[loc] || loc.toUpperCase()}</span>
        </span>
        <span className="font-medium tabular-nums">
          {count} <span className="text-muted-foreground">· {pct}%</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-foreground/5">
        <div className="h-full bg-foreground/60 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
