import type { Metadata } from "next"
import { absoluteUrl } from "@/lib/site-config"

const PATH = "/blog"

export const metadata: Metadata = {
  title: "Journal — stone, memorials, design & care",
  description:
    "Expert guides on choosing granite, writing epitaphs, caring for stone across seasons, memorial architecture, and natural stone in modern interiors.",
  alternates: { canonical: absoluteUrl(PATH) },
  openGraph: {
    title: "The Stone Memory Journal",
    description:
      "History, materials, care and design in the world of stone.",
    url: absoluteUrl(PATH),
    type: "website",
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Journal", item: absoluteUrl(PATH) },
    ],
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  )
}
