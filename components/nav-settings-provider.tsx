"use client"

import { createContext, useContext } from "react"
import { DEFAULT_NAV_SETTINGS, type NavSettings } from "@/lib/nav-settings"

const NavSettingsContext = createContext<NavSettings>(DEFAULT_NAV_SETTINGS)

export function NavSettingsProvider({
  value,
  children,
}: {
  value: NavSettings
  children: React.ReactNode
}) {
  return <NavSettingsContext.Provider value={value}>{children}</NavSettingsContext.Provider>
}

export function useNavSettings(): NavSettings {
  return useContext(NavSettingsContext)
}
