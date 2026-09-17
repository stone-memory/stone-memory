"use client"

import { authedFetch } from "@/lib/authed-fetch"

import { useEffect } from "react"
import { create } from "zustand"
import {
  DEFAULT_PROFILE,
  mergeProfile,
  type BusinessProfile,
  type DayHours,
  type Holiday,
  type Weekday,
} from "@/lib/business-profile"
import { useServerBusinessProfile } from "@/components/business-profile-provider"

export type { BusinessProfile, DayHours, Holiday, Weekday }

interface BusinessProfileState {
  profile: BusinessProfile
  hasHydrated: boolean
  loading: boolean
  hydrate: () => Promise<void>
  /** Explicit persist of the current profile with a reported result
   *  (the per-keystroke `update` reverts silently on failure). */
  saveProfile: () => Promise<{ ok: boolean; error?: string }>
  /** Зберігає повний профіль із форми адмінки й оновлює стор лише після успіху. */
  save: (profile: BusinessProfile) => Promise<{ ok: boolean; error?: string }>
}

async function putProfile(profile: BusinessProfile) {
  const res = await authedFetch("/api/content/singleton/business_profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: profile }),
  })
  if (!res.ok) throw new Error("profile put failed")
}

export const useBusinessProfileStore = create<BusinessProfileState>()((set, get) => ({
  profile: DEFAULT_PROFILE,
  hasHydrated: false,
  loading: false,

  hydrate: async () => {
    if (get().hasHydrated || get().loading) return
    set({ loading: true })
    try {
      const res = await fetch("/api/content/singleton/business_profile", { cache: "no-store" })
      const json = await res.json()
      if (res.ok && json.data && typeof json.data === "object") {
        set({ profile: mergeProfile(json.data), hasHydrated: true })
      } else {
        set({ hasHydrated: true })
      }
    } catch {
      set({ hasHydrated: true })
    } finally {
      set({ loading: false })
    }
  },

  save: async (profile) => {
    try {
      await putProfile(profile)
      set({ profile })
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Не вдалось зберегти" }
    }
  },

  saveProfile: async () => {
    try {
      await putProfile(get().profile)
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Не вдалось зберегти" }
    }
  },





}))

export function useBusinessProfile(): BusinessProfile {
  const profile = useBusinessProfileStore((s) => s.profile)
  const hasHydrated = useBusinessProfileStore((s) => s.hasHydrated)
  const hydrate = useBusinessProfileStore((s) => s.hydrate)
  // Прочитане на сервері (кореневий layout): SSR і перший кадр показують дані
  // з бази, а не дефолти з коду.
  const fromServer = useServerBusinessProfile()
  useEffect(() => {
    hydrate()
  }, [hydrate])
  if (!hasHydrated) return fromServer ?? DEFAULT_PROFILE
  return profile
}
