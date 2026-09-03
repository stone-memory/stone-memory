import type { Metadata } from "next"
import { absoluteUrl } from "@/lib/site-config"

const PATH = "/pro-nas"

export const metadata: Metadata = {
  // No "Stone Memory" here — app/layout.tsx appends it via the title template.
  title: "Про нас — меморіальна майстерня в Костополі",
  description:
    "Меморіальна майстерня в Костополі. Пам'ятники, сімейні та військові комплекси, благоустрій поховання. Український граніт і габро. Гарантія 5 років.",
  alternates: {
    canonical: absoluteUrl(PATH),
  },
  openGraph: {
    title: "Про Stone Memory",
    description: "Меморіальна майстерня в Костополі. Пам'ятники, комплекси, гравіювання, монтаж.",
    url: absoluteUrl(PATH),
    type: "website",
    images: ["/opengraph-image"],
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
