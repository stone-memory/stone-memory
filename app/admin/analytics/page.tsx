"use client"

import { useMemo, useState } from "react"
import { Calendar, TrendingUp, Package, Users, CheckCircle2 } from "lucide-react"
import { useOrdersStore } from "@/lib/store/orders"
import { cn } from "@/lib/utils"

type Period = "7d" | "30d" | "90d" | "ytd" | "all"

const PERIODS: { key: Period; label: string; days: number | null }[] = [
  { key: "7d", label: "7 днів", days: 7 },
  { key: "30d", label: "30 днів", days: 30 },
  { key: "90d", label: "90 днів", days: 90 },
  { key: "ytd", label: "З початку року", days: null },
  { key: "all", label: "Увесь час", days: null },
]

function startOf(period: Period): Date | null {
  const now = new Date()
  if (period === "all") return null
  if (period === "ytd") return new Date(now.getFullYear(), 0, 1)
  const p = PERIODS.find((x) => x.key === period)
  if (!p?.days) return null
  const d = new Date(now)
  d.setDate(d.getDate() - p.days)
  return d
}

export default function AnalyticsPage() {
  const orders = useOrdersStore((s) => s.orders)
  const [period, setPeriod] = useState<Period>("30d")

  const from = useMemo(() => startOf(period), [period])

  const filtered = useMemo(
    () => orders.filter((o) => !from || new Date(o.createdAt) >= from),
    [orders, from]
  )

  const totalRevenue = filtered.reduce(
    (sum, o) => sum + o.items.reduce((a, i) => a + i.priceFrom, 0),
    0
  )
  const completed = filtered.filter((o) => o.status === "completed").length
  const avgOrder = filtered.length ? Math.round(totalRevenue / filtered.length) : 0
  const uniqueClients = new Set(filtered.map((o) => o.phone)).size

  const byStatus = {
    new: filtered.filter((o) => o.status === "new").length,
    in_progress: filtered.filter((o) => o.status === "in_progress").length,
    completed,
  }

  const byCategory = filtered.reduce(
    (acc, o) => {
      for (const i of o.items) {
        acc[i.category] = (acc[i.category] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>
  )

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

  // Daily timeline
  const timeline = useMemo(() => {
    const days = Math.max(
      1,
      from ? Math.ceil((Date.now() - from.getTime()) / 86400000) : 90
    )
    const buckets: Record<string, { count: number; revenue: number }> = {}
    for (const o of filtered) {
      const d = new Date(o.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      if (!buckets[key]) buckets[key] = { count: 0, revenue: 0 }
      buckets[key].count++
      buckets[key].revenue += o.items.reduce((a, i) => a + i.priceFrom, 0)
    }
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-Math.min(days, 30))
  }, [filtered, from])

  const maxRev = Math.max(1, ...timeline.map(([, v]) => v.revenue))

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight-custom">Аналітика</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} замовлень за вибраний період · оновлюється в реальному часі
          </p>
        </div>
        <div className="flex gap-1 rounded-full bg-foreground/5 p-1">
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={<TrendingUp size={18} />} label="Дохід" value={`€ ${totalRevenue.toLocaleString("uk-UA")}`} />
        <Kpi icon={<Package size={18} />} label="Замовлень" value={filtered.length} />
        <Kpi icon={<Users size={18} />} label="Клієнтів" value={uniqueClients} />
        <Kpi icon={<CheckCircle2 size={18} />} label="Середній чек" value={`€ ${avgOrder.toLocaleString("uk-UA")}`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-foreground/10 bg-card p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Дохід за днями
            </h2>
            <span className="text-xs text-muted-foreground">{timeline.length} днів</span>
          </div>
          {timeline.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Немає даних за вибраний період
            </div>
          ) : (
            <div className="flex h-48 items-end gap-1">
              {timeline.map(([key, v]) => (
                <div
                  key={key}
                  className="group relative flex-1 rounded-t-sm bg-foreground/70 transition-colors hover:bg-foreground"
                  style={{ height: `${Math.max(2, (v.revenue / maxRev) * 100)}%` }}
                  title={`${key}: € ${v.revenue.toLocaleString("uk-UA")} (${v.count})`}
                >
                  <span className="absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[10px] font-medium text-background group-hover:block">
                    € {v.revenue}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-foreground/10 bg-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Статуси
          </h2>
          <div className="mt-4 space-y-3">
            <StatusBar label="Нові" value={byStatus.new} total={filtered.length} color="bg-accent" />
            <StatusBar label="В обробці" value={byStatus.in_progress} total={filtered.length} color="bg-[#F59E0B]" />
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

      <div className="rounded-2xl border border-foreground/10 bg-card p-6">
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
                  <span className="font-medium tabular-nums">€ {v.revenue.toLocaleString("uk-UA")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-3 text-3xl font-semibold tabular-nums">{value}</div>
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
