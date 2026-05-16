"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts"
import { BarChart3, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatUAH, pluralizeDays, ADMIN_LOCALE } from "@/lib/admin-format"
import type { Order } from "@/lib/types"

/**
 * Revenue-by-day chart for the analytics page.
 *
 * Three states:
 *   - loading    → Skeleton (NOT a flat grey square — that's what we
 *                  used to ship and looked broken)
 *   - empty      → big chart-icon + clear "no data" message + CTA to
 *                  create the first deal
 *   - data       → Recharts <BarChart> with proper axes and a Tooltip
 *
 * Period selector lives inside the card (independent from the page-
 * level period filter) — usage research: people often want a different
 * window for the chart than for the KPI cards above.
 */

type Window = "7d" | "30d" | "90d" | "ytd"

const WINDOWS: { key: Window; label: string }[] = [
  { key: "7d", label: "7 днів" },
  { key: "30d", label: "30 днів" },
  { key: "90d", label: "90 днів" },
  { key: "ytd", label: "Цей рік" },
]

type Bucket = { date: string; revenue: number; count: number; label: string }

function startOf(window: Window): Date {
  const d = new Date()
  if (window === "ytd") return new Date(d.getFullYear(), 0, 1)
  const days = window === "7d" ? 7 : window === "30d" ? 30 : 90
  const out = new Date(d)
  out.setDate(out.getDate() - days)
  out.setHours(0, 0, 0, 0)
  return out
}

const SHORT_DATE = new Intl.DateTimeFormat(ADMIN_LOCALE, {
  day: "numeric",
  month: "short",
})

export function RevenueByDays({
  orders,
  loading,
}: {
  orders: Order[]
  loading: boolean
}) {
  const [window, setWindow] = useState<Window>("30d")

  const buckets = useMemo<Bucket[]>(() => {
    const from = startOf(window)
    const map = new Map<string, { revenue: number; count: number }>()
    for (const o of orders) {
      const t = new Date(o.createdAt)
      if (t < from) continue
      const key = t.toISOString().slice(0, 10) // YYYY-MM-DD
      const existing = map.get(key) ?? { revenue: 0, count: 0 }
      existing.revenue += o.items.reduce((a, i) => a + i.priceFrom, 0)
      existing.count += 1
      map.set(key, existing)
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({
        date,
        revenue: v.revenue,
        count: v.count,
        label: SHORT_DATE.format(new Date(date)),
      }))
  }, [orders, window])

  return (
    <div className="rounded-2xl border border-foreground/10 bg-card p-6 lg:col-span-2">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Дохід за днями
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {loading
              ? "Завантаження…"
              : buckets.length === 0
                ? "Немає продажів за обраний період"
                : `${pluralizeDays(buckets.length)} з продажами`}
          </p>
        </div>
        <Tabs value={window} onValueChange={(v) => setWindow(v as Window)}>
          <TabsList>
            {WINDOWS.map((w) => (
              <TabsTrigger key={w.key} value={w.key} className="text-xs">
                {w.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </header>

      <div className="h-64">
        {loading ? (
          <ChartSkeleton />
        ) : buckets.length === 0 ? (
          <EmptyState window={window} />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={buckets} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.55 }}
                interval="preserveStartEnd"
                minTickGap={20}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.55 }}
                tickFormatter={(v: number) => formatUAH(v)}
                width={70}
              />
              <Tooltip
                cursor={{ fill: "currentColor", opacity: 0.04 }}
                content={<RevenueTooltip />}
              />
              <Bar dataKey="revenue" fill="currentColor" opacity={0.75} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="flex h-full items-end gap-1.5">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1 rounded-t-md"
          style={{ height: `${30 + Math.sin(i * 0.7) * 25 + 25}%` }}
        />
      ))}
    </div>
  )
}

function EmptyState({ window }: { window: Window }) {
  const label = WINDOWS.find((w) => w.key === window)?.label ?? window
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-foreground/10 bg-foreground/[0.02] px-6 text-center">
      <BarChart3 size={32} className="text-muted-foreground/60" />
      <div>
        <p className="text-sm font-medium">Поки немає даних про дохід</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          За «{label.toLowerCase()}» жодного завершеного замовлення.
        </p>
      </div>
      <Button asChild size="sm" className="rounded-xl gap-2">
        <Link href="/admin/deals">
          <Plus size={14} /> Створити першу угоду
        </Link>
      </Button>
    </div>
  )
}

function RevenueTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null
  const point = payload[0].payload as Bucket
  return (
    <div className="rounded-xl border border-foreground/10 bg-background px-3 py-2 text-xs shadow-hover">
      <div className="font-medium">{label}</div>
      <div className="mt-0.5 tabular-nums">{formatUAH(point.revenue)}</div>
      <div className="text-[10px] text-muted-foreground">
        {point.count}{" "}
        {point.count === 1 ? "замовлення" : point.count >= 2 && point.count <= 4 ? "замовлення" : "замовлень"}
      </div>
    </div>
  )
}
