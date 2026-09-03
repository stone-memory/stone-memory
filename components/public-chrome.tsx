"use client"

import { usePathname } from "next/navigation"
import { ChatWidget } from "@/components/chat-widget"
import { FloatingCallButton } from "@/components/floating-call-button"
import { StickyMobileCTA } from "@/components/sticky-mobile-cta"

// Wraps every floating widget aimed at site visitors (chat, call button,
// mobile CTA). Hidden on /admin so the CRM UI stays clean.
//
// The price calculator used to live here too. It was removed: nothing ever
// called its open() so it was unreachable, and its rates were five hardcoded
// constants that only a redeploy could change — unworkable for a price list
// that moves. Quotes are handled by consultants instead.
export function PublicChrome() {
  const pathname = usePathname()
  if (pathname?.startsWith("/admin")) return null

  return (
    <>
      <ChatWidget />
      <FloatingCallButton />
      <StickyMobileCTA />
    </>
  )
}
