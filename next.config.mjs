import { fileURLToPath } from "node:url"
import { dirname } from "node:path"

/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== "production"
const projectRoot = dirname(fileURLToPath(import.meta.url))

// Strict CSP — we allow inline style (Tailwind/Framer) + Next.js inline scripts via nonces in production.
// In dev, Next.js Turbopack needs unsafe-eval, so we relax there.
const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  // clarity.ms: components/analytics-pixels.tsx injects the Microsoft Clarity
  // tag (id wol8xdpeuc) but the host was never allow-listed, so the browser
  // blocked it and Clarity has been collecting nothing.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://*.googletagmanager.com https://www.google-analytics.com https://*.clarity.ms`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  // Analytics beacons. GA4 does NOT report to www.google-analytics.com — it
  // posts to a regional endpoint (region1.analytics.google.com/g/collect for
  // EU traffic), which connect-src never allowed. Every event was refused, so
  // GA4 has been installed but recording nothing. Wildcards cover the other
  // regions and the *.google-analytics.com fallbacks.
  //
  // No ipapi.co: the geo lookup it served was removed from
  // lib/i18n/context.tsx — its free quota answered 429 on every call and it
  // added nothing over navigator.language.
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://stats.g.doubleclick.net https://api.telegram.org https://maps.googleapis.com https://places.googleapis.com https://*.supabase.co wss://*.supabase.co https://*.clarity.ms https://*.bing.com",
  "frame-src 'self' https://www.openstreetmap.org https://www.google.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ")

const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: {
    root: projectRoot,
  },
  // Let Next.js optimise remote images — huge LCP + bandwidth win
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Pinterest CDN — для блогу і прикладів робіт.
      // Pinterest роздає зображення без watermark по ID; URL формату
      // https://i.pinimg.com/originals/<ab>/<cd>/<ef>/<hash>.jpg
      { protocol: "https", hostname: "i.pinimg.com" },
      { protocol: "https", hostname: "*.pinimg.com" },
      // Supabase Storage public URLs — admin-uploaded images live here.
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async headers() {
    const securityHeaders = [
      { key: "Content-Security-Policy", value: cspDirectives },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      { key: "X-XSS-Protection", value: "0" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Cross-Origin-Resource-Policy", value: "same-site" },
    ]
    const routes = [{ source: "/:path*", headers: securityHeaders }]
    if (!isDev) {
      routes.push(
        { source: "/_next/static/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
        { source: "/:path*.(jpg|jpeg|png|webp|avif|svg|ico|woff2)", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
      )
    }
    return routes
  },
  // Legacy English paths → localized Ukrainian slugs (uk is the priority
  // market, served at root with no locale prefix). 308 permanent so
  // search engines transfer ranking signal. Query strings are forwarded
  // automatically by Next. Single-segment `source` matches the exact
  // route only — it does NOT touch public assets like
  // /services/hero.jpg or /stones/memorial-01.svg.
  async redirects() {
    return [
      { source: "/catalog", destination: "/kataloh", permanent: true },
      { source: "/services", destination: "/posluhy", permanent: true },
      { source: "/about", destination: "/pro-nas", permanent: true },
      { source: "/projects", destination: "/proekty", permanent: true },
      { source: "/reviews", destination: "/vidhuky", permanent: true },
      { source: "/privacy", destination: "/konfidentsiinist", permanent: true },
      { source: "/terms", destination: "/umovy", permanent: true },
      // Numeric ids only — keeps /stones/memorial-01.svg (public asset) intact.
      { source: "/stones/:id(\\d+)", destination: "/kameni/:id", permanent: true },
    ]
  },
}

export default nextConfig
