import type { Metadata } from "next"
import { absoluteUrl } from "@/lib/site-config"

export const metadata: Metadata = {
  title: "Unsubscribe",
  description: "Unsubscribe from Stone Memory email updates.",
  alternates: { canonical: absoluteUrl("/unsubscribe") },
  // Token-based link, shouldn't be indexed.
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
