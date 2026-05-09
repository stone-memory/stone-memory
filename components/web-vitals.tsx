"use client"

import { useReportWebVitals } from "next/web-vitals"

type Vital = {
  id: string
  name: "FCP" | "LCP" | "CLS" | "FID" | "TTFB" | "INP" | "Next.js-hydration" | "Next.js-route-change-to-render" | "Next.js-render"
  value: number
  delta: number
  rating?: "good" | "needs-improvement" | "poor"
}

export function WebVitalsReporter() {
  useReportWebVitals((metric: Vital) => {
    if (typeof window === "undefined") return
    const w = window as unknown as { gtag?: (...args: unknown[]) => void }
    if (typeof w.gtag !== "function") return

    const value = metric.name === "CLS" ? Math.round(metric.value * 1000) : Math.round(metric.value)

    w.gtag("event", metric.name, {
      event_category: "Web Vitals",
      event_label: metric.id,
      value,
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
      metric_rating: metric.rating,
      non_interaction: true,
    })
  })

  return null
}
