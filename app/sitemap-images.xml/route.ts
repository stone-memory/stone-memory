import { fetchStones, fetchProjects } from "@/lib/data-source"
import { absoluteUrl } from "@/lib/site-config"
import { stonePath } from "@/lib/catalog-taxonomy"
import { stoneAlt } from "@/lib/stone-meta"

export const revalidate = 60
export const dynamic = "force-static"

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

// Dedicated image sitemap — helps Google Images understand which pages own
// which product/project photos. Referenced from robots.ts as a secondary
// sitemap in addition to the main one.
export async function GET(): Promise<Response> {
  const [stones, projects] = await Promise.all([fetchStones(), fetchProjects()])

  const parts: string[] = []
  parts.push('<?xml version="1.0" encoding="UTF-8"?>')
  parts.push(
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ' +
      'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'
  )

  // Memorial products only, and always via stonePath(). This sitemap used to
  // emit /kameni/:id for all 60 products — every one of which now 308s, and a
  // sitemap full of redirects is reported as "Page with redirect" and dropped.
  for (const s of stones) {
    if (s.category !== "memorial") continue
    const images = s.gallery && s.gallery.length > 0 ? s.gallery : [s.imagePath]
    parts.push("<url>")
    parts.push(`  <loc>${esc(absoluteUrl(stonePath(s)))}</loc>`)
    for (const img of images) {
      parts.push("  <image:image>")
      parts.push(`    <image:loc>${esc(img)}</image:loc>`)
      // Descriptive title, not "No. 1" — this is the text Google Images reads.
      parts.push(`    <image:title>${esc(stoneAlt(s))}</image:title>`)
      parts.push("  </image:image>")
    }
    parts.push("</url>")
  }

  for (const p of projects) {
    parts.push("<url>")
    parts.push(`  <loc>${esc(absoluteUrl("/proekty"))}</loc>`)
    parts.push("  <image:image>")
    parts.push(`    <image:loc>${esc(p.cover)}</image:loc>`)
    parts.push(`    <image:title>${esc(p.title.en || p.title.uk)}</image:title>`)
    parts.push(`    <image:caption>${esc(`${p.city}, ${p.year}`)}</image:caption>`)
    parts.push("  </image:image>")
    parts.push("</url>")
  }

  parts.push("</urlset>")

  return new Response(parts.join("\n"), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=600",
    },
  })
}
