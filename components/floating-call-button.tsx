"use client"

import { Phone } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"
import { useBusinessProfile } from "@/lib/store/business-profile"
import type { Locale } from "@/lib/types"

const CALL_LABEL: Record<Locale, string> = {
  uk: "Подзвонити",
  en: "Call us",
  pl: "Zadzwoń",
  de: "Anrufen",
  lt: "Skambinti",
}

// Desktop-only floating call button, sits above the chat FAB.
// On mobile we already have a dedicated Call button in StickyMobileCTA,
// so we hide this one with `md:inline-flex` / `hidden`.
export function FloatingCallButton() {
  const { locale } = useTranslation()
  const profile = useBusinessProfile()
  const phone = profile.phone
  const href = `tel:${phone.replace(/\s+/g, "")}`
  const label = CALL_LABEL[locale]

  return (
    <a
      href={href}
      aria-label={label}
      title={`${label}: ${phone}`}
      className="fixed bottom-[5.5rem] right-5 z-40 hidden md:inline-flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-hover transition-transform hover:-translate-y-0.5 active:scale-[0.97]"
    >
      <Phone className="h-5 w-5" strokeWidth={2} />
    </a>
  )
}
