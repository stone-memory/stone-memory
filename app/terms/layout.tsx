import type { Metadata } from "next"
import { absoluteUrl } from "@/lib/site-config"

export const metadata: Metadata = {
  title: "Умови користування",
  description: "Умови користування Stone Memory — правила використання нашого сайту та послуг.",
  alternates: { canonical: absoluteUrl("/terms") },
  robots: { index: false, follow: true },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
