import { fileURLToPath } from "node:url"
import { dirname } from "node:path"

/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== "production"
const projectRoot = dirname(fileURLToPath(import.meta.url))

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
    // Лише webp: кожен формат — окрема трансформація в лічильнику Vercel
    // (5 тис. на місяць на Hobby), а avif до того ж повільніший у кодуванні.
    formats: ["image/webp"],
    // Next 16 дозволяє лише q=75, поки інше не перелічено тут. 65 — для
    // карток каталогу (components/stone-card.tsx): мініатюри, де q75 давав
    // до 106 КБ на фото.
    qualities: [65, 75],
    // Next 16 забороняє query в локальних src, поки шлях не дозволено тут.
    // Фото каменю отримують ?v=<хеш вмісту> (scripts/asset-manifest.mjs +
    // lib/stone/asset-url.ts), щоб заміна файлу під тією ж адресою не
    // застрягала на 7 днів у кеші браузера й CDN. Точний ?v= на кожен файл
    // дозволити не можна: ліміт 25 записів, тож для чотирьох тек із фото
    // допускається будь-який query, для решти — жодного.
    localPatterns: [
      { pathname: "/**", search: "" },
      { pathname: "/materials/**" },
      { pathname: "/collections/**" },
      { pathname: "/blog/**" },
      { pathname: "/stone/**" },
    ],
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
    // Без experimental.inlineCss: перевірено 2026-09-15 — Next 16 кладе 150 КБ
    // CSS не лише в <style>, а ще й у RSC-payload кожного сегмента, і HTML
    // каталогу росте з 52 до 125 КБ gzip. Виграш ~100 мс на render-blocking
    // стилях цього не вартий.
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
      // ---- Catalogue moved to /memorial/pamyatnyky ----
      // ?cat=home included: that URL was live and linkable, so it must resolve
      // to something rather than 404.
      //
      // The "Дім і сад" direction is NOT dead — it now runs as a separate site
      // on its own subdomain, with its own repo. This redirect deliberately
      // does NOT point there: a 308 passes ranking signal and would tie the two
      // sites together in search, which is exactly what the split avoids. The
      // interior site earns its own traffic; this legacy URL stays here.
      // Хаб /memorial прибрано — він дублював навігацію, а вертикаль лишилась
      // одна. Сегмент /memorial/* живе далі як префікс шляху.
      // Старий дубль сторінки керамограніту в розділі каменю: слаг матеріалу
      // розходився зі слагом родини.
      { source: "/arkhitekturnyi-kamin/materialy/keramohranit", destination: "/arkhitekturnyi-kamin/materialy/keramogranit", permanent: true },
      // Розділ каменю переїхав з /kamin: адреса читалась як «камін», а всередині
      // розділу є категорія «Каміни». Сторінка порід для памʼятників — з тієї ж
      // причини: /memorial/kamin → /memorial/kameni.
      { source: "/kamin/materialy/keramohranit", destination: "/arkhitekturnyi-kamin/materialy/keramogranit", permanent: true },
      { source: "/kamin", destination: "/arkhitekturnyi-kamin", permanent: true },
      { source: "/kamin/:path*", destination: "/arkhitekturnyi-kamin/:path*", permanent: true },
      { source: "/memorial/kamin", destination: "/memorial/kameni", permanent: true },
      { source: "/memorial", destination: "/memorial/pamyatnyky", permanent: true },
      { source: "/kataloh", destination: "/memorial/pamyatnyky", permanent: true },
      { source: "/catalog", destination: "/memorial/pamyatnyky", permanent: true },
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
