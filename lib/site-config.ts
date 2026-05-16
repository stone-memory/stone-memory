/**
 * Single source of truth for the public site URL.
 *
 * `NEXT_PUBLIC_SITE_URL` may have a trailing slash in some environments
 * (it currently does on Vercel). Stripping it here means downstream
 * concatenations like `${SITE_URL}/sitemap.xml` can never produce
 * `https://stonememory.com.ua//sitemap.xml`.
 *
 * Use `absoluteUrl(path)` for building URLs — it normalizes the leading
 * slash on the path side, so callers don't have to think about it.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.stonememory.com.ua"
).replace(/\/+$/, "")

/**
 * Build an absolute URL by joining SITE_URL with a path.
 * Path may start with or without `/` — both work.
 *
 *   absoluteUrl()             → https://www.stonememory.com.ua
 *   absoluteUrl("/blog")      → https://www.stonememory.com.ua/blog
 *   absoluteUrl("blog")       → https://www.stonememory.com.ua/blog
 *   absoluteUrl("/blog/abc")  → https://www.stonememory.com.ua/blog/abc
 */
export function absoluteUrl(path: string = ""): string {
  if (!path) return SITE_URL
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  return `${SITE_URL}${cleanPath}`
}
