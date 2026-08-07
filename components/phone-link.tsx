"use client"

import { trackEvent } from "@/components/analytics-pixels"
import { toTelHref } from "@/lib/phone-format"
import { type ReactNode } from "react"

type Props = {
  number: string
  source: string
  className?: string
  children: ReactNode
  ariaLabel?: string
}

export function PhoneLink({ number, source, className, children, ariaLabel }: Props) {
  const tel = toTelHref(number)
  return (
    <a
      href={tel}
      className={className}
      aria-label={ariaLabel}
      onClick={() => trackEvent("phone_click", { source, number: tel })}
    >
      {children}
    </a>
  )
}
