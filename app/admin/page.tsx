"use client"

import { useState, useEffect } from "react"
import { Download, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { KPICard } from "@/components/admin/kpi-card"
import { OrdersTable } from "@/components/admin/orders-table"
import { useOrdersStore } from "@/lib/store/orders"
import { formatUAHDirect } from "@/lib/admin-format"
import type { Order, OrderStatus } from "@/lib/types"

function exportOrdersCsv(orders: Order[]) {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
  const fmtDate = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`
  const statusLabel: Record<string, string> = {
    new: "Нове",
    in_progress: "В роботі",
    completed: "Завершено",
  }
  const header = ["номер", "клієнт", "телефон", "статус", "дата", "референс", "сконтактовано", "сума_₴", "товари"].join(",")
  const rows = orders.map((o) => {
    const total = o.items.reduce((s, i) => s + (i.priceFrom ?? 0), 0)
    const items = o.items.map((i) => i.name || i.id).join("; ")
    return [
      esc(o.id),
      esc(o.name),
      esc(o.phone),
      statusLabel[o.status ?? "new"] ?? "Нове",
      fmtDate(new Date(o.createdAt)),
      esc(o.reference ?? ""),
      o.contacted ? "Так" : "Ні",
      total,
      esc(items),
    ].join(",")
  })
  const csv = [header, ...rows].join("\n")
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `orders-${fmtDate(new Date())}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const orders = useOrdersStore((state) => state.orders)

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm)
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate KPIs
  const newOrders = orders.filter((o) => o.status === "new").length
  const inProgressOrders = orders.filter((o) => o.status === "in_progress").length
  const completedThisMonth = orders.filter((o) => {
    if (o.status !== "completed") return false
    const now = new Date()
    const orderDate = new Date(o.createdAt)
    return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()
  }).length
  const totalPipeline = orders.reduce((sum, o) => {
    return sum + o.items.reduce((itemSum, item) => itemSum + (item.priceFrom ?? 0), 0)
  }, 0)

  // ----- Real trends computed from createdAt history -----
  // We only render a trend chip when both periods have at least one order;
  // otherwise the % is meaningless. Same for sparkline — if every day is
  // zero we hide it rather than draw a flat line that looks decorative.
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const startOfMonth = (offset: number) => {
    const d = new Date()
    d.setMonth(d.getMonth() - offset, 1)
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  }

  const inWindow = (o: Order, fromMs: number, toMs: number) => {
    const t = new Date(o.createdAt).getTime()
    return t >= fromMs && t < toMs
  }

  const computePctTrend = (
    current: number,
    prior: number
  ): { value: number; isPositive: boolean } | undefined => {
    // Need a non-zero baseline to compute %, otherwise hide the chip.
    if (prior === 0 || current === prior) return undefined
    const pct = Math.round(((current - prior) / prior) * 100)
    return { value: Math.abs(pct), isPositive: pct >= 0 }
  }

  // "Нові замовлення" sparkline + trend — orders created per day, last 7d
  const createdPerDay7dRaw: number[] = []
  for (let i = 6; i >= 0; i--) {
    const dayStart = now - (i + 1) * dayMs
    const dayEnd = now - i * dayMs
    createdPerDay7dRaw.push(orders.filter((o) => inWindow(o, dayStart, dayEnd)).length)
  }
  const createdLast7d = createdPerDay7dRaw.reduce((a, b) => a + b, 0)
  const createdPrior7d = orders.filter((o) =>
    inWindow(o, now - 14 * dayMs, now - 7 * dayMs)
  ).length
  const createdPerDay7d = createdLast7d > 0 ? createdPerDay7dRaw : undefined
  const newOrdersTrend = computePctTrend(createdLast7d, createdPrior7d)

  // "Завершено цього місяця" trend — current month vs previous full month
  const monthStart = startOfMonth(0)
  const lastMonthStart = startOfMonth(1)
  const completedLastMonth = orders.filter(
    (o) => o.status === "completed" && inWindow(o, lastMonthStart, monthStart)
  ).length
  const completedTrend = computePctTrend(completedThisMonth, completedLastMonth)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-semibold tracking-tight">Замовлення</h1>
          <Button variant="outline" className="gap-2 rounded-xl" onClick={() => exportOrdersCsv(filteredOrders)}>
            <Download size={16} />
            Експорт CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Пошук за ID, клієнтом, телефоном…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 rounded-xl pl-10 border-black/10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-32 h-10 rounded-xl border-black/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Усі статуси</SelectItem>
              <SelectItem value="new">Нові</SelectItem>
              <SelectItem value="in_progress">В роботі</SelectItem>
              <SelectItem value="completed">Завершені</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards
         The previous version showed hardcoded trend chips (+12%, -5%, etc.)
         and decorative sparklines that were the same numbers regardless of
         actual data — misleading when the database is sparse. Trends now
         compute from real createdAt history and only render when there's
         enough data to be honest. Period comparisons / time-series charts
         live on /admin/analytics where they belong. */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Нові замовлення"
          value={newOrders}
          trend={newOrdersTrend}
          sparkline={createdPerDay7d}
        />
        <KPICard label="В роботі" value={inProgressOrders} />
        <KPICard
          label="Завершено цього місяця"
          value={completedThisMonth}
          trend={completedTrend}
        />
        <KPICard label="Загальна сума pipeline" value={formatUAHDirect(totalPipeline)} />
      </div>

      {/* Orders Table */}
      <OrdersTable orders={filteredOrders} />
    </div>
  )
}
