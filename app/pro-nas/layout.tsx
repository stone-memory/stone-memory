import type { Metadata } from "next"
import { absoluteUrl } from "@/lib/site-config"

const PATH = "/pro-nas"

export const metadata: Metadata = {
  title: "Про Stone Memory — майстерня натурального каменю, Костопіль",
  description:
    "Stone Memory — майстерня натурального каменю в Костополі, Рівненщина. Два напрями: меморіальні комплекси та камінь для дому й саду (стільниці, підвіконня, каміни, сходи, бруківка). Український граніт і мармур та імпорт. Гарантія 5 років.",
  alternates: {
    canonical: absoluteUrl(PATH),
  },
  openGraph: {
    title: "Про Stone Memory",
    description: "Майстерня натурального каменю в Костополі. Пам'ятники, стільниці, підвіконня, каміни, сходи, бруківка.",
    url: absoluteUrl(PATH),
    type: "website",
    images: ["/opengraph-image"],
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
