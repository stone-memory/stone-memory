import type { Metadata } from "next"
import { absoluteUrl } from "@/lib/site-config"

const PATH = "/about"

export const metadata: Metadata = {
  title: "About Stone Memory — natural stone workshop, Kostopil",
  description:
    "Stone Memory is a natural-stone workshop in Kostopil, Rivne region. Two product lines — memorial complexes and home/garden stone (countertops, sills, fireplaces, stairs, paving). Ukrainian granite and marble plus imports. 5-year warranty.",
  alternates: {
    canonical: absoluteUrl(PATH),
    languages: {
      "x-default": absoluteUrl(PATH),
      en: `${absoluteUrl(PATH)}?lang=en`,
      uk: `${absoluteUrl(PATH)}?lang=uk`,
      pl: `${absoluteUrl(PATH)}?lang=pl`,
      de: `${absoluteUrl(PATH)}?lang=de`,
      lt: `${absoluteUrl(PATH)}?lang=lt`,
    },
  },
  openGraph: {
    title: "About Stone Memory",
    description: "Natural-stone workshop in Kostopil. Memorials, countertops, sills, fireplaces, stairs, paving.",
    url: absoluteUrl(PATH),
    type: "website",
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
