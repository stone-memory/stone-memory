import type { Metadata } from "next"
import { absoluteUrl } from "@/lib/site-config"

const PATH = "/blog"

export const metadata: Metadata = {
  title: "Журнал — камінь, пам'ятники, дизайн і догляд",
  description:
    "Експертні гайди: як вибрати граніт, написати епітафію, доглядати за каменем у різні сезони, меморіальна архітектура та натуральний камінь у сучасних інтер'єрах.",
  alternates: { canonical: absoluteUrl(PATH) },
  openGraph: {
    title: "Журнал Stone Memory",
    description:
      "Історія, матеріали, догляд і дизайн у світі каменю.",
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
