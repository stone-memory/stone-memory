import type { Locale } from "./config"

/**
 * Canonical → localized URL segment mapping.
 *
 * Pending user decision (Option A vs B) — currently configured as Option B
 * (canonical English paths preserved across all locales). To switch to
 * Option A (localized slugs), replace string values with per-locale objects:
 *
 *   "/services": {
 *     uk: "/poslugy",
 *     pl: "/uslugi",
 *     en: "/services",
 *     de: "/dienstleistungen",
 *     lt: "/paslaugos",
 *   },
 *
 * The helpers below already handle both shapes — switching is a data change.
 */
export const pathnames = {
  "/": "/",
  "/catalog": "/catalog",
  "/services": "/services",
  "/about": "/about",
  "/projects": "/projects",
  "/reviews": "/reviews",
  "/blog": "/blog",
  "/blog/[slug]": "/blog/[slug]",
  "/stones/[id]": "/stones/[id]",
  "/privacy": "/privacy",
  "/terms": "/terms",
  "/unsubscribe": "/unsubscribe",
} as const

export type CanonicalPath = keyof typeof pathnames

type PathMapping =
  | string
  | Partial<Record<Locale, string>>

/**
 * Build a localized URL given canonical path and locale.
 *
 *   getLocalizedPath("/", "uk")          // "/uk"
 *   getLocalizedPath("/services", "pl")  // "/pl/services"  (Option B)
 *                                         // "/pl/uslugi"   (Option A)
 *   getLocalizedPath("/stones/[id]", "uk")  // "/uk/stones/[id]"  — caller substitutes [id]
 */
export function getLocalizedPath(canonical: CanonicalPath, locale: Locale): string {
  const mapping = pathnames[canonical] as PathMapping

  if (typeof mapping === "string") {
    return mapping === "/" ? `/${locale}` : `/${locale}${mapping}`
  }

  const segment = mapping[locale]
  if (!segment) {
    // Should not happen if pathnames are well-formed, but guard against it.
    return `/${locale}${canonical}`
  }
  return `/${locale}${segment}`
}

/**
 * Reverse: given an incoming pathname (already known to start with /<locale>),
 * return the canonical key. Useful for middleware that wants to rewrite
 * localized slugs to canonical folder names.
 *
 *   getCanonicalPath("/pl/uslugi", "pl") // "/services" (Option A)
 *   getCanonicalPath("/uk", "uk")        // "/"
 *   getCanonicalPath("/de/unknown", "de")// null
 */
export function getCanonicalPath(
  localizedPath: string,
  locale: Locale
): CanonicalPath | null {
  // Strip the locale prefix; what remains is the localized segment.
  const stripped =
    localizedPath.replace(new RegExp(`^/${locale}(?=/|$)`), "") || "/"

  for (const [canonical, mapping] of Object.entries(pathnames) as Array<
    [CanonicalPath, PathMapping]
  >) {
    if (typeof mapping === "string") {
      // Universal path
      if (mapping === stripped) return canonical
      // Dynamic-segment match: compare templates ignoring [param]
      if (
        mapping.includes("[") &&
        templatesMatch(mapping, stripped)
      ) {
        return canonical
      }
    } else {
      const localized = mapping[locale]
      if (!localized) continue
      if (localized === stripped) return canonical
      if (localized.includes("[") && templatesMatch(localized, stripped)) {
        return canonical
      }
    }
  }
  return null
}

/**
 * Match a template like "/blog/[slug]" against a concrete path "/blog/foo".
 * Returns true when every literal segment matches and dynamic segments are
 * non-empty.
 */
function templatesMatch(template: string, actual: string): boolean {
  const t = template.split("/")
  const a = actual.split("/")
  if (t.length !== a.length) return false
  for (let i = 0; i < t.length; i++) {
    const ts = t[i]
    const as = a[i]
    if (ts.startsWith("[") && ts.endsWith("]")) {
      if (!as) return false
    } else if (ts !== as) {
      return false
    }
  }
  return true
}
