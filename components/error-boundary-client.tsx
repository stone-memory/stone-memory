"use client"

import { useEffect } from "react"
import { installClientErrorHandlers } from "@/lib/sentry"

/**
 * Підключає глобальні error handlers (window.onerror, unhandledrejection)
 * і відправляє у Sentry якщо `NEXT_PUBLIC_SENTRY_DSN` встановлено.
 * Якщо DSN відсутній — це no-op у проді, console.error у dev.
 */
export function ErrorBoundaryClient() {
  useEffect(() => {
    installClientErrorHandlers()
  }, [])
  return null
}
