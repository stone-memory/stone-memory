import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LanguageProvider } from "@/lib/i18n/context"
import { PublicChrome } from "@/components/public-chrome"
import { NavProgress } from "@/components/nav-progress"
import { AnalyticsPixels } from "@/components/analytics-pixels"
import { CookieConsent } from "@/components/cookie-consent"
import { SkipLink } from "@/components/skip-link"
import "./globals.css"

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://stonememory.com"
const SITE_NAME = "Stone Memory"
const TITLE_DEFAULT = "Stone Memory — monuments, countertops, window sills, stairs and paving in natural stone"
const DESCRIPTION =
  "Natural stone for memory and for home: monuments, kitchen countertops, window sills, staircases, fireplaces and paving in granite and marble — Ukrainian stone plus imports from Italy, India, China and Brazil. Own workshop in Kostopil — design, production, installation, 5-year warranty."

const KEYWORDS_BASE = [
  "granite monuments", "marble monuments", "headstones", "gravestones", "tombstones",
  "memorial stones", "custom monument", "family memorial complex", "cross monument", "obelisk",
  "kitchen countertops", "granite countertops", "marble countertops", "quartzite countertops",
  "calacatta marble", "carrara marble", "black galaxy granite", "kashmir white",
  "window sills stone", "granite staircase", "marble stairs", "fireplace surround",
  "stone fireplace mantel", "paving stone", "granite cobblestone", "stone slabs",
  "decorative stone", "garden stone", "landscape stone", "stone engraving", "portrait engraving",
  "natural stone Ukraine", "stone workshop Kostopil", "memorial studio",
  "buy granite online", "stone price calculator", "stone delivery EU",
]
const KEYWORDS_UK = [
  "пам'ятники", "надгробки", "виготовлення пам'ятників", "пам'ятник на кладовище",
  "сімейний пам'ятник", "одиночний пам'ятник", "подвійний пам'ятник", "пам'ятник з хрестом",
  "граніт", "мармур", "габро", "лабрадорит", "кварцит", "вапняк", "онікс",
  "стільниці граніт", "стільниці мармур", "стільниці кухонні", "мармурова стільниця",
  "підвіконня камінь", "підвіконня мармур", "підвіконня граніт",
  "сходи з каменю", "гранітні сходи", "мармурові сходи", "балясини",
  "каміни портал", "камін мармуровий", "камін гранітний", "камінний портал",
  "бруківка", "гранітна бруківка", "бруківка волинська", "тротуарна плитка",
  "декоративний камінь", "декоративний щебінь", "плити гранітні", "слаб мармур",
  "камінь для саду", "фасад камінь", "гравіювання портретів", "епітафія золотом",
  "пам'ятник Київ", "пам'ятник Львів", "пам'ятник Одеса", "пам'ятник Рівне",
  "Carrara Calacatta", "Прилузький мармур", "Головинське габро", "Покостівський граніт",
  "Костопіль камінь", "ціна пам'ятника", "калькулятор вартості каменю",
]
const KEYWORDS_PL = [
  "pomniki granitowe", "pomniki marmurowe", "nagrobki", "pomnik pojedynczy", "pomnik podwójny",
  "pomnik z krzyżem", "kompleks rodzinny memorialny", "obelisk kamienny",
  "granit", "marmur", "gabro", "labradoryt", "kwarcyt", "wapień", "onyks",
  "blaty granitowe", "blaty marmurowe", "blaty kuchenne", "blat kwarcytowy",
  "parapety kamienne", "parapety marmurowe", "parapety granitowe",
  "schody granitowe", "schody marmurowe", "balustrady kamienne",
  "kominki kamienne", "kominek marmurowy", "portale kominkowe",
  "kostka brukowa granitowa", "kostka granitowa", "płyty chodnikowe granitowe",
  "kamień dekoracyjny", "płyty granitowe", "slab marmur",
  "kamień do ogrodu", "elewacja kamienna", "grawerowanie portretów",
  "Carrara Calacatta", "granit indyjski", "granit chiński", "kwarcyt brazylijski",
  "pomniki Warszawa", "pomniki Kraków", "ceny pomników", "kalkulator kamienia",
]
const KEYWORDS_DE = [
  "Grabmale", "Grabsteine", "Einzel-Grabmal", "Doppel-Grabmal", "Kreuzgrabmal",
  "Familien-Grabmal", "Obelisk", "Urnengrab",
  "Granit", "Marmor", "Gabbro", "Labradorit", "Quarzit", "Kalkstein", "Onyx",
  "Granit Arbeitsplatten", "Marmor Arbeitsplatten", "Küchenarbeitsplatten",
  "Fensterbänke Naturstein", "Fensterbänke Marmor", "Fensterbänke Granit",
  "Granittreppe", "Marmortreppe", "Innenraum-Treppe",
  "Kaminportal", "Kamin Marmor", "Kamin Granit",
  "Pflastersteine Granit", "Granit-Gehwegplatten",
  "Naturstein", "Dekorstein", "Gartensteine", "Natursteinfassade",
  "Steinmetz", "Denkmal", "Porträtgravur",
  "Carrara Calacatta", "indischer Granit", "chinesischer Granit", "brasilianischer Quarzit",
  "Grabmal Berlin", "Grabmal München", "Preis Grabmal", "Steinrechner",
]
const KEYWORDS_LT = [
  "paminklai", "antkapiai", "paminklas kapams", "vienvietis paminklas", "dvivietis paminklas",
  "paminklas su kryžiumi", "šeimos paminklas", "obeliskas",
  "granitas", "marmuras", "gabbras", "labradoritas", "kvarcitas", "klintis", "oniksas",
  "granito stalviršiai", "marmuro stalviršiai", "virtuvės stalviršiai",
  "palangės akmens", "palangės marmuro", "palangės granito",
  "granito laiptai", "marmuro laiptai", "laiptų turėklai",
  "židinio portalai", "židinys marmuro", "židinys granito",
  "grindinio akmenys", "granito grindinys", "trinkelės granitas",
  "dekoratyvinis akmuo", "granito plokštės", "marmuro plokštės",
  "akmuo sodui", "akmens fasadas", "portretų graviravimas",
  "Carrara Calacatta", "Indijos granitas", "Kinijos granitas", "Brazilijos kvarcitas",
  "paminklai Vilnius", "paminklai Kaunas", "paminklo kaina", "akmens skaičiuoklė",
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
  alternates: {
    canonical: SITE_URL,
    languages: {
      "x-default": SITE_URL,
      "en-GB": `${SITE_URL}/?lang=en`,
      "en-US": `${SITE_URL}/?lang=en`,
      en: `${SITE_URL}/?lang=en`,
      "uk-UA": `${SITE_URL}/?lang=uk`,
      uk: `${SITE_URL}/?lang=uk`,
      "pl-PL": `${SITE_URL}/?lang=pl`,
      pl: `${SITE_URL}/?lang=pl`,
      "de-DE": `${SITE_URL}/?lang=de`,
      "de-AT": `${SITE_URL}/?lang=de`,
      "de-CH": `${SITE_URL}/?lang=de`,
      de: `${SITE_URL}/?lang=de`,
      "lt-LT": `${SITE_URL}/?lang=lt`,
      lt: `${SITE_URL}/?lang=lt`,
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: TITLE_DEFAULT,
    description: DESCRIPTION,
    locale: "en_GB",
    alternateLocale: ["uk_UA", "pl_PL", "de_DE", "lt_LT"],
    images: [{ url: "/logo-512.png", width: 512, height: 512, alt: `${SITE_NAME} logo` }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE_DEFAULT,
    description: DESCRIPTION,
    images: ["/logo-512.png"],
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
  category: "home-and-garden",
  verification: {
    google: process.env.GOOGLE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
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
    "https://instagram.com/stonememory",
    "https://facebook.com/stonememory",
    "https://youtube.com/@stonememory",
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+380-67-808-02-22",
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
  telephone: "+380-67-808-02-22",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uk" className={inter.variable} data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://ipapi.co" crossOrigin="" />
      </head>
      <body className="font-sans antialiased bg-background">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />
        <LanguageProvider>
          <Suspense fallback={null}>
            <NavProgress />
          </Suspense>
          <SkipLink />
          {children}
          <PublicChrome />
          <CookieConsent />
        </LanguageProvider>
        <AnalyticsPixels />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
