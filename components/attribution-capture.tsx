"use client"

import { useEffect } from "react"
import { captureAttribution } from "@/lib/attribution"

/**
 * Runs captureAttribution() once, as early as the client allows.
 *
 * Lives in the root layout rather than next to the lead form: the tagged URL is
 * whatever page the ad points at — usually a product page, not the page with
 * the form — so capture has to happen app-wide on first paint.
 *
 * Renders nothing and never throws; see lib/attribution.ts.
 */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution()
  }, [])

  return null
}
