"use client"

import { useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AuthGate } from "@/components/admin/auth-gate"
import { CommandPalette } from "@/components/admin/command-palette"
import { useOrdersStore } from "@/lib/store/orders"
import { getSupabase } from "@/lib/supabase/client"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  const initializeOrders = useOrdersStore((state) => state.initializeOrders)

  useEffect(() => {
    const supabase = getSupabase()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) initializeOrders()
      setIsReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (session) initializeOrders()
    })
    return () => {
      sub.subscription.unsubscribe()
    }
  }, [initializeOrders])

  if (!isReady) return null

  return (
    <AuthGate>
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        {/* Spacer takes sidebar's width in flex flow so main never overlaps.
            Sidebar itself is fixed-positioned (for drawer animation), so the
            flex container otherwise wouldn't reserve space for it. */}
        <div aria-hidden="true" className="hidden md:block w-64 shrink-0" />
        <main className="flex-1 min-w-0 overflow-y-auto pt-14 md:pt-0">
          <div className="max-w-[1280px] mx-auto px-4 py-6 md:px-6 lg:px-8 lg:py-8">{children}</div>
        </main>
        <CommandPalette />
      </div>
    </AuthGate>
  )
}
