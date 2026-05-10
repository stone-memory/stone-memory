"use client"

import { create } from "zustand"
import { authedFetch } from "@/lib/authed-fetch"
import type {
  Customer,
  Deal,
  Reminder,
  Communication,
  Payment,
  Document,
  DealItem,
  DealEvent,
  ProductionStage,
  TeamMember,
  DealStatus,
} from "@/lib/crm/types"

// =====================================================
// CUSTOMERS
// =====================================================
interface CustomersState {
  items: Customer[]
  loading: boolean
  loaded: boolean
  load: (search?: string) => Promise<void>
  create: (data: Partial<Customer> & { phone: string; name: string }) => Promise<Customer | null>
  update: (id: string, patch: Partial<Customer>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useCustomersStore = create<CustomersState>()((set, get) => ({
  items: [],
  loading: false,
  loaded: false,
  load: async (search) => {
    if (get().loading) return
    set({ loading: true })
    try {
      const url = search ? `/api/crm/customers?q=${encodeURIComponent(search)}` : "/api/crm/customers"
      const r = await authedFetch(url, { cache: "no-store" })
      const j = await r.json()
      if (r.ok) set({ items: j.customers || [], loaded: true })
    } finally {
      set({ loading: false })
    }
  },
  create: async (data) => {
    const r = await authedFetch("/api/crm/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const j = await r.json()
    if (!r.ok) return null
    set((s) => ({ items: [j.customer, ...s.items.filter((c) => c.id !== j.customer.id)] }))
    return j.customer
  },
  update: async (id, patch) => {
    const prev = get().items
    set({ items: prev.map((c) => (c.id === id ? { ...c, ...patch } : c)) })
    const r = await authedFetch(`/api/crm/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
    if (!r.ok) set({ items: prev })
  },
  remove: async (id) => {
    const prev = get().items
    set({ items: prev.filter((c) => c.id !== id) })
    const r = await authedFetch(`/api/crm/customers/${id}`, { method: "DELETE" })
    if (!r.ok) set({ items: prev })
  },
}))

// =====================================================
// DEALS
// =====================================================
type DealWithCustomer = Deal & { customers?: Pick<Customer, "id" | "name" | "phone" | "email" | "locale" | "city"> }

interface DealsState {
  items: DealWithCustomer[]
  loading: boolean
  loaded: boolean
  load: () => Promise<void>
  create: (data: Partial<Deal> & { customer_id: string }) => Promise<Deal | null>
  update: (id: string, patch: Partial<Deal>) => Promise<{ ok: boolean; error?: string }>
  setStatus: (id: string, status: DealStatus) => Promise<{ ok: boolean; error?: string }>
  remove: (id: string) => Promise<void>
}

export const useDealsStore = create<DealsState>()((set, get) => ({
  items: [],
  loading: false,
  loaded: false,
  load: async () => {
    if (get().loading) return
    set({ loading: true })
    try {
      const r = await authedFetch("/api/crm/deals", { cache: "no-store" })
      const j = await r.json()
      if (r.ok) set({ items: j.deals || [], loaded: true })
    } finally {
      set({ loading: false })
    }
  },
  create: async (data) => {
    const r = await authedFetch("/api/crm/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const j = await r.json()
    if (!r.ok) return null
    set((s) => ({ items: [j.deal, ...s.items] }))
    return j.deal
  },
  update: async (id, patch) => {
    const prev = get().items
    set({ items: prev.map((d) => (d.id === id ? { ...d, ...patch } : d)) })
    const r = await authedFetch(`/api/crm/deals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
    const j = await r.json()
    if (!r.ok) {
      set({ items: prev })
      return { ok: false, error: j.error }
    }
    return { ok: true }
  },
  setStatus: async (id, status) => {
    return get().update(id, { status })
  },
  remove: async (id) => {
    const prev = get().items
    set({ items: prev.filter((d) => d.id !== id) })
    const r = await authedFetch(`/api/crm/deals/${id}`, { method: "DELETE" })
    if (!r.ok) set({ items: prev })
  },
}))

// =====================================================
// REMINDERS
// =====================================================
interface RemindersState {
  items: Reminder[]
  loading: boolean
  load: (filters?: { status?: string; assigned?: string }) => Promise<void>
  create: (data: Partial<Reminder> & { title: string; due_at: string }) => Promise<Reminder | null>
  complete: (id: string) => Promise<void>
  snooze: (id: string, minutes: number) => Promise<void>
  cancel: (id: string) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useRemindersStore = create<RemindersState>()((set, get) => ({
  items: [],
  loading: false,
  load: async (filters) => {
    if (get().loading) return
    set({ loading: true })
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.set("status", filters.status)
      if (filters?.assigned) params.set("assigned", filters.assigned)
      const r = await authedFetch(`/api/crm/reminders?${params}`, { cache: "no-store" })
      const j = await r.json()
      if (r.ok) set({ items: j.reminders || [] })
    } finally {
      set({ loading: false })
    }
  },
  create: async (data) => {
    const r = await authedFetch("/api/crm/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const j = await r.json()
    if (!r.ok) return null
    set((s) => ({ items: [j.reminder, ...s.items] }))
    return j.reminder
  },
  complete: async (id) => {
    set((s) => ({ items: s.items.filter((r) => r.id !== id) }))
    await authedFetch(`/api/crm/reminders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete" }),
    })
  },
  snooze: async (id, minutes) => {
    set((s) => ({ items: s.items.filter((r) => r.id !== id) }))
    await authedFetch(`/api/crm/reminders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "snooze", snoozeMinutes: minutes }),
    })
  },
  cancel: async (id) => {
    set((s) => ({ items: s.items.filter((r) => r.id !== id) }))
    await authedFetch(`/api/crm/reminders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    })
  },
  remove: async (id) => {
    set((s) => ({ items: s.items.filter((r) => r.id !== id) }))
    await authedFetch(`/api/crm/reminders/${id}`, { method: "DELETE" })
  },
}))

// =====================================================
// TEAM
// =====================================================
interface TeamState {
  members: TeamMember[]
  loading: boolean
  loaded: boolean
  load: () => Promise<void>
}

export const useTeamStore = create<TeamState>()((set, get) => ({
  members: [],
  loading: false,
  loaded: false,
  load: async () => {
    if (get().loading || get().loaded) return
    set({ loading: true })
    try {
      const r = await authedFetch("/api/crm/team?active=true", { cache: "no-store" })
      const j = await r.json()
      if (r.ok) set({ members: j.team || [], loaded: true })
    } finally {
      set({ loading: false })
    }
  },
}))

// =====================================================
// Helpers — для одиничного завантаження deal/customer overview
// =====================================================
export async function fetchCustomerOverview(id: string) {
  const r = await authedFetch(`/api/crm/customers/${id}`, { cache: "no-store" })
  if (!r.ok) return null
  return r.json() as Promise<{
    customer: Customer
    deals: Deal[]
    reminders: Reminder[]
    communications: Communication[]
    documents: Document[]
    payments: Payment[]
    totalLifetimeValue: number
    openDealsCount: number
  }>
}

export async function fetchDealOverview(id: string) {
  const r = await authedFetch(`/api/crm/deals/${id}`, { cache: "no-store" })
  if (!r.ok) return null
  return r.json() as Promise<{
    deal: Deal & { customers?: Customer; assigned?: TeamMember; master?: TeamMember }
    items: DealItem[]
    events: DealEvent[]
    reminders: Reminder[]
    communications: Communication[]
    documents: Document[]
    productionStages: ProductionStage[]
    payments: Payment[]
  }>
}
