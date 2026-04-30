"use client"

import { getSupabase } from "@/lib/supabase/client"

// fetch() wrapper that attaches the current Supabase session's access token.
// Use for any admin-only API call.
export async function authedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const supabase = getSupabase()
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  const headers = new Headers(init?.headers)
  if (token) headers.set("Authorization", `Bearer ${token}`)
  return fetch(input, { ...init, headers })
}
