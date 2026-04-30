"use client"

import { authedFetch } from "@/lib/authed-fetch"

import { useEffect } from "react"
import { create } from "zustand"

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"

export type DayHours = {
  open: string
  close: string
  closed: boolean
}

export type Holiday = {
  id: string
  date: string
  label: string
}

export type BusinessProfile = {
  legalName: string
  displayName: string
  email: string
  phone: string
  address: string
  city: string
  region: string
  postalCode: string
  country: string
  vatId: string
  hours: Record<Weekday, DayHours>
  holidays: Holiday[]
  serviceAreas: string[]
  currency: string
  bankingIban?: string
}

const DEFAULT_HOURS: Record<Weekday, DayHours> = {
  mon: { open: "09:00", close: "19:00", closed: false },
  tue: { open: "09:00", close: "19:00", closed: false },
  wed: { open: "09:00", close: "19:00", closed: false },
  thu: { open: "09:00", close: "19:00", closed: false },
  fri: { open: "09:00", close: "19:00", closed: false },
  sat: { open: "10:00", close: "16:00", closed: false },
  sun: { open: "00:00", close: "00:00", closed: true },
}

const DEFAULT_PROFILE: BusinessProfile = {
  legalName: "ФОП Stone Memory",
  displayName: "Stone Memory",
  email: "sttonememory@gmail.com",
  phone: "+380 (67) 808 02 22",
  address: "вул. Гранітна, 12",
  city: "Костопіль",
  region: "Рівненська область",
  postalCode: "35000",
  country: "Україна",
  vatId: "",
  hours: DEFAULT_HOURS,
  holidays: [],
  serviceAreas: ["UA", "PL", "DE", "LT", "EU"],
  currency: "EUR",
  bankingIban: "",
}

interface BusinessProfileState {
  profile: BusinessProfile
  hasHydrated: boolean
  loading: boolean
  hydrate: () => Promise<void>
  update: (patch: Partial<BusinessProfile>) => Promise<void>
  updateHours: (day: Weekday, patch: Partial<DayHours>) => Promise<void>
  addHoliday: (h: Omit<Holiday, "id">) => Promise<void>
  removeHoliday: (id: string) => Promise<void>
  reset: () => Promise<void>
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
        set({ profile: { ...DEFAULT_PROFILE, ...(json.data as BusinessProfile) }, hasHydrated: true })
      } else {
        set({ hasHydrated: true })
      }
    } catch {
      set({ hasHydrated: true })
    } finally {
      set({ loading: false })
    }
  },

  update: async (patch) => {
    const prev = get().profile
    const next = { ...prev, ...patch }
    set({ profile: next })
    try {
      await putProfile(next)
    } catch {
      set({ profile: prev })
    }
  },

  updateHours: async (day, patch) => {
    const prev = get().profile
    const next: BusinessProfile = {
      ...prev,
      hours: { ...prev.hours, [day]: { ...prev.hours[day], ...patch } },
    }
    set({ profile: next })
    try {
      await putProfile(next)
    } catch {
      set({ profile: prev })
    }
  },

  addHoliday: async (h) => {
    const prev = get().profile
    const next: BusinessProfile = {
      ...prev,
      holidays: [...prev.holidays, { ...h, id: `hol-${Date.now().toString(36)}` }],
    }
    set({ profile: next })
    try {
      await putProfile(next)
    } catch {
      set({ profile: prev })
    }
  },

  removeHoliday: async (id) => {
    const prev = get().profile
    const next: BusinessProfile = {
      ...prev,
      holidays: prev.holidays.filter((h) => h.id !== id),
    }
    set({ profile: next })
    try {
      await putProfile(next)
    } catch {
      set({ profile: prev })
    }
  },

  reset: async () => {
    const prev = get().profile
    set({ profile: DEFAULT_PROFILE })
    try {
      await putProfile(DEFAULT_PROFILE)
    } catch {
      set({ profile: prev })
    }
  },
}))

export function useBusinessProfile(): BusinessProfile {
  const profile = useBusinessProfileStore((s) => s.profile)
  const hasHydrated = useBusinessProfileStore((s) => s.hasHydrated)
  const hydrate = useBusinessProfileStore((s) => s.hydrate)
  useEffect(() => {
    hydrate()
  }, [hydrate])
  if (!hasHydrated) return DEFAULT_PROFILE
  return profile
}
