"use client"

import { useBusinessProfile } from "@/lib/store/business-profile"
import { toTelHref } from "@/lib/phone-format"

/**
 * Посилання «подзвонити» з номером із бізнес-профілю. На сервері бере профіль
 * із провайдера кореневого layout, тому HTML уже містить актуальний номер.
 */
export function ProfilePhone({
  className,
  prefix,
  children,
}: {
  className?: string
  /** Текст перед номером, напр. «Або подзвоніть: ». */
  prefix?: string
  /** Іконка чи інший вміст перед номером. */
  children?: React.ReactNode
}) {
  const phone = useBusinessProfile().phone
  return (
    <a href={toTelHref(phone)} className={className}>
      {children}
      {prefix}
      {phone}
    </a>
  )
}
