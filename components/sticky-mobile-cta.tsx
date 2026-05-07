"use client"

import { Phone, MessageCircle } from "lucide-react"
import { useChatStore } from "@/lib/store/chat"
import { useTranslation } from "@/lib/i18n/context"
import { useBusinessProfile } from "@/lib/store/business-profile"
import type { Locale } from "@/lib/types"

const labels: Record<Locale, { call: string; chat: string }> = {
  uk: { call: "Подзвонити", chat: "Чат" },
  pl: { call: "Zadzwoń", chat: "Czat" },
  en: { call: "Call", chat: "Chat" },
  de: { call: "Anruf", chat: "Chat" },
  lt: { call: "Skambinti", chat: "Čatas" },
}

export function StickyMobileCTA() {
  const { locale } = useTranslation()
  const L = labels[locale]
  const openChat = useChatStore((s) => s.open)
  const phone = useBusinessProfile().phone

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 md:hidden pointer-events-none">
      <div className="mx-3 mb-3 pointer-events-auto">
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-foreground/10 bg-background/95 p-2 shadow-hover backdrop-blur-md">
          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            className="flex flex-col items-center gap-0.5 rounded-xl bg-foreground/[0.04] py-2 text-[11px] font-medium text-foreground active:scale-[0.97] transition-transform"
          >
            <Phone className="h-4 w-4" strokeWidth={1.75} />
            {L.call}
          </a>
          <button
            type="button"
            onClick={() => openChat()}
            className="flex flex-col items-center gap-0.5 rounded-xl bg-foreground text-background py-2 text-[11px] font-medium active:scale-[0.97] transition-transform"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
            {L.chat}
          </button>
        </div>
      </div>
    </div>
  )
}
