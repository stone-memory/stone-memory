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
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.google-analytics.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://api.telegram.org https://maps.googleapis.com https://places.googleapis.com https://*.supabase.co wss://*.supabase.co",
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
}

export default nextConfig
