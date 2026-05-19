"use client"

import { toast } from "sonner"
import { getSupabase } from "@/lib/supabase/client"

// fetch() wrapper that attaches the current Supabase session's access token.
// Use for any admin-only API call.
export async function authedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const supabase = getSupabase()
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
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
