"use client"

import { useEffect } from "react"
import { create } from "zustand"
import { authedFetch } from "@/lib/authed-fetch"
import { getSupabase } from "@/lib/supabase/client"

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
  /** Чим живляться лічильники зараз — видно в devtools при діагностиці. */
  transport: "idle" | "realtime" | "polling"
  fetch: () => Promise<void>
}

const EMPTY: Counts = { inbox: 0, reminders: 0, orders: 0, deals: 0, chat: 0 }

// Якщо зміна прийшла, поки попередній запит ще летить, не губимо її:
// повторюємо запит одразу після завершення поточного.
let refetchAfter = false

export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
  counts: EMPTY,
  activeChatSessions: 0,
  loading: false,
  lastFetch: 0,
  transport: "idle",
  fetch: async () => {
    if (get().loading) {
      refetchAfter = true
      return
    }
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
    } catch {
      // Мережа моргнула — лишаємо попередні цифри, наступна подія або тик повторить.
    } finally {
      set({ loading: false })
      if (refetchAfter) {
        refetchAfter = false
        void get().fetch()
      }
    }
  },
}))

let debounceTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Оновити лічильники після дії менеджера (зміна статусу, «Готово» на
 * нагадуванні, відповідь у чаті). Серія викликів поспіль збирається в один
 * запит. Realtime зробить те саме за мить, але тут цифра міняється відразу,
 * і це працює навіть якщо Realtime не підключився.
 */
export function refreshNotificationCounts(delayMs = 250) {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    void useNotificationsStore.getState().fetch()
  }, delayMs)
}

/** Таблиці, зміни в яких впливають на бейджі (мають бути в publication supabase_realtime). */
const WATCHED_TABLES = ["orders", "deals", "reminders", "communications", "chat_messages"] as const

/** Страховий polling: рідкий, коли Realtime живий; частіший, якщо він не піднявся. */
// 30 с, як і раніше: якщо таблиці ще не в publication, канал підписується без
// помилки, але подій не буде, тож polling не можна робити рідшим.
const POLL_WITH_REALTIME_MS = 30_000
const POLL_FALLBACK_MS = 15_000

/**
 * Хук для бічної панелі.
 *
 * Джерело правди — Realtime (postgres_changes) по таблицях заявок, угод,
 * нагадувань, повідомлень і чату: будь-яка зміна → перерахунок за ~0,5 с.
 * RLS обмежує події тим, що бачить цей користувач, тому підписка йде з
 * токеном сесії. Polling лишається як страховка, плюс перерахунок при
 * поверненні у вкладку.
 *
 * Локального «занулення при відкритті розділу» більше немає: бейдж
 * показує те, що реально потребує уваги, і зникає лише коли справа
 * зроблена (статус змінено, повідомлення прочитано).
 */
export function useNotificationCounts(): Counts {
  const counts = useNotificationsStore((s) => s.counts)

  useEffect(() => {
    const store = useNotificationsStore.getState()
    void store.fetch()

    let realtimeUp = false
    const supabase = getSupabase()
    const channel = supabase.channel("crm-notification-counts")
    for (const table of WATCHED_TABLES) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () =>
        refreshNotificationCounts(400)
      )
    }
    void (async () => {
      // Явно передаємо токен сесії: без нього RLS не пропустить жодної події.
      const { data } = await supabase.auth.getSession()
      if (data.session?.access_token) supabase.realtime.setAuth(data.session.access_token)
      channel.subscribe((status) => {
        realtimeUp = status === "SUBSCRIBED"
        useNotificationsStore.setState({ transport: realtimeUp ? "realtime" : "polling" })
        if (realtimeUp) refreshNotificationCounts(0)
      })
    })()

    let lastPoll = Date.now()
    const tick = setInterval(() => {
      const every = realtimeUp ? POLL_WITH_REALTIME_MS : POLL_FALLBACK_MS
      if (Date.now() - lastPoll >= every) {
        lastPoll = Date.now()
        void store.fetch()
      }
    }, 5_000)

    const onVisible = () => {
      if (document.visibilityState === "visible") void store.fetch()
    }
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("focus", onVisible)

    return () => {
      clearInterval(tick)
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("focus", onVisible)
      void supabase.removeChannel(channel)
    }
  }, [])

  return counts
}
