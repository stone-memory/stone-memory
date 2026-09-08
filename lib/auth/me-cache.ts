"use client"

import { authedFetch } from "@/lib/authed-fetch"
import type { TeamRole } from "@/lib/crm/types"
import type { Capability } from "@/lib/permissions/capabilities"

/**
 * Один спільний запит /api/auth/me на всю оболонку адмінки + кеш у sessionStorage.
 *
 * Раніше AuthGate і бічна панель кожна робила свій запит послідовно, і поки
 * обидва не повернулись (0,7–1,5 с кожен, а при холодному старті функції
 * значно довше), екран був порожній, а меню показувало «Завантаження… 0
 * дозволів». Тепер:
 *   - паралельні виклики дедуплікуються в один запит;
 *   - відповідь кешується на вкладку: наступний повний перехід малює оболонку
 *     одразу з кешу, а свіжу відповідь підтягує у фоні.
 *
 * Кеш — лише для UI. Кожен API-запит сервер перевіряє сам, тож застарілий кеш
 * максимум покаже пункт меню, на який прийде 403.
 */
export type Me = {
  user_id: string | null
  email: string | null
  role: TeamRole | null
  active: boolean
  capabilities: Capability[]
}

const KEY = "sm-admin-me-v1"
let memory: Me | null = null
let inflight: Promise<Me | null> | null = null

export function readCachedMe(): Me | null {
  if (memory) return memory
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    memory = JSON.parse(raw) as Me
    return memory
  } catch {
    return null
  }
}

export function fetchMe(): Promise<Me | null> {
  if (inflight) return inflight
  inflight = authedFetch("/api/auth/me", { cache: "no-store" })
    .then(async (r) => {
      if (!r.ok) {
        clearMe()
        return null
      }
      const j = (await r.json()) as Partial<Me>
      const me: Me = {
        user_id: j.user_id ?? null,
        email: j.email ?? null,
        role: j.role ?? null,
        active: Boolean(j.active),
        capabilities: Array.isArray(j.capabilities) ? j.capabilities : [],
      }
      memory = me
      try {
        sessionStorage.setItem(KEY, JSON.stringify(me))
      } catch {
        /* приватний режим — працюємо без кешу */
      }
      return me
    })
    .catch(() => null)
    .finally(() => {
      inflight = null
    })
  return inflight
}

export function clearMe() {
  memory = null
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
