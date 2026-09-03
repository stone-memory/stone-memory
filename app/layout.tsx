import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LanguageProvider } from "@/lib/i18n/context"
import { PublicChrome } from "@/components/public-chrome"
import { NavProgress } from "@/components/nav-progress"
import { AnalyticsPixels } from "@/components/analytics-pixels"
import { WebVitalsReporter } from "@/components/web-vitals"
import { CookieConsent } from "@/components/cookie-consent"
import { AttributionCapture } from "@/components/attribution-capture"
import { SkipLink } from "@/components/skip-link"
import { ErrorBoundaryClient } from "@/components/error-boundary-client"
import { SITE_URL } from "@/lib/site-config"
import { fetchNavSettings } from "@/lib/data-source"
import { NavSettingsProvider } from "@/components/nav-settings-provider"
import "./globals.css"

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
})

const SITE_NAME = "Stone Memory"
// Kept under ~65 / ~160 chars so neither is truncated in the SERP.
//
// Memorial-only since the home/countertop line was discontinued. The previous
// copy promised "стільниці, підвіконня, сходи, бруківка" in the <title> of
// every page on the site — the single most visible place to advertise a
// product range that no longer exists.
const TITLE_DEFAULT = "Stone Memory — пам'ятники з граніту та мармуру від виробника"
const DESCRIPTION =
  "Пам'ятники, меморіальні комплекси й надгробки з граніту, габро та мармуру. Власна майстерня в Костополі: дизайн, гравіювання, монтаж, гарантія 5 років."

// Countertop / window-sill / paving / fireplace terms removed across every
// locale — that product line is discontinued, and keywords describing goods
// the site does not sell attract traffic that can only bounce.
const KEYWORDS_BASE = [
  "granite monuments", "marble monuments", "headstones", "gravestones", "tombstones",
  "memorial stones", "custom monument", "family memorial complex", "cross monument", "obelisk",
  "grave marker", "military memorial", "columbarium plaque", "grave restoration",
  "stone engraving", "portrait engraving", "epitaph engraving",
  "natural stone Ukraine", "stone workshop Kostopil", "memorial studio",
  "monument installation", "monument price", "monument delivery EU",
]
const KEYWORDS_UK = [
  "пам'ятники", "надгробки", "виготовлення пам'ятників", "пам'ятник на кладовище",
  "сімейний пам'ятник", "одиночний пам'ятник", "подвійний пам'ятник", "пам'ятник з хрестом",
  "меморіальний комплекс", "військовий пам'ятник", "пам'ятник військовослужбовцю",
  "стела на могилу", "обеліск", "хрест гранітний", "квітник на могилу", "огорожа на могилу",
  "граніт", "мармур", "габро", "лабрадорит",
  "гравіювання портретів", "епітафія золотом", "портрет на граніті",
  "благоустрій місця поховання", "встановлення пам'ятника", "реставрація пам'ятника",
  "пам'ятник Київ", "пам'ятник Львів", "пам'ятник Одеса", "пам'ятник Рівне",
  "Головинське габро", "Покостівський граніт", "Лезниківський граніт",
  "Костопіль пам'ятники", "ціна пам'ятника", "купити пам'ятник",
]
const KEYWORDS_PL = [
  "pomniki granitowe", "pomniki marmurowe", "nagrobki", "pomnik pojedynczy", "pomnik podwójny",
  "pomnik z krzyżem", "kompleks rodzinny memorialny", "obelisk kamienny",
  "stela nagrobna", "pomnik wojskowy", "renowacja nagrobków", "montaż nagrobka",
  "granit", "marmur", "gabro", "labradoryt",
  "grawerowanie portretów", "epitafium złotem", "portret na granicie",
  "granit indyjski", "granit chiński", "gabro ukraińskie",
  "pomniki Warszawa", "pomniki Kraków", "ceny pomników",
]
const KEYWORDS_DE = [
  "Grabmale", "Grabsteine", "Einzel-Grabmal", "Doppel-Grabmal", "Kreuzgrabmal",
  "Familien-Grabmal", "Obelisk", "Urnengrab", "Grabplatte", "Grabeinfassung",
  "Granit", "Marmor", "Gabbro", "Labradorit",
  "Steinmetz", "Denkmal", "Porträtgravur", "Grabinschrift", "Grabmal Restaurierung",
  "Grabmal Montage", "indischer Granit", "chinesischer Granit",
  "Grabmal Berlin", "Grabmal München", "Preis Grabmal",
]
const KEYWORDS_LT = [
  "paminklai", "antkapiai", "paminklas kapams", "vienvietis paminklas", "dvivietis paminklas",
  "paminklas su kryžiumi", "šeimos paminklas", "obeliskas", "kapo tvorelė", "kapo plokštė",
  "granitas", "marmuras", "gabbras", "labradoritas",
  "portretų graviravimas", "epitafija", "paminklo restauravimas", "paminklo montavimas",
  "Indijos granitas", "Kinijos granitas",
  "paminklai Vilnius", "paminklai Kaunas", "paminklo kaina",
]

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE_DEFAULT,
    template: "%s — Stone Memory",
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  generator: "Next.js",
  keywords: [...KEYWORDS_BASE, ...KEYWORDS_UK, ...KEYWORDS_PL, ...KEYWORDS_DE, ...KEYWORDS_LT],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  // No `languages` map — see the note in app/sitemap.ts. `?lang=xx` serves the
  // same Ukrainian HTML as the bare URL, so advertising those as hreflang
  // alternates pointed Google at five duplicates of one document. Restore this
  // once i18n Phase 3 ships real per-locale paths.
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: TITLE_DEFAULT,
    description: DESCRIPTION,
    // Matches what the server actually renders (<html lang="uk">).
    locale: "uk_UA",
    alternateLocale: ["en_GB", "pl_PL", "de_DE", "lt_LT"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE_DEFAULT,
    description: DESCRIPTION,
    creator: "@stonememory",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon-light-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-light-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/icon-light-32x32.png",
  },
  manifest: "/manifest.webmanifest",
  category: "funeral-services",
  verification: {
    google: process.env.GOOGLE_VERIFICATION || "CgpIMtWUMYYh5IQ-WxPu-FygMeyt_syD4dtU2w06Oms",
    other: {
      "msvalidate.01": process.env.BING_VERIFICATION || "",
    },
  },
  other: {
    "format-detection": "telephone=no",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F5F7" },
    { media: "(prefers-color-scheme: dark)", color: "#F5F5F7" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: ["en", "uk", "pl", "de", "lt"],
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/?q={search_term_string}#catalog`,
    },
    "query-input": "required name=search_term_string",
  },
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo-512.png`,
  description: DESCRIPTION,
  sameAs: [
    "https://www.instagram.com/sttonememory/",
    "https://www.facebook.com/profile.php?id=61588950935616",
    "https://youtube.com/@stonememory",
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+380688080222",
      contactType: "customer service",
      areaServed: ["UA", "PL", "DE", "LT", "EU"],
      availableLanguage: ["uk", "pl", "de", "lt", "en"],
    },
  ],
}

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  "@id": `${SITE_URL}/#store`,
  name: SITE_NAME,
  image: `${SITE_URL}/logo-512.png`,
  url: SITE_URL,
  telephone: "+380688080222",
  priceRange: "€€–€€€€",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Hranitna St, 12",
    addressLocality: "Kostopil",
    addressRegion: "Rivne Oblast",
    postalCode: "35000",
    addressCountry: "UA",
  },
  areaServed: [
    { "@type": "Country", name: "Ukraine" },
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "19:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "10:00",
      closes: "16:00",
    },
  ],
  paymentAccepted: "Cash, Credit Card, Bank Transfer",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const navSettings = await fetchNavSettings()
  return (
    <html lang="uk" className={inter.variable} data-scroll-behavior="smooth">
      <head>
        {/* No preconnect here on purpose. The hints used to point at
            images.unsplash.com, which the site no longer requests — PSI flags
            it as "Unused preconnect". Supabase is not a candidate either:
            product photos are fetched server-side by /_next/image, so the
            browser only ever talks to our own origin. */}
      </head>
      <body className="font-sans antialiased bg-background">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PF5ZCX4P"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />
        <ErrorBoundaryClient />
        <LanguageProvider>
          <NavSettingsProvider value={navSettings}>
            <Suspense fallback={null}>
              <NavProgress />
            </Suspense>
            <SkipLink />
            {children}
            <PublicChrome />
            <CookieConsent />
          </NavSettingsProvider>
        </LanguageProvider>
        <AttributionCapture />
        <AnalyticsPixels />
        <WebVitalsReporter />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
