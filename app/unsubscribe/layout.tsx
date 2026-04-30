import type { Metadata } from "next"

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://stonememory.com"

export const metadata: Metadata = {
  title: "Unsubscribe",
  description: "Unsubscribe from Stone Memory email updates.",
  alternates: { canonical: `${SITE}/unsubscribe` },
  // Token-based link, shouldn't be indexed.
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
