"use client"

import { create } from "zustand"
import type { Order, OrderStatus, OrderNote, StoneItem } from "@/lib/types"
import { authedFetch } from "@/lib/authed-fetch"

interface OrdersState {
  orders: Order[]
  selectedOrderId: string | null
  loading: boolean
  initialized: boolean
  error: string | null
}

interface OrdersActions {
  initializeOrders: () => Promise<void>
  updateStatus: (id: string, status: OrderStatus) => Promise<void>
  addNote: (id: string, note: Omit<OrderNote, "id">) => Promise<void>
  markContacted: (id: string) => Promise<void>
  remove: (id: string) => Promise<void>
  selectOrder: (id: string | null) => void
}

type Row = {
  id: string
  created_at: string
  name: string
  phone: string
  reference: string | null
  status: OrderStatus | null
  contacted: boolean | null
  items: unknown
  notes: unknown
}

function normalize(row: Row): Order {
  const items = Array.isArray(row.items) ? (row.items as StoneItem[]) : []
  const rawNotes = Array.isArray(row.notes) ? (row.notes as Array<Partial<OrderNote> & { createdAt?: string | Date }>) : []
  const notes: OrderNote[] = rawNotes.map((n, i) => ({
    id: n.id || `note-${i}`,
    author: n.author || "",
    text: n.text || "",
    createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
  }))
  return {
    id: row.id,
    items,
    name: row.name,
    phone: row.phone,
    createdAt: new Date(row.created_at),
    reference: row.reference || "",
    status: (row.status as OrderStatus) || "new",
    contacted: !!row.contacted,
    notes,
  }
}

export const useOrdersStore = create<OrdersState & OrdersActions>()((set, get) => ({
  orders: [],
  selectedOrderId: null,
  loading: false,
  initialized: false,
  error: null,

  initializeOrders: async () => {
    if (get().loading) return
    set({ loading: true, error: null })
    try {
      const res = await authedFetch("/api/orders", { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to load orders")
      const rows: Row[] = Array.isArray(data.orders) ? data.orders : []
      set({ orders: rows.map(normalize), initialized: true })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to load orders" })
    } finally {
      set({ loading: false })
    }
  },

  updateStatus: async (id, status) => {
    const prev = get().orders
    set({ orders: prev.map((o) => (o.id === id ? { ...o, status } : o)) })
    try {
      const res = await authedFetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("patch failed")
    } catch {
      set({ orders: prev })
    }
  },

  addNote: async (id, note) => {
    const prev = get().orders
    const tempNote: OrderNote = { ...note, id: `tmp-${Date.now()}` }
    set({
      orders: prev.map((o) => (o.id === id ? { ...o, notes: [...(o.notes || []), tempNote] } : o)),
    })
    try {
      const res = await authedFetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: {
            author: note.author,
            text: note.text,
            createdAt: note.createdAt instanceof Date ? note.createdAt.toISOString() : note.createdAt,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "patch failed")
      if (data.order) {
        set({ orders: get().orders.map((o) => (o.id === id ? normalize(data.order as Row) : o)) })
      }
    } catch {
      set({ orders: prev })
    }
  },

  markContacted: async (id) => {
    const prev = get().orders
    set({ orders: prev.map((o) => (o.id === id ? { ...o, contacted: true } : o)) })
    try {
      const res = await authedFetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacted: true }),
      })
      if (!res.ok) throw new Error("patch failed")
    } catch {
      set({ orders: prev })
    }
  },

  remove: async (id) => {
    const prev = get().orders
    set({ orders: prev.filter((o) => o.id !== id) })
    try {
      const res = await authedFetch(`/api/orders/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("delete failed")
    } catch {
      set({ orders: prev })
    }
  },

  selectOrder: (id) => set({ selectedOrderId: id }),
}))
