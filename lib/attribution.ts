/**
 * First-touch traffic attribution.
 *
 * Ad platforms append campaign tags to the landing URL
 * (?utm_source=google&utm_campaign=…&gclid=…). Those tags survive exactly one
 * page view: the moment the visitor clicks through to a second page the query
 * string is gone, and in this business the lead form is filled several pages
 * and sometimes several days later. Reading the tags at submit time therefore
 * yields nothing, always.
 *
 * So we capture on the FIRST page of the FIRST visit and keep it in
 * localStorage. First-touch (not last-touch) is deliberate: it answers "which
 * campaign bought this customer", which is the question the ad spend is judged
 * on. An existing record is never overwritten.
 *
 * Everything here is best-effort. localStorage throws in Safari private mode
 * and when storage is full, and this data must never be able to block a lead
 * from being submitted — every entry point swallows its own errors.
 */

const LS_KEY = "sm-attribution"

/** Tags we persist. Kept flat so the whole object serialises into one jsonb column. */
export type Attribution = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  /** Google Ads click id — required later for offline conversion import. */
  gclid?: string
  /** Meta click id. */
  fbclid?: string
  /** TikTok click id. */
  ttclid?: string
  /** Where they came from, e.g. "google.com". Empty on direct visits. */
  referrer?: string
  /** Path of the first page they landed on, e.g. "/kameni/12". */
  landing?: string
  /** ISO timestamp of the first visit. */
  first_seen?: string
}

const PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
  "ttclid",
] as const

/** Values longer than this are almost certainly junk or an injection attempt. */
const MAX_VALUE_LENGTH = 200

function sanitize(value: string): string {
  return value.trim().slice(0, MAX_VALUE_LENGTH)
}

/**
 * Read whatever attribution is already stored. Returns null when nothing was
 * captured — a direct visitor with no tags is a legitimate, common case.
 */
export function readAttribution(): Attribution | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(LS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Attribution
    // Guard against a hand-edited or corrupted entry.
    return parsed && typeof parsed === "object" ? parsed : null
  } catch {
    return null
  }
}

/**
 * Capture the current URL's campaign tags if we have not captured anything yet.
 * Safe to call on every page load; only the first one writes.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return
  try {
    // First touch wins — never overwrite an earlier campaign.
    if (window.localStorage.getItem(LS_KEY)) return

    const params = new URLSearchParams(window.location.search)
    const captured: Attribution = {}

    for (const key of PARAM_KEYS) {
      const value = params.get(key)
      if (value) captured[key] = sanitize(value)
    }

    const referrer = document.referrer
    // Ignore self-referrals: an internal navigation is not a traffic source.
    const isInternal = referrer.startsWith(window.location.origin)

    // A visitor with no tags and no external referrer is simply direct traffic.
    // Storing an empty record would just mean the next visit — which might
    // carry real tags — gets ignored, so bail out instead.
    const hasTags = Object.keys(captured).length > 0
    if (!hasTags && (!referrer || isInternal)) return

    if (referrer && !isInternal) {
      try {
        captured.referrer = new URL(referrer).hostname
      } catch {
        /* malformed referrer — not worth storing */
      }
    }
    captured.landing = window.location.pathname
    captured.first_seen = new Date().toISOString()

    window.localStorage.setItem(LS_KEY, JSON.stringify(captured))
  } catch {
    /* private mode, quota, disabled storage — attribution is optional */
  }
}

/** Fields accepted from the client, on top of the campaign params above. */
const CONTEXT_KEYS = ["referrer", "landing", "first_seen"] as const

/**
 * Validate an attribution object arriving from the browser before it is written
 * to the database.
 *
 * The payload is attacker-controlled — anyone can POST to /api/orders — so this
 * allow-lists known keys, drops everything else, and caps every value. Returns
 * null when there is nothing worth storing, so the column stays NULL rather
 * than holding an empty object.
 */
export function sanitizeAttribution(input: unknown): Attribution | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null

  const source = input as Record<string, unknown>
  const clean: Attribution = {}

  for (const key of [...PARAM_KEYS, ...CONTEXT_KEYS]) {
    const value = source[key]
    if (typeof value !== "string") continue
    const trimmed = sanitize(value)
    if (trimmed) clean[key] = trimmed
  }

  return Object.keys(clean).length > 0 ? clean : null
}
