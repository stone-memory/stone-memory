"use client"

import { useEffect, useState } from "react"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

interface PopularityState {
  counts: Record<string, number>
  hasHydrated: boolean
  increment: (id: string) => void
  reset: () => void
  setHasHydrated: (v: boolean) => void
}

export const usePopularityStore = create<PopularityState>()(
  persist(
    (set) => ({
      counts: {},
      hasHydrated: false,
      increment: (id) =>
        set((state) => ({ counts: { ...state.counts, [id]: (state.counts[id] || 0) + 1 } })),
      reset: () => set({ counts: {} }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "sm-popularity",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ counts: state.counts }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

export function usePopularity(): Map<string, number> {
  const counts = usePopularityStore((s) => s.counts)
  const hasHydrated = usePopularityStore((s) => s.hasHydrated)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted || !hasHydrated) return new Map()
  return new Map(Object.entries(counts))
}
