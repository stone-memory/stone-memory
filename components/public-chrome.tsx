"use client"

import { usePathname } from "next/navigation"
import { ChatWidget } from "@/components/chat-widget"
import { FloatingCallButton } from "@/components/floating-call-button"
import { StickyMobileCTA } from "@/components/sticky-mobile-cta"
import { PriceCalculator } from "@/components/price-calculator"

// Wraps every floating widget aimed at site visitors (chat, call button,
// mobile CTA, quote calculator). Hidden on /admin so the CRM UI stays clean.
export function PublicChrome() {
  const pathname = usePathname()
  if (pathname?.startsWith("/admin")) return null

  return (
    <>
      <ChatWidget />
      <FloatingCallButton />
      <PriceCalculator />
      <StickyMobileCTA />
    </>
  )
}
