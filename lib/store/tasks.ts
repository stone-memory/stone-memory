"use client"

import { useEffect } from "react"
import { create } from "zustand"
import { authedFetch } from "@/lib/authed-fetch"

export type TaskStatus = "open" | "done" | "archived"
export type TaskPriority = "low" | "normal" | "high" | "urgent"

export type Task = {
  id: string
  title: string
  note?: string
  dueAt?: number
  status: TaskStatus
  priority: TaskPriority
  link?: { kind: "order" | "client" | "project" | "stone"; id: string; label?: string }
  tags: string[]
  createdAt: number
  updatedAt: number
  completedAt?: number
}

type Row = { id: string; data: Task; status: TaskStatus; updated_at: string }

interface TasksState {
  items: Row[]
  hasHydrated: boolean
  loading: boolean
  hydrate: () => Promise<void>
  add: (t: Omit<Task, "id" | "createdAt" | "updatedAt" | "status">) => string
  update: (id: string, patch: Partial<Task>) => Promise<void>
  toggle: (id: string) => Promise<void>
  remove: (id: string) => Promise<void>
  archive: (id: string) => Promise<void>
}

function makeId() {
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

async function postRow(row: Row) {
  const res = await authedFetch("/api/content/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(row),
  })
  if (!res.ok) throw new Error("tasks post failed")
}

async function patchRow(id: string, patch: Partial<{ data: Task; status: TaskStatus; updated_at: string }>) {
  const res = await authedFetch(`/api/content/tasks/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error("tasks patch failed")
}

export const useTasksStore = create<TasksState>()((set, get) => ({
  items: [],
  hasHydrated: false,
  loading: false,

  hydrate: async () => {
    if (get().hasHydrated || get().loading) return
    set({ loading: true })
    try {
      const res = await fetch("/api/content/tasks", { cache: "no-store" })
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

  add: (partial) => {
    const now = Date.now()
    const id = makeId()
    const task: Task = {
      ...partial,
      id,
      status: "open",
      createdAt: now,
      updatedAt: now,
    }
    const row: Row = { id, data: task, status: "open", updated_at: new Date(now).toISOString() }
    set({ items: [row, ...get().items] })
    postRow(row).catch(() => {
      set({ items: get().items.filter((r) => r.id !== id) })
    })
    return id
  },

  update: async (id, patch) => {
    const prev = get().items
    const current = prev.find((r) => r.id === id)
    if (!current) return
    const merged: Task = { ...current.data, ...patch, updatedAt: Date.now() }
    const row: Row = { id, data: merged, status: merged.status, updated_at: new Date(merged.updatedAt).toISOString() }
    set({ items: prev.map((r) => (r.id === id ? row : r)) })
    try {
      await patchRow(id, { data: merged, status: merged.status })
    } catch {
      set({ items: prev })
    }
  },

  toggle: async (id) => {
    const prev = get().items
    const current = prev.find((r) => r.id === id)
    if (!current) return
    const isDone = current.data.status === "done"
    const now = Date.now()
    const merged: Task = {
      ...current.data,
      status: isDone ? "open" : "done",
      completedAt: isDone ? undefined : now,
      updatedAt: now,
    }
    const row: Row = { id, data: merged, status: merged.status, updated_at: new Date(now).toISOString() }
    set({ items: prev.map((r) => (r.id === id ? row : r)) })
    try {
      await patchRow(id, { data: merged, status: merged.status })
    } catch {
      set({ items: prev })
    }
  },

  archive: async (id) => {
    const prev = get().items
    const current = prev.find((r) => r.id === id)
    if (!current) return
    const merged: Task = { ...current.data, status: "archived", updatedAt: Date.now() }
    const row: Row = { id, data: merged, status: "archived", updated_at: new Date(merged.updatedAt).toISOString() }
    set({ items: prev.map((r) => (r.id === id ? row : r)) })
    try {
      await patchRow(id, { data: merged, status: "archived" })
    } catch {
      set({ items: prev })
    }
  },

  remove: async (id) => {
    const prev = get().items
    set({ items: prev.filter((r) => r.id !== id) })
    try {
      const res = await authedFetch(`/api/content/tasks/${encodeURIComponent(id)}`, { method: "DELETE" })
      if (!res.ok) throw new Error("delete failed")
    } catch {
      set({ items: prev })
    }
  },
}))

export function useTasks(): Task[] {
  const items = useTasksStore((s) => s.items)
  const hasHydrated = useTasksStore((s) => s.hasHydrated)
  const hydrate = useTasksStore((s) => s.hydrate)
  useEffect(() => {
    hydrate()
  }, [hydrate])
  if (!hasHydrated) return []
  return items.map((r) => r.data)
}

export function useOpenTasksCount(): number {
  return useTasks().filter((t) => t.status === "open").length
}

export function useOverdueTasks(): Task[] {
  const now = Date.now()
  return useTasks().filter((t) => t.status === "open" && t.dueAt && t.dueAt < now)
}
