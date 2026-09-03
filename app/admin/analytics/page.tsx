"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  TrendingUp,
  Banknote,
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
  Trophy,
  Layers,
  XCircle,
} from "lucide-react"
import { useDealsStore } from "@/lib/crm/store"
import {
  DEAL_STATUS_TO_LANE,
  type Deal,
  type DealLane,
} from "@/lib/crm/types"
import { authedFetch } from "@/lib/authed-fetch"
import { formatUAHDirect, formatRelative, pluralUk } from "@/lib/admin-format"
import { cn } from "@/lib/utils"

// Sample-size thresholds for chart confidence captions. Under 10 deals a
// peak-hour spike is almost certainly random; 20+ starts to be a pattern.
const LOW_DATA_THRESHOLD = 10
const TARGET_DATA_THRESHOLD = 20

function dealsLabel(n: number): string {
  return `${n} ${pluralUk(n, "угоди", "угод", "угод")}`
}

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

// Deal as returned by GET /api/crm/deals — includes the joined customer.
type DealRow = Deal & {
  customers?: {
    id: string
    name: string | null
    phone: string | null
    email: string | null
    locale: string | null
    city: string | null
  } | null
}

const LANE_LABELS: Record<DealLane, string> = {
  lead: "Ліди",
  discovery: "Виявлення потреб",
  agreement: "Договір",
  production: "Виробництво",
  fulfillment: "Видача",
  closed: "Закриті",
  paused: "Пауза",
}
const LANE_ORDER: DealLane[] = [
  "lead",
  "discovery",
  "agreement",
  "production",
  "fulfillment",
  "paused",
  "closed",
]

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
  const dealsRaw = useDealsStore((s) => s.items) as DealRow[]
  const dealsLoading = useDealsStore((s) => s.loading)
  const loadDeals = useDealsStore((s) => s.load)
  const [period, setPeriod] = useState<Period>("30d")
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now())

  useEffect(() => {
    loadDeals()
  }, [loadDeals])

  // Real-time: чат-сесії і підписники раз на хвилину
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

  const deals = useMemo(
    () => dealsRaw.filter((d) => !from || new Date(d.created_at) >= from),
    [dealsRaw, from]
  )

  // ===== Money KPIs =====
  const isClosedNeg = (s: Deal["status"]) => s === "cancelled" || s === "lost"
  const pipelineOpen = deals
    .filter((d) => d.status !== "completed" && !isClosedNeg(d.status))
    .reduce((sum, d) => sum + (d.amount_eur || 0), 0)
  const completedDeals = deals.filter((d) => d.status === "completed")
  const completedRevenue = completedDeals.reduce((s, d) => s + (d.amount_eur || 0), 0)
  const paidTotal = deals.reduce((s, d) => s + (d.paid_eur || 0), 0)
  const avgDeal = deals.length
    ? Math.round(deals.reduce((s, d) => s + (d.amount_eur || 0), 0) / deals.length)
    : 0
  const uniqueClients = new Set(deals.map((d) => d.customer_id)).size

  // ===== Win-rate & середній цикл =====
  const lostDeals = deals.filter((d) => isClosedNeg(d.status))
  const decided = completedDeals.length + lostDeals.length
  const winRate = decided > 0 ? Math.round((completedDeals.length / decided) * 100) : 0
  const avgCycleDays = useMemo(() => {
    const samples: number[] = []
    for (const d of completedDeals) {
      if (!d.completed_at) continue
      const ms = new Date(d.completed_at).getTime() - new Date(d.created_at).getTime()
      if (ms > 0) samples.push(ms)
    }
    if (samples.length === 0) return null
    const avg = samples.reduce((a, b) => a + b, 0) / samples.length
    return Math.round(avg / 86_400_000) // днів
  }, [completedDeals])

  // ===== Воронка угод (за 30 днів) =====
  const funnelFrom = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.getTime()
  }, [])
  const recentDeals = dealsRaw.filter(
    (d) => new Date(d.created_at).getTime() >= funnelFrom
  )
  const recentCreated = recentDeals.length
  const recentContracted = recentDeals.filter((d) => d.contract_signed_at != null).length
  const recentDone = recentDeals.filter((d) => d.status === "completed").length
  const recentChats = chatSessions.filter((s) => s.lastUserAt >= funnelFrom).length
  const fChatToDeal = recentChats > 0 ? Math.round((recentCreated / recentChats) * 100) : 0
  const fDealToContract =
    recentCreated > 0 ? Math.round((recentContracted / recentCreated) * 100) : 0
  const fContractToDone =
    recentContracted > 0 ? Math.round((recentDone / recentContracted) * 100) : 0

  // ===== Пайплайн по стадіях (lane) =====
  const byLane = useMemo(() => {
    const m = new Map<DealLane, { count: number; amount: number }>()
    for (const d of deals) {
      const lane = DEAL_STATUS_TO_LANE[d.status]
      const cur = m.get(lane) || { count: 0, amount: 0 }
      cur.count++
      cur.amount += d.amount_eur || 0
      m.set(lane, cur)
    }
    return m
  }, [deals])

  // ===== Причини втрат =====
  const lossReasons = useMemo(() => {
    const m: Record<string, number> = {}
    for (const d of lostDeals) {
      const key = (d.lost_reason || "").trim() || "Не вказано"
      m[key] = (m[key] || 0) + 1
    }
    return Object.entries(m).sort((a, b) => b[1] - a[1])
  }, [lostDeals])

  // ===== Джерела =====
  const bySource = useMemo(() => {
    const m: Record<string, number> = {}
    for (const d of deals) {
      const key = (d.source || "").trim() || "—"
      m[key] = (m[key] || 0) + 1
    }
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [deals])

  // ===== Категорії =====
  const byCategory = useMemo(() => {
    const m: Record<string, number> = {}
    for (const d of deals) {
      const key = (d.category || "").trim() || "—"
      m[key] = (m[key] || 0) + 1
    }
    return Object.entries(m).sort((a, b) => b[1] - a[1])
  }, [deals])

  // ===== Менеджери =====
  const byAssignee = useMemo(() => {
    const m: Record<string, { count: number; amount: number }> = {}
    for (const d of deals) {
      const key = d.assigned_to || "Не призначено"
      if (!m[key]) m[key] = { count: 0, amount: 0 }
      m[key].count++
      m[key].amount += d.amount_eur || 0
    }
    return Object.entries(m).sort((a, b) => b[1].count - a[1].count)
  }, [deals])

  // ===== Виторг виконаних — останні 14 днів =====
  const revenueByDay = useMemo(() => {
    const days: { label: string; revenue: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - i)
      const next = new Date(d)
      next.setDate(next.getDate() + 1)
      const rev = dealsRaw
        .filter(
          (x) =>
            x.status === "completed" &&
            x.completed_at &&
            new Date(x.completed_at) >= d &&
            new Date(x.completed_at) < next
        )
        .reduce((s, x) => s + (x.amount_eur || 0), 0)
      days.push({ label: `${d.getDate()}.${d.getMonth() + 1}`, revenue: rev })
    }
    return days
  }, [dealsRaw])
  const maxRevDay = Math.max(1, ...revenueByDay.map((d) => d.revenue))

  // ===== Час доби / день тижня (по created_at угод) =====
  const hourlyPattern = useMemo(() => {
    const hours = Array.from({ length: 24 }, () => 0)
    for (const d of deals) hours[new Date(d.created_at).getHours()]++
    return hours
  }, [deals])
  const peakHour = hourlyPattern.indexOf(Math.max(...hourlyPattern))
  const maxHourly = Math.max(1, ...hourlyPattern)

  const weekdayPattern = useMemo(() => {
    const map = [0, 0, 0, 0, 0, 0, 0]
    for (const d of deals) map[new Date(d.created_at).getDay()]++
    return [map[1], map[2], map[3], map[4], map[5], map[6], map[0]]
  }, [deals])
  const weekdayLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"]
  const maxWeekday = Math.max(1, ...weekdayPattern)

  // ===== Лояльність (повторні клієнти по угодах) =====
  const repeatClients = useMemo(() => {
    const byCust: Record<string, number> = {}
    for (const d of dealsRaw) byCust[d.customer_id] = (byCust[d.customer_id] || 0) + 1
    const total = Object.keys(byCust).length
    const repeat = Object.values(byCust).filter((n) => n > 1).length
    return { total, repeat, rate: total > 0 ? Math.round((repeat / total) * 100) : 0 }
  }, [dealsRaw])

  // ===== Локалі =====
  const subscribersByLocale = useMemo(() => {
    const map: Record<string, number> = {}
    for (const s of subscribers) {
      if (s.status !== "active") continue
      map[s.locale] = (map[s.locale] || 0) + 1
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [subscribers])

  const dealsByLocale = useMemo(() => {
    const map: Record<string, number> = {}
    for (const d of deals) {
      const loc = d.customers?.locale || "uk"
      map[loc] = (map[loc] || 0) + 1
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [deals])

  // ===== Чат: швидкість відповіді / без відповіді =====
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
    return Math.round(avg / 60_000)
  }, [chatSessions])

  const unrepliedSessions = chatSessions.filter((s) => {
    const lastUser = s.userMessages[s.userMessages.length - 1]
    if (!lastUser) return false
    const lastOp = s.operatorMessages[s.operatorMessages.length - 1]
    if (lastOp && lastOp.at > lastUser.at) return false
    const age = Date.now() - lastUser.at
    return age > 5 * 60_000 && age < 24 * 60 * 60_000
  })

  const periodLabel = PERIODS.find((p) => p.key === period)?.label || ""

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight-custom">Аналітика</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {deals.length} угод за вибраний період · оновлено {formatRelative(lastRefresh)}
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

      {unrepliedSessions.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-900">
              {unrepliedSessions.length}{" "}
              {unrepliedSessions.length === 1 ? "сесія чекає" : "сесій чекають"} на відповідь
            </h3>
            <p className="text-xs text-amber-800/80 mt-0.5">
              Відкрийте «Лайв-чат» — є повідомлення без відповіді понад 5 хвилин.
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

      {/* ===== Money KPIs ===== */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={<TrendingUp size={18} />} label="Pipeline (відкриті)" value={formatUAHDirect(pipelineOpen)} hint={`Виторг виконаних: ${formatUAHDirect(completedRevenue)}`} />
        <Kpi icon={<Banknote size={18} />} label="Отримано (оплати)" value={formatUAHDirect(paidTotal)} hint="Сума paid по угодах періоду" />
        <Kpi icon={<Layers size={18} />} label="Угод" value={deals.length} hint={`Виконано: ${completedDeals.length} · Втрачено: ${lostDeals.length}`} />
        <Kpi icon={<CheckCircle2 size={18} />} label="Середній чек" value={formatUAHDirect(avgDeal)} hint="Середній чек угод за період" />
      </div>

      {/* ===== Deal KPIs ===== */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={<Trophy size={18} />} label="Win-rate" value={`${winRate}%`} hint={`Виграно ${completedDeals.length} з ${decided} вирішених`} tone={winRate >= 50 ? "success" : "default"} />
        <Kpi icon={<Users size={18} />} label="Клієнтів" value={uniqueClients} hint={repeatClients.repeat > 0 ? `Повторних: ${repeatClients.repeat} (${repeatClients.rate}%)` : "Усі вперше"} />
        <Kpi icon={<Clock size={18} />} label="Сер. цикл угоди" value={avgCycleDays !== null ? `${avgCycleDays} дн` : "—"} hint="Створено → Виконано" />
        <Kpi icon={<MessageCircle size={18} />} label="Активних чат-сесій" value={chatSessions.length} hint={avgResponseTime !== null ? `Відповідь ~${avgResponseTime} хв` : "Real-time"} tone={unrepliedSessions.length > 0 ? "warn" : "default"} />
      </div>

      {/* ===== Воронка ===== */}
      <section className="rounded-2xl border border-foreground/10 bg-card p-6">
        <div className="mb-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Воронка угод (за 30 днів)
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Чат-сесії → угоди → договір → виконано. Видно, де втрачаються клієнти.
          </p>
        </div>
        <div className="space-y-4">
          <FunnelStep label="Чат-сесії" value={recentChats} total={recentChats || 1} color="bg-blue-500" hint="точка входу" />
          <FunnelStep label="Створено угод" value={recentCreated} total={recentChats || 1} color="bg-accent" hint={`Конверсія з чату: ${fChatToDeal}%`} />
          <FunnelStep label="Договір підписано" value={recentContracted} total={recentChats || 1} color="bg-amber-500" hint={`${fDealToContract}% від угод`} />
          <FunnelStep label="Виконано" value={recentDone} total={recentChats || 1} color="bg-success" hint={`${fContractToDone}% від договорів · win-rate ${winRate}%`} />
        </div>
      </section>

      {/* ===== Виторг по днях + Пайплайн ===== */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-foreground/10 bg-card p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Виторг виконаних угод — 14 днів
          </h2>
          <div className="mt-4 flex h-40 items-end gap-1.5">
            {revenueByDay.map((d, i) => {
              const has = d.revenue > 0
              return (
                <div key={i} className="flex flex-1 flex-col justify-end gap-1">
                  <div className="relative w-full" style={{ height: "100%" }}>
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-foreground/15" />
                    <div
                      className={cn(
                        "absolute bottom-0 left-0 right-0 rounded-t-md transition-colors",
                        has ? "bg-success/70 hover:bg-success" : "bg-transparent"
                      )}
                      style={{ height: has ? `${Math.max(8, (d.revenue / maxRevDay) * 100)}%` : "0" }}
                      title={`${d.label}: ${formatUAHDirect(d.revenue)}`}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground text-center">{d.label}</span>
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-foreground/10 bg-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Пайплайн по стадіях
          </h2>
          <div className="mt-4 space-y-3">
            {LANE_ORDER.map((lane) => {
              const v = byLane.get(lane)
              if (!v) return null
              return (
                <StatusBar
                  key={lane}
                  label={LANE_LABELS[lane]}
                  value={v.count}
                  total={deals.length}
                  color={lane === "closed" ? "bg-success" : lane === "paused" ? "bg-amber-500" : "bg-accent"}
                  suffix={formatUAHDirect(v.amount)}
                />
              )
            })}
            {byLane.size === 0 && <p className="text-sm text-muted-foreground">—</p>}
          </div>
        </section>
      </div>

      {/* ===== Час доби / день тижня ===== */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-foreground/10 bg-card p-6">
          <header>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Розподіл за годинами доби
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Коли найчастіше зʼявляються нові угоди — для розкладу менеджерів.
            </p>
            <SampleSizeCaption count={deals.length} periodLabel={periodLabel} />
          </header>
          <div className="mt-4 flex h-32 items-end gap-0.5 border-b border-foreground/10">
            {hourlyPattern.map((c, h) => {
              const hasData = c > 0
              return (
                <div
                  key={h}
                  className={cn(
                    "group relative flex-1 rounded-t-sm transition-colors",
                    !hasData ? "bg-foreground/10" : h === peakHour ? "bg-accent" : "bg-foreground/30 hover:bg-foreground/50"
                  )}
                  style={{ height: hasData ? `${Math.max(6, (c / maxHourly) * 100)}%` : "1px" }}
                  title={`${h}:00 — ${c === 0 ? "0 угод" : dealsLabel(c)}`}
                />
              )
            })}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
          </div>
        </section>

        <section className="rounded-2xl border border-foreground/10 bg-card p-6">
          <header>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Розподіл за днями тижня
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">На які дні припадає більшість угод.</p>
            <SampleSizeCaption count={deals.length} periodLabel={periodLabel} />
          </header>
          <div className="mt-4 flex h-32 items-end gap-1.5">
            {weekdayPattern.map((c, i) => {
              const hasData = c > 0
              return (
                <div key={i} className="flex flex-1 flex-col justify-end gap-1">
                  <div className="relative w-full" style={{ height: "100%" }}>
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-foreground/15" />
                    <div
                      className={cn(
                        "absolute bottom-0 left-0 right-0 rounded-t-md transition-colors",
                        !hasData ? "bg-transparent" : i >= 5 ? "bg-foreground/40" : "bg-foreground/70"
                      )}
                      style={{ height: hasData ? `${Math.max(8, (c / maxWeekday) * 100)}%` : "0" }}
                      title={`${weekdayLabels[i]}: ${dealsLabel(c)}`}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground text-center">{weekdayLabels[i]}</span>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {/* ===== Джерела / Причини втрат ===== */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-foreground/10 bg-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Джерела угод
          </h2>
          <div className="mt-4 space-y-3">
            {bySource.length === 0 ? (
              <p className="text-sm text-muted-foreground">Немає даних</p>
            ) : (
              bySource.map(([src, n]) => (
                <StatusBar key={src} label={src} value={n} total={deals.length} color="bg-accent" />
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-foreground/10 bg-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <XCircle size={14} /> Причини втрат
          </h2>
          <div className="mt-4 space-y-3">
            {lossReasons.length === 0 ? (
              <p className="text-sm text-muted-foreground">Втрачених угод немає 🎉</p>
            ) : (
              lossReasons.map(([reason, n]) => (
                <StatusBar key={reason} label={reason} value={n} total={lostDeals.length} color="bg-red-500" />
              ))
            )}
          </div>
        </section>
      </div>

      {/* ===== Категорії / Менеджери ===== */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-foreground/10 bg-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            За категорією
          </h2>
          <div className="mt-4 space-y-2">
            {byCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground">—</p>
            ) : (
              byCategory.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {k === "memorial" ? "Памʼятники" : k}
                  </span>
                  <span className="font-medium tabular-nums">{v}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-foreground/10 bg-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Менеджери
          </h2>
          <div className="mt-4 space-y-3">
            {byAssignee.length === 0 ? (
              <p className="text-sm text-muted-foreground">—</p>
            ) : (
              byAssignee.map(([who, v]) => (
                <StatusBar
                  key={who}
                  label={who === "Не призначено" ? who : who.slice(0, 8)}
                  value={v.count}
                  total={deals.length}
                  color="bg-accent"
                  suffix={formatUAHDirect(v.amount)}
                />
              ))
            )}
          </div>
        </section>
      </div>

      {/* ===== Локалі ===== */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-foreground/10 bg-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <Globe size={14} /> Угоди за мовами клієнта
          </h2>
          {dealsByLocale.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Немає даних</p>
          ) : (
            <div className="mt-4 space-y-2">
              {dealsByLocale.map(([loc, count]) => (
                <LocaleBar key={loc} loc={loc} count={count} total={deals.length} />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-foreground/10 bg-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <Mail size={14} /> Підписники за мовами
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
      </div>

      {/* ===== Лояльність ===== */}
      <section className="rounded-2xl border border-foreground/10 bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
          <Repeat size={14} /> Лояльність
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <div className="text-3xl font-semibold tabular-nums">{repeatClients.rate}%</div>
            <div className="mt-1 text-xs text-muted-foreground">Клієнтів, що повертаються</div>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Усього клієнтів: <span className="font-medium text-foreground">{repeatClients.total}</span></div>
            <div>Повторні: <span className="font-medium text-foreground">{repeatClients.repeat}</span></div>
            <div>Одна угода: <span className="font-medium text-foreground">{repeatClients.total - repeatClients.repeat}</span></div>
          </div>
          <div className="rounded-xl bg-foreground/[0.03] p-3 text-xs text-muted-foreground">
            💡 У меморіальному сегменті повторні угоди рідкісні — родина замовляє раз. Цінність тут у рекомендаціях, а не в повторних покупках.
          </div>
        </div>
      </section>

      {/* ===== Останні чат-сесії ===== */}
      {chatSessions.length > 0 && (
        <section className="rounded-2xl border border-foreground/10 bg-card p-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <Activity size={14} /> Останні чат-сесії
            </h2>
            <Link href="/admin/inbox" className="text-xs text-accent hover:underline">
              Відкрити всі →
            </Link>
          </div>
          <ul className="divide-y divide-foreground/5">
            {chatSessions.slice(0, 5).map((s) => {
              const isUnreplied = unrepliedSessions.some((u) => u.sessionId === s.sessionId)
              const threadKey = `site_chat:${s.sessionId}`
              return (
                <li key={s.sessionId}>
                  <Link
                    href={`/admin/inbox?thread=${encodeURIComponent(threadKey)}`}
                    className="flex items-center gap-3 py-3 px-2 -mx-2 rounded-xl transition-colors hover:bg-foreground/[0.03]"
                  >
                    <span className="text-xl" aria-hidden>{localeFlag[s.locale] || "🌐"}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{s.name || "Гість"}</span>
                        {isUnreplied && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-600" />
                            </span>
                            чекає відповіді
                          </span>
                        )}
                      </div>
                      {s.phone && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            window.location.href = `tel:${s.phone!.replace(/\s+/g, "")}`
                          }}
                          className="text-xs text-accent hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Phone size={10} /> {s.phone}
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                      {formatRelative(s.lastUserAt)}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {dealsLoading && dealsRaw.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">Завантаження угод…</p>
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
        tone === "warn"
          ? "border-amber-500/30 bg-amber-500/5"
          : tone === "success"
            ? "border-success/30 bg-success/5"
            : "border-foreground/10 bg-card"
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
  suffix,
}: {
  label: string
  value: number
  total: number
  color: string
  suffix?: string
}) {
  const pct = total ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-muted-foreground truncate pr-2">{label}</span>
        <span className="font-medium tabular-nums whitespace-nowrap">
          {value} <span className="text-muted-foreground">· {pct}%</span>
          {suffix && <span className="ml-2 text-muted-foreground">{suffix}</span>}
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

function SampleSizeCaption({ count, periodLabel }: { count: number; periodLabel: string }) {
  const period = periodLabel.toLowerCase()
  if (count === 0) {
    return (
      <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.04] px-2.5 py-0.5 text-[11px] text-muted-foreground">
        <AlertCircle size={11} /> Поки немає угод за «{period}» — графік оживе як тільки прийде перша.
      </p>
    )
  }
  if (count < LOW_DATA_THRESHOLD) {
    return (
      <p className="mt-2 inline-flex items-start gap-1.5 rounded-md bg-amber-500/10 px-2.5 py-1 text-[11px] leading-snug text-amber-700 dark:text-amber-300">
        <AlertCircle size={11} className="mt-0.5 shrink-0" />
        <span>
          На основі <span className="font-medium">{dealsLabel(count)}</span> — потрібно більше даних
          {count < TARGET_DATA_THRESHOLD && (
            <> (графік стає інформативним після {TARGET_DATA_THRESHOLD}+).</>
          )}
        </span>
      </p>
    )
  }
  return (
    <p className="mt-2 text-[11px] text-muted-foreground">
      Аналіз на основі <span className="font-medium text-foreground">{dealsLabel(count)}</span> за «{period}».
    </p>
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
