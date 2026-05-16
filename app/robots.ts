import type { MetadataRoute } from "next"
import { SITE_URL, absoluteUrl } from "@/lib/site-config"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/*"],
      },
    ],
    sitemap: [absoluteUrl("/sitemap.xml"), absoluteUrl("/sitemap-images.xml")],
    host: SITE_URL,
  }
}
