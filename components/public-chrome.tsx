"use client"

import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { FloatingCallButton } from "@/components/floating-call-button"
import { StickyMobileCTA } from "@/components/sticky-mobile-cta"

// Чат — без SSR і окремим чанком: до кліку він показує лише кнопку, а його
// код (бот, стор, налаштування з API) інакше входив у перший пакет скриптів
// кожної сторінки й змагався за канал із LCP-зображенням на мобільному.
// Кнопка з'являється після гідратації — на пів секунди пізніше, ніж решта.
const ChatWidget = dynamic(() => import("@/components/chat-widget").then((m) => m.ChatWidget), { ssr: false })

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
