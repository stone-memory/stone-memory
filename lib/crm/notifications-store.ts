"use client"

import { useEffect } from "react"
import { create } from "zustand"
import { authedFetch } from "@/lib/authed-fetch"

type Counts = {
  inbox: number
  reminders: number
  orders: number
  deals: number
  chat: number
}

interface NotificationsState {
  counts: Counts
  activeChatSessions: number
  loading: boolean
  lastFetch: number
  fetch: () => Promise<void>
  /** Локально занулити лічильник (коли admin зайшов у відповідний розділ) */
  clearLocally: (key: keyof Counts) => void
}

const EMPTY: Counts = { inbox: 0, reminders: 0, orders: 0, deals: 0, chat: 0 }

export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
  counts: EMPTY,
  activeChatSessions: 0,
  loading: false,
  lastFetch: 0,
  fetch: async () => {
    if (get().loading) return
    set({ loading: true })
    try {
      const r = await authedFetch("/api/crm/notifications/counts", { cache: "no-store" })
      if (r.ok) {
        const j = await r.json()
        set({
          counts: { ...EMPTY, ...j.counts },
          activeChatSessions: j.activeChatSessions || 0,
          lastFetch: Date.now(),
        })
      }
    } finally {
      set({ loading: false })
    }
  },
  clearLocally: (key) => {
    set((s) => ({ counts: { ...s.counts, [key]: 0 } }))
  },
}))

/**
 * Хук для sidebar — підвантажує лічильники і поллить кожні 30 с.
 * Зменшує локально лічильник коли admin відвідав відповідну сторінку.
 */
export function useNotificationCounts(currentPath?: string) {
  const counts = useNotificationsStore((s) => s.counts)
  const fetch = useNotificationsStore((s) => s.fetch)
  const clearLocally = useNotificationsStore((s) => s.clearLocally)

  useEffect(() => {
    fetch()
    const id = setInterval(fetch, 30_000)
    return () => clearInterval(id)
  }, [fetch])

  // Авто-зменшення лічильника при відкритті відповідного розділу.
  // Серверне підтвердження (markRead) робиться на сторінці, але візуально
  // бейдж зникає одразу — щоб не блимав до наступного fetch.
  useEffect(() => {
    if (!currentPath) return
    if (currentPath === "/admin/inbox") clearLocally("inbox")
    else if (currentPath === "/admin/reminders") clearLocally("reminders")
    else if (currentPath === "/admin") clearLocally("orders")
    else if (currentPath.startsWith("/admin/deals")) clearLocally("deals")
    else if (currentPath === "/admin/chat") clearLocally("chat")
  }, [currentPath, clearLocally])

  return counts
}
