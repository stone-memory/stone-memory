import type { Metadata } from "next"

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://stonememory.com"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Stone Memory — conditions for using our website and services.",
  alternates: { canonical: `${SITE}/terms` },
  robots: { index: false, follow: true },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
