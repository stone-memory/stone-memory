"use client"

import { useEffect } from "react"
import { create } from "zustand"
import { authedFetch } from "@/lib/authed-fetch"

export type MessageChannel = "facebook" | "instagram" | "telegram" | "site"
export type MessageStatus = "new" | "read" | "replied" | "archived"

export type Message = {
  id: string
  channel: MessageChannel
  sender: string
  avatar?: string
  text: string
  at: number
  status: MessageStatus
  phone?: string
  threadUrl?: string
}

type Row = {
  id: string
  data: Message
  status: MessageStatus
  channel: MessageChannel
  received_at: string
}

interface MessagesState {
  items: Row[]
  hasHydrated: boolean
  loading: boolean
  hydrate: () => Promise<void>
  add: (m: Omit<Message, "id" | "at" | "status"> & { status?: MessageStatus }) => Promise<void>
  setStatus: (id: string, status: MessageStatus) => Promise<void>
  remove: (id: string) => Promise<void>
}

function makeId() {
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function rowOf(m: Message): Row {
  return {
    id: m.id,
    data: m,
    status: m.status,
    channel: m.channel,
    received_at: new Date(m.at).toISOString(),
  }
}

async function postRow(row: Row) {
  const res = await authedFetch("/api/content/crm-messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(row),
  })
  if (!res.ok) throw new Error("message post failed")
}

async function patchRow(id: string, patch: Partial<Row>) {
  const res = await authedFetch(`/api/content/crm-messages/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error("message patch failed")
}

export const useMessagesStore = create<MessagesState>()((set, get) => ({
  items: [],
  hasHydrated: false,
  loading: false,

  hydrate: async () => {
    if (get().hasHydrated || get().loading) return
    set({ loading: true })
    try {
      const res = await fetch("/api/content/crm-messages", { cache: "no-store" })
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
    const m: Message = {
      ...partial,
      id: makeId(),
      at: Date.now(),
      status: partial.status || "new",
    }
    const row = rowOf(m)
    const prev = get().items
    set({ items: [row, ...prev] })
    try {
      await postRow(row)
    } catch {
      set({ items: prev })
    }
  },

  setStatus: async (id, status) => {
    const prev = get().items
    const current = prev.find((r) => r.id === id)
    if (!current) return
    const merged: Message = { ...current.data, status }
    const row = rowOf(merged)
    set({ items: prev.map((r) => (r.id === id ? row : r)) })
    try {
      await patchRow(id, { data: merged, status })
    } catch {
      set({ items: prev })
    }
  },

  remove: async (id) => {
    const prev = get().items
    set({ items: prev.filter((r) => r.id !== id) })
    try {
      const res = await authedFetch(`/api/content/crm-messages/${encodeURIComponent(id)}`, { method: "DELETE" })
      if (!res.ok) throw new Error("delete failed")
    } catch {
      set({ items: prev })
    }
  },
}))

export function useMessages(): Message[] {
  const items = useMessagesStore((s) => s.items)
  const hasHydrated = useMessagesStore((s) => s.hasHydrated)
  const hydrate = useMessagesStore((s) => s.hydrate)
  useEffect(() => {
    hydrate()
  }, [hydrate])
  if (!hasHydrated) return []
  return items.map((r) => r.data)
}
