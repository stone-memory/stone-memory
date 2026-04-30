import type { Metadata } from "next"

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://stonememory.com"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Stone Memory privacy policy — how we collect, use and protect your personal data.",
  alternates: { canonical: `${SITE}/privacy` },
  // Legal boilerplate shouldn't compete in search for product keywords.
  robots: { index: false, follow: true },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
