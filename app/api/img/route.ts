import sharp from "sharp"
import widths from "@/lib/image-widths.json"

export const runtime = "nodejs"

/**
 * Зменшені копії фото, яких немає в public/ на момент збірки: завантаження з
 * адмінки (Supabase Storage), зовнішні хости з блогу та статичні імпорти
 * (/_next/static/media/*). Локальні фото сюди не ходять — для них копії ріже
 * scripts/image-variants.mjs. Адреси будує lib/image-loader.ts.
 *
 * Замінює оптимізатор Vercel (/_next/image), ліміт якого на Hobby вичерпався.
 * Відповідь кешується на CDN і в браузері, тож функція працює раз на фото й
 * ширину; ?v=<хеш> в адресі оригіналу дозволяє кешувати назавжди.
 */
const WIDTHS = new Set(widths as number[])
const MAX_SOURCE = 25 * 1024 * 1024
const QUALITY = 72

// Ті самі хости, що в images.remotePatterns (next.config.mjs).
function isAllowedRemote(u: URL): boolean {
  if (u.protocol !== "https:") return false
  const h = u.hostname
  if (h.endsWith(".supabase.co")) return u.pathname.startsWith("/storage/v1/object/public/")
  return (
    h === "images.unsplash.com" ||
    h === "plus.unsplash.com" ||
    h === "lh3.googleusercontent.com" ||
    h === "i.pinimg.com" ||
    h.endsWith(".pinimg.com")
  )
}

function bad(status: number, message: string) {
  return new Response(message, { status, headers: { "Cache-Control": "no-store" } })
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams
  const src = params.get("url") ?? ""
  const w = Number(params.get("w"))
  if (!WIDTHS.has(w)) return bad(400, "bad width")

  let target: URL
  if (src.startsWith("/_next/static/media/") && !src.includes("..")) {
    target = new URL(src, req.url)
  } else {
    try {
      target = new URL(src)
    } catch {
      return bad(400, "bad url")
    }
    if (!isAllowedRemote(target)) return bad(400, "host not allowed")
  }

  let buf: Buffer
  try {
    const upstream = await fetch(target, { signal: AbortSignal.timeout(15_000) })
    if (!upstream.ok) return bad(upstream.status === 404 ? 404 : 502, "upstream error")
    if (!(upstream.headers.get("content-type") ?? "").startsWith("image/")) return bad(415, "not an image")
    buf = Buffer.from(await upstream.arrayBuffer())
  } catch {
    return bad(504, "upstream timeout")
  }
  if (buf.byteLength > MAX_SOURCE) return bad(413, "source too large")

  let out: Buffer
  try {
    out = await sharp(buf).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: QUALITY }).toBuffer()
  } catch {
    return bad(415, "cannot decode")
  }

  const versioned = target.searchParams.has("v") || src.startsWith("/_next/static/media/")
  return new Response(new Uint8Array(out), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": versioned
        ? "public, max-age=31536000, immutable"
        : "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800",
    },
  })
}
