"use client"

import { toast } from "sonner"
import { SUPABASE_AUTH_STORAGE_KEY } from "@/lib/supabase/storage-key"

/**
 * Чи є в цьому браузері збережена сесія Supabase.
 *
 * Публічні сторінки теж ходять через authedFetch (профіль бізнесу, налаштування
 * чату), а статичний імпорт клієнта тягнув supabase-js (≈58 КБ gzip) у бандл
 * головної, де він змагався за канал із LCP-зображенням. Для анонімного
 * відвідувача сесії немає — і клієнт не потрібен узагалі; для адміна він
 * довантажується окремим чанком лише коли сесія справді збережена.
 */
function hasStoredSession(): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.localStorage.getItem(SUPABASE_AUTH_STORAGE_KEY) !== null
  } catch {
    return false
  }
}

async function getAccessToken(): Promise<string | undefined> {
  if (!hasStoredSession()) return undefined
  const { getSupabase } = await import("@/lib/supabase/client")
  const { data } = await getSupabase().auth.getSession()
  return data.session?.access_token
}

// fetch() wrapper that attaches the current Supabase session's access token.
// Use for any admin-only API call.
export async function authedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = await getAccessToken()
  const headers = new Headers(init?.headers)
  if (token) headers.set("Authorization", `Bearer ${token}`)
  const res = await fetch(input, { ...init, headers })

  // Surface permission failures instead of letting them fail silently —
  // stores swallow errors and revert optimistically, so without this a
  // blocked action just "does nothing". Stable toast id collapses
  // parallel 403s (e.g. several on page load) into one message.
  if (res.status === 403) {
    toast.error("Недостатньо прав для цієї дії", {
      id: "forbidden",
      description: "Ваша роль не має доступу до цієї операції.",
    })
  }

  return res
}
