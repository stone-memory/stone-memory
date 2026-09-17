"use client"

import { createContext, useContext } from "react"
import type { BusinessProfile } from "@/lib/business-profile"

/**
 * Профіль бізнесу, прочитаний на сервері в кореневому layout. Клієнтські
 * компоненти (футер, кнопки дзвінка, «Про нас») беруть його звідси на першому
 * кадрі, тож SSR-HTML і те, що бачать боти, уже містить дані з бази, а не
 * значення з коду, які потім підмінялися після fetch.
 */
export const BusinessProfileContext = createContext<BusinessProfile | null>(null)

export function BusinessProfileProvider({
  value,
  children,
}: {
  value: BusinessProfile
  children: React.ReactNode
}) {
  return <BusinessProfileContext.Provider value={value}>{children}</BusinessProfileContext.Provider>
}

export const useServerBusinessProfile = () => useContext(BusinessProfileContext)
