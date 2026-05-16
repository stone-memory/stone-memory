import type { Metadata } from "next"
import { absoluteUrl } from "@/lib/site-config"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Stone Memory privacy policy — how we collect, use and protect your personal data.",
  alternates: { canonical: absoluteUrl("/privacy") },
  // Legal boilerplate shouldn't compete in search for product keywords.
  robots: { index: false, follow: true },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
