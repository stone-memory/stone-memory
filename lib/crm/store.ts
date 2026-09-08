"use client"

import { create } from "zustand"
import { authedFetch } from "@/lib/authed-fetch"
import { refreshNotificationCounts } from "@/lib/crm/notifications-store"
import type {
  Customer,
  Deal,
  Reminder,
  ReminderRow,
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
    refreshNotificationCounts()
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
    if ("status" in patch) refreshNotificationCounts()
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
    else refreshNotificationCounts()
  },
}))

// =====================================================
// REMINDERS
// =====================================================
export type RemindersFilter = { status?: "open" | "done"; scope?: "mine" | "all"; assigned?: string }

interface RemindersState {
  items: ReminderRow[]
  loading: boolean
  loaded: boolean
  filter: RemindersFilter
  load: (filters?: RemindersFilter) => Promise<void>
  create: (data: Partial<Reminder> & { title: string; due_at: string }) => Promise<ReminderRow | null>
  update: (id: string, patch: Partial<Reminder>) => Promise<boolean>
  complete: (id: string) => Promise<void>
  snooze: (id: string, minutes: number) => Promise<void>
  cancel: (id: string) => Promise<void>
  reopen: (id: string) => Promise<void>
  remove: (id: string) => Promise<void>
}

/** Одна дія над записом; список оновлюємо оптимістично, а помилку — перезавантаженням. */
async function reminderAction(
  get: () => RemindersState,
  id: string,
  body: Record<string, unknown>,
  dropFromList: boolean
) {
  const r = await authedFetch(`/api/crm/reminders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!r.ok || !dropFromList) await get().load(get().filter)
  refreshNotificationCounts()
  return r.ok
}

export const useRemindersStore = create<RemindersState>()((set, get) => ({
  items: [],
  loading: false,
  loaded: false,
  filter: { status: "open", scope: "mine" },
  load: async (filters) => {
    const filter: RemindersFilter = { ...get().filter, ...(filters || {}) }
    set({ loading: true, filter })
    try {
      const params = new URLSearchParams()
      params.set("status", filter.status || "open")
      params.set("scope", filter.scope || "mine")
      if (filter.assigned) params.set("assigned", filter.assigned)
      const r = await authedFetch(`/api/crm/reminders?${params}`, { cache: "no-store" })
      const j = await r.json().catch(() => ({}))
      // Відповідь на застарілий фільтр (користувач уже перемкнув вкладку) не показуємо.
      if (r.ok && get().filter === filter) set({ items: j.reminders || [], loaded: true })
    } finally {
      if (get().filter === filter) set({ loading: false })
    }
  },
  create: async (data) => {
    const r = await authedFetch("/api/crm/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) return null
    // Показуємо одразу, якщо запис підходить під поточну вкладку; порядок за датою.
    if (get().filter.status !== "done") {
      set((s) => ({
        items: [...s.items, j.reminder as ReminderRow].sort(
          (a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
        ),
      }))
    }
    refreshNotificationCounts()
    return j.reminder as ReminderRow
  },
  update: async (id, patch) => {
    const ok = await reminderAction(get, id, patch, false)
    return ok
  },
  complete: async (id) => {
    set((s) => ({ items: s.items.filter((r) => r.id !== id) }))
    await reminderAction(get, id, { action: "complete" }, true)
  },
  snooze: async (id, minutes) => {
    // Лишається у списку з новою датою — перезавантажуємо, щоб бачити її.
    await reminderAction(get, id, { action: "snooze", snoozeMinutes: minutes }, false)
  },
  cancel: async (id) => {
    set((s) => ({ items: s.items.filter((r) => r.id !== id) }))
    await reminderAction(get, id, { action: "cancel" }, true)
  },
  reopen: async (id) => {
    set((s) => ({ items: s.items.filter((r) => r.id !== id) }))
    await reminderAction(get, id, { action: "reopen" }, true)
  },
  remove: async (id) => {
    set((s) => ({ items: s.items.filter((r) => r.id !== id) }))
    const r = await authedFetch(`/api/crm/reminders/${id}`, { method: "DELETE" })
    if (!r.ok) await get().load(get().filter)
    refreshNotificationCounts()
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
    /** Status changes / notes / events across all of this customer's deals.
     *  Powers the unified activity timeline on the customer detail page. */
    dealEvents: DealEvent[]
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
