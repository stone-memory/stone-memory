"use client"

import { trackEvent } from "@/components/analytics-pixels"
import { type ReactNode } from "react"

type Props = {
  number: string
  source: string
  className?: string
  children: ReactNode
  ariaLabel?: string
}

export function PhoneLink({ number, source, className, children, ariaLabel }: Props) {
  const tel = number.replace(/\s+/g, "")
  return (
    <a
      href={`tel:${tel}`}
      className={className}
      aria-label={ariaLabel}
      onClick={() => trackEvent("phone_click", { source, number: tel })}
    >
      {children}
    </a>
  )
}
