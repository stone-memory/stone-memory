import type { Metadata } from "next"
import { absoluteUrl } from "@/lib/site-config"

export const metadata: Metadata = {
  title: "Політика конфіденційності",
  description: "Політика конфіденційності Stone Memory — як ми збираємо, використовуємо та захищаємо ваші персональні дані.",
  alternates: { canonical: absoluteUrl("/konfidentsiinist") },
  // Legal boilerplate shouldn't compete in search for product keywords.
  robots: { index: false, follow: true },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
