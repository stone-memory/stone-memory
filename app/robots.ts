import type { MetadataRoute } from "next"

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://stonememory.com"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/*"],
      },
    ],
    sitemap: [`${SITE}/sitemap.xml`, `${SITE}/sitemap-images.xml`],
    host: SITE,
  }
}
