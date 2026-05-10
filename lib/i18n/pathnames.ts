import type { Locale } from "./config"

/**
 * Canonical → localized URL segment mapping. (Option A — localized slugs.)
 *
 * Keys are the canonical English paths used everywhere in code (route
 * groups, internal helpers, sitemap generators). Values are either:
 *   - a string: same segment in every locale (e.g. "/blog", "/")
 *   - a Partial<Record<Locale, string>>: per-locale slug
 *
 * Romanization notes:
 *   - Ukrainian: BGN/PCGN-ish — г→h, й→i, ц→ts, ь dropped.
 *   - Polish: diacritics stripped (ł→l, ć→c, ż→z).
 *   - German: umlauts expanded (ü→ue, ö→oe, ä→ae, ß→ss).
 *   - Lithuanian: diacritics stripped (ą→a, č→c, ė→e, etc.).
 *
 * Helpers below already handle both shapes, so flipping a single entry
 * back to a plain string (canonical English) is a one-line change.
 */
export const pathnames = {
  "/": "/",
  "/catalog": {
    uk: "/kataloh",
    pl: "/katalog",
    en: "/catalog",
    de: "/katalog",
    lt: "/katalogas",
  },
  "/services": {
    uk: "/posluhy",
    pl: "/uslugi",
    en: "/services",
    de: "/leistungen",
    lt: "/paslaugos",
  },
  "/about": {
    uk: "/pro-nas",
    pl: "/o-nas",
    en: "/about",
    de: "/ueber-uns",
    lt: "/apie-mus",
  },
  "/projects": {
    uk: "/proekty",
    pl: "/projekty",
    en: "/projects",
    de: "/projekte",
    lt: "/projektai",
  },
  "/reviews": {
    uk: "/vidhuky",
    pl: "/opinie",
    en: "/reviews",
    de: "/bewertungen",
    lt: "/atsiliepimai",
  },
  "/blog": "/blog",
  "/blog/[slug]": "/blog/[slug]",
  "/stones/[id]": {
    uk: "/kameni/[id]",
    pl: "/kamienie/[id]",
    en: "/stones/[id]",
    de: "/steine/[id]",
    lt: "/akmenys/[id]",
  },
  "/privacy": {
    uk: "/konfidentsiinist",
    pl: "/prywatnosc",
    en: "/privacy",
    de: "/datenschutz",
    lt: "/privatumas",
  },
  "/terms": {
    uk: "/umovy",
    pl: "/regulamin",
    en: "/terms",
    de: "/agb",
    lt: "/salygos",
  },
  "/unsubscribe": "/unsubscribe",
} as const

export type CanonicalPath = keyof typeof pathnames

type PathMapping =
  | string
  | Partial<Record<Locale, string>>

/**
 * Build a localized URL given canonical path and locale.
 *
 *   getLocalizedPath("/", "uk")             // "/uk"
 *   getLocalizedPath("/services", "pl")     // "/pl/uslugi"
 *   getLocalizedPath("/services", "en")     // "/en/services"
 *   getLocalizedPath("/stones/[id]", "uk")  // "/uk/kameni/[id]"  — caller substitutes [id]
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
 *   getCanonicalPath("/pl/uslugi", "pl")     // "/services"
 *   getCanonicalPath("/uk", "uk")            // "/"
 *   getCanonicalPath("/de/unknown", "de")    // null
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
