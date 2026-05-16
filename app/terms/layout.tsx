import type { Metadata } from "next"
import { absoluteUrl } from "@/lib/site-config"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Stone Memory — conditions for using our website and services.",
  alternates: { canonical: absoluteUrl("/terms") },
  robots: { index: false, follow: true },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
