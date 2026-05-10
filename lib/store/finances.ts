"use client"

import { useEffect } from "react"
import { create } from "zustand"
import { authedFetch } from "@/lib/authed-fetch"

export type TxKind = "income" | "expense"
export type TxCategory =
  | "order"
  | "materials"
  | "logistics"
  | "payroll"
  | "tools"
  | "rent"
  | "marketing"
  | "tax"
  | "other"

export type Transaction = {
  id: string
  kind: TxKind
  category: TxCategory
  amount: number
  date: number
  note?: string
  relatedOrderId?: string
}

type Row = {
  id: string
  data: Transaction
  kind: TxKind
  amount: number
  occurred_at: string
}

interface FinancesState {
  items: Row[]
  hasHydrated: boolean
  loading: boolean
  hydrate: () => Promise<void>
  add: (t: Omit<Transaction, "id">) => Promise<void>
  remove: (id: string) => Promise<void>
  update: (id: string, patch: Partial<Transaction>) => Promise<void>
}

function makeId() {
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function rowOf(tx: Transaction): Row {
  return {
    id: tx.id,
    data: tx,
    kind: tx.kind,
    amount: tx.amount,
    occurred_at: new Date(tx.date).toISOString(),
  }
}

async function postRow(row: Row) {
  const res = await authedFetch("/api/content/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(row),
  })
  if (!res.ok) throw new Error("tx post failed")
}

async function patchRow(id: string, patch: Partial<Row>) {
  const res = await authedFetch(`/api/content/transactions/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error("tx patch failed")
}

export const useFinancesStore = create<FinancesState>()((set, get) => ({
  items: [],
  hasHydrated: false,
  loading: false,

  hydrate: async () => {
    if (get().hasHydrated || get().loading) return
    set({ loading: true })
    try {
      const res = await fetch("/api/content/transactions", { cache: "no-store" })
      const json = await res.json()
      if (res.ok && Array.isArray(json.items)) {
        set({ items: json.items as Row[], hasHydrated: true })
      } else {
        set({ hasHydrated: true })
      }
    } finally {
      set({ loading: false })
    }
  },

  add: async (partial) => {
    const id = makeId()
    const tx: Transaction = { ...partial, id }
    const row = rowOf(tx)
    const prev = get().items
    set({ items: [row, ...prev] })
    try {
      await postRow(row)
    } catch {
      set({ items: prev })
    }
  },

  update: async (id, patch) => {
    const prev = get().items
    const current = prev.find((r) => r.id === id)
    if (!current) return
    const merged: Transaction = { ...current.data, ...patch }
    const row = rowOf(merged)
    set({ items: prev.map((r) => (r.id === id ? row : r)) })
    try {
      await patchRow(id, { data: merged, kind: merged.kind, amount: merged.amount, occurred_at: row.occurred_at })
    } catch {
      set({ items: prev })
    }
  },

  remove: async (id) => {
    const prev = get().items
    set({ items: prev.filter((r) => r.id !== id) })
    try {
      const res = await authedFetch(`/api/content/transactions/${encodeURIComponent(id)}`, { method: "DELETE" })
      if (!res.ok) throw new Error("delete failed")
    } catch {
      set({ items: prev })
    }
  },
}))

// Returns transactions list (auto-hydrates). Named `transactions` access compat.
export function useTransactions(): Transaction[] {
  const items = useFinancesStore((s) => s.items)
  const hasHydrated = useFinancesStore((s) => s.hasHydrated)
  const hydrate = useFinancesStore((s) => s.hydrate)
  useEffect(() => {
    hydrate()
  }, [hydrate])
  if (!hasHydrated) return []
  return items.map((r) => r.data)
}
