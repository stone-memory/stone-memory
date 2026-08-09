/**
 * Should this src bypass the Next.js image optimizer?
 *
 * Only two kinds genuinely have to: SVG (the optimizer refuses it unless
 * `dangerouslyAllowSVG` is set) and inline data: URIs (nothing to fetch and
 * optimise). Everything else — the Supabase Storage photos and the remote
 * hosts allow-listed in next.config.mjs — must go through it.
 *
 * This exists because several admin lists passed a bare `unoptimized`, which
 * made a 56×56 thumbnail download the full-size original. With ~3.3 MB per
 * photo and 62 rows that is roughly 200 MB to paint one table, which is what
 * made the admin stutter while scrolling.
 */
export function shouldBypassOptimizer(src: string | null | undefined): boolean {
  if (!src) return false
  return src.startsWith("data:") || src.split("?")[0].toLowerCase().endsWith(".svg")
}
