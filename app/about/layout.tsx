import type { Metadata } from "next"

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://stonememory.com.ua.ua"

export const metadata: Metadata = {
  title: "About Stone Memory — natural stone workshop, Kostopil",
  description:
    "Stone Memory is a natural-stone workshop in Kostopil, Rivne region. Two product lines — memorial complexes and home/garden stone (countertops, sills, fireplaces, stairs, paving). Ukrainian granite and marble plus imports. 5-year warranty.",
  alternates: {
    canonical: `${SITE}/about`,
    languages: {
      "x-default": `${SITE}/about`,
      en: `${SITE}/about?lang=en`,
      uk: `${SITE}/about?lang=uk`,
      pl: `${SITE}/about?lang=pl`,
      de: `${SITE}/about?lang=de`,
      lt: `${SITE}/about?lang=lt`,
    },
  },
  openGraph: {
    title: "About Stone Memory",
    description: "Natural-stone workshop in Kostopil. Memorials, countertops, sills, fireplaces, stairs, paving.",
    url: `${SITE}/about`,
    type: "website",
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
