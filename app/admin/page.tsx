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
import type { Order, OrderStatus } from "@/lib/types"

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
    return sum + o.items.reduce((itemSum, item) => itemSum + item.priceFrom, 0)
  }, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-semibold tracking-tight">Orders</h1>
          <Button variant="outline" className="gap-2 rounded-xl">
            <Download size={16} />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by ID, client, phone…"
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
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="New Orders"
          value={newOrders}
          trend={{ value: 12, isPositive: true }}
          sparkline={[3, 5, 2, 8, 6, 9, 7]}
        />
        <KPICard
          label="In Progress"
          value={inProgressOrders}
          trend={{ value: 5, isPositive: false }}
          sparkline={[9, 7, 8, 5, 6, 4, 7]}
        />
        <KPICard
          label="Completed This Month"
          value={completedThisMonth}
          trend={{ value: 23, isPositive: true }}
          sparkline={[2, 4, 3, 7, 5, 9, 8]}
        />
        <KPICard
          label="Total Pipeline Value"
          value={`€${(totalPipeline / 1000).toFixed(1)}K`}
          trend={{ value: 8, isPositive: true }}
          sparkline={[5, 6, 4, 8, 7, 9, 6]}
        />
      </div>

      {/* Orders Table */}
      <OrdersTable orders={filteredOrders} />
    </div>
  )
}
