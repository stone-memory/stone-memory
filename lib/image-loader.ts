"use client"

import widths from "./image-widths.json"

const WIDTHS = widths as number[]
const RASTER = /\.(webp|jpe?g|png)$/i

/**
 * Глобальний loader для next/image (next.config.mjs → images.loaderFile)
 * замість оптимізатора Vercel: той на Hobby має 5 тис. трансформацій на
 * місяць, і після вичерпання ліміту фото відповідали 402 — на сайті лишались
 * порожні рамки з alt-текстом.
 *
 *   /collections/x.webp?v=ab12  → /_img/w640/collections/x.webp.webp?v=ab12
 *     готова копія з CDN, нарізана під час збірки (scripts/image-variants.mjs)
 *   Supabase, зовнішні хости, /_next/static/media/*
 *                               → /api/img?url=…&w=640 (sharp + кеш CDN)
 *   svg, data:, blob:           → як є
 *
 * У dev копій немає (скрипт працює лише перед build), тому локальні фото
 * віддаються оригіналом.
 */
export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }): string {
  if (src.startsWith("data:") || src.startsWith("blob:")) return src
  const [path, query = ""] = src.split("?")
  if (path.toLowerCase().endsWith(".svg")) return src

  const w = WIDTHS.find((x) => x >= width) ?? WIDTHS[WIDTHS.length - 1]
  const local = path.startsWith("/") && !path.startsWith("//")

  if (local && !path.startsWith("/_next/") && RASTER.test(path)) {
    // w= лише щоб next/image не попереджав про loader без ширини.
    if (process.env.NODE_ENV !== "production") return `${path}?${query ? `${query}&` : ""}w=${w}`
    return `/_img/w${w}${path}.webp${query ? `?${query}` : ""}`
  }
  return `/api/img?url=${encodeURIComponent(src)}&w=${w}`
}
