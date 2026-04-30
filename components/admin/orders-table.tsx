"use client"

import { useState } from "react"
import { MoreVertical, Phone, Trash2 } from "lucide-react"
import { useOrdersStore } from "@/lib/store/orders"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./status-badge"
import { OrderDetailSheet } from "./order-detail-sheet"
import type { Order } from "@/lib/types"

interface OrdersTableProps {
  orders: Order[]
}

function formatDate(date: Date): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatPrice(price: number): string {
  return `€${price.toLocaleString("en-US", { minimumFractionDigits: 0 })}`
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const remove = useOrdersStore((s) => s.remove)

  const selectedOrder = orders.find((o) => o.id === selectedOrderId)

  const handleDelete = (id: string) => {
    if (confirm("Видалити замовлення? Цю дію не можна скасувати.")) {
      remove(id)
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Order ID</TableHead>
              <TableHead className="w-28">Date</TableHead>
              <TableHead className="flex-1">Client</TableHead>
              <TableHead className="flex-1">Models</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const totalPrice = order.items.reduce((sum, item) => sum + item.priceFrom, 0)
              const modelChips = order.items.slice(0, 3)
              const moreCount = order.items.length - 3

              return (
                <TableRow
                  key={order.id}
                  className="hover:bg-black/[0.02] cursor-pointer"
                  onClick={() => setSelectedOrderId(order.id)}
                >
                  <TableCell className="text-sm font-mono">{order.id}</TableCell>
                  <TableCell className="text-sm" title={new Date(order.createdAt).toLocaleString()}>
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{order.name}</p>
                      <a
                        href={`tel:${order.phone}`}
                        className="text-xs text-accent hover:underline flex items-center gap-1 w-fit"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone size={12} />
                        {order.phone}
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {modelChips.map((item) => (
                        <span
                          key={item.id}
                          className="bg-black/5 rounded px-2 py-1 text-xs font-mono"
                        >
                          {item.id}
                        </span>
                      ))}
                      {moreCount > 0 && (
                        <span className="bg-black/5 rounded px-2 py-1 text-xs font-mono">
                          +{moreCount} more
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status || "new"} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedOrderId(order.id)}>
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(order.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {selectedOrder && (
        <OrderDetailSheet
          order={selectedOrder}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </>
  )
}
