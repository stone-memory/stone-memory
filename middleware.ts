import { NextResponse, type NextRequest } from "next/server"
import {
  defaultLocale,
  isLocale,
  LOCALE_COOKIE,
  type Locale,
} from "@/lib/i18n/config"
import {
  findCanonicalKeyByCanonicalSegment,
  getCanonicalPath,
  getLocalizedPath,
  getLocalizedSegment,
  substituteParams,
} from "@/lib/i18n/pathnames"

/**
 * i18n routing middleware.
 *
 *   Bare URL                          → 307 to /<detected-locale><localized-path>, set cookie
 *   /<locale>/<localized-slug>        → internal rewrite to /<locale>/<canonical> (URL stays localized)
 *   /<non-en>/<canonical-en-slug>     → 301 to /<non-en>/<localized-slug>
 *   /<locale>/<unknown>               → pass through (Next 404s)
 *
 * Locale detection priority for bare URLs:
 *   1. `sm-locale` cookie (sticky preference)
 *   2. Vercel `x-vercel-ip-country` / Cloudflare `cf-ipcountry`
 *   3. `Accept-Language` header
 *   4. defaultLocale ("uk")
 *
 * No client-side IP lookups (ipapi.co et al.) — all locale resolution is
 * server-side and edge-cacheable.
 */

const COUNTRY_TO_LOCALE: Record<string, Locale> = {
  UA: "uk",
  PL: "pl",
  DE: "de",
  AT: "de",
  CH: "de",
  LT: "lt",
  US: "en",
  GB: "en",
  IE: "en",
  CA: "en",
  AU: "en",
  NZ: "en",
}

function pickFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null
  // "en-US,en;q=0.9,uk;q=0.8" → ordered by q-value descending
  const parts = header
    .split(",")
    .map((part) => {
      const [tag, ...rest] = part.trim().split(";")
      const qPart = rest.find((s) => s.trim().startsWith("q="))
      const q = qPart ? Number(qPart.trim().slice(2)) : 1
      return { tag: tag.trim().toLowerCase(), q: Number.isNaN(q) ? 1 : q }
    })
    .sort((a, b) => b.q - a.q)
  for (const { tag } of parts) {
    const short = tag.slice(0, 2)
    if (isLocale(short)) return short
  }
  return null
}

function detectLocale(req: NextRequest): Locale {
  // 1. Cookie — sticky preference wins.
  const cookieValue = req.cookies.get(LOCALE_COOKIE)?.value
  if (cookieValue && isLocale(cookieValue)) return cookieValue

  // 2. Edge-injected country header.
  const country =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    null
  if (country) {
    const mapped = COUNTRY_TO_LOCALE[country.toUpperCase()]
    if (mapped) return mapped
  }

  // 3. Accept-Language.
  const fromHeader = pickFromAcceptLanguage(req.headers.get("accept-language"))
  if (fromHeader) return fromHeader

  // 4. Default.
  return defaultLocale
}

function setLocaleCookie(res: NextResponse, locale: Locale, current: string | undefined) {
  if (current === locale) return
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const segments = pathname.split("/").filter(Boolean)
  const first = segments[0] ?? ""
  const currentCookie = req.cookies.get(LOCALE_COOKIE)?.value

  // ----- Case A: No locale prefix → redirect to localized URL.
  if (!isLocale(first)) {
    const locale = detectLocale(req)
    const url = req.nextUrl.clone()

    // Try to map the canonical-English path the user typed to the localized form.
    const canonicalKey = findCanonicalKeyByCanonicalSegment(pathname || "/")
    if (canonicalKey) {
      const localizedSegment = getLocalizedSegment(canonicalKey, locale)
      // Substitute dynamic params from the user's actual path into the localized template
      // (e.g. /stones/abc → segment "/kameni/[id]" → "/kameni/abc")
      const concrete =
        canonicalKey === "/"
          ? "/"
          : substituteParams(localizedSegment, pathname)
      url.pathname = locale === defaultLocale && canonicalKey === "/"
        ? `/${locale}`
        : `/${locale}${concrete === "/" ? "" : concrete}` || `/${locale}`
    } else {
      // Unknown path; just prepend locale and let it 404 if invalid.
      url.pathname = `/${locale}${pathname === "/" ? "" : pathname}` || `/${locale}`
    }

    const res = NextResponse.redirect(url, 307)
    setLocaleCookie(res, locale, currentCookie)
    res.headers.set("Vary", "Accept-Language, Cookie")
    return res
  }

  // ----- Case B: Locale prefix present.
  const locale = first
  const stripped = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), "") || "/"

  // B.1 — Did the user type a known localized slug for this locale?
  const canonicalKeyFromLocalized = getCanonicalPath(pathname, locale)
  if (canonicalKeyFromLocalized) {
    // For en, localized === canonical, no rewrite needed.
    // For non-en, rewrite internally so Next routes to app/[locale]/<canonical>/...
    if (locale === "en") {
      const res = NextResponse.next()
      setLocaleCookie(res, locale, currentCookie)
      return res
    }

    const canonicalStripped =
      canonicalKeyFromLocalized === "/"
        ? "/"
        : substituteParams(canonicalKeyFromLocalized, stripped)
    const canonicalUrl =
      canonicalStripped === "/"
        ? `/${locale}`
        : `/${locale}${canonicalStripped}`

    if (canonicalUrl === pathname) {
      const res = NextResponse.next()
      setLocaleCookie(res, locale, currentCookie)
      return res
    }

    const url = req.nextUrl.clone()
    url.pathname = canonicalUrl
    const res = NextResponse.rewrite(url)
    setLocaleCookie(res, locale, currentCookie)
    return res
  }

  // B.2 — Did the user type the canonical English slug under a non-en locale?
  const canonicalKeyFromCanonical = findCanonicalKeyByCanonicalSegment(stripped)
  if (canonicalKeyFromCanonical && locale !== "en") {
    const localizedSegment = getLocalizedSegment(canonicalKeyFromCanonical, locale)
    const concrete =
      canonicalKeyFromCanonical === "/"
        ? "/"
        : substituteParams(localizedSegment, stripped)
    const url = req.nextUrl.clone()
    url.pathname =
      concrete === "/" ? `/${locale}` : `/${locale}${concrete}`
    return NextResponse.redirect(url, 301)
  }

  // B.3 — Locale prefix but unrecognized path. Pass through.
  const res = NextResponse.next()
  setLocaleCookie(res, locale, currentCookie)
  return res
}

export const config = {
  matcher: [
    // Run for everything except internal/static/API/admin/asset routes.
    // `api` and `admin` are unanchored on the right so /api, /api/x, /admin,
    // /admin/x are all skipped. The `.*\..*` clause skips any path with a
    // file extension (e.g. /favicon.ico, /something.png).
    "/((?!_next/|_vercel/|api|admin|sitemap\\.xml|sitemap-images\\.xml|robots\\.txt|opengraph-image|favicon\\.ico|.*\\..*).*)",
  ],
}
