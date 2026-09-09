"use client"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { SUPABASE_AUTH_STORAGE_KEY } from "./storage-key"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let cached: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (cached) return cached
  cached = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: SUPABASE_AUTH_STORAGE_KEY,
    },
  })
  return cached
}
