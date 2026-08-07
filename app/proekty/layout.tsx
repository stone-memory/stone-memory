import type { Metadata } from "next"
import { fetchProjects } from "@/lib/data-source"
import { absoluteUrl } from "@/lib/site-config"

const PATH = "/proekty"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Проєкти — пам'ятники, стільниці, каміни, сходи",
  description:
    "Реалізовані проєкти Stone Memory: меморіальні комплекси, кухонні стільниці, каміни, сходи, фасади, бруківка. Натуральний камінь, ручна обробка в Костополі.",
  alternates: {
    canonical: absoluteUrl(PATH),
  },
  openGraph: {
    title: "Stone Memory — Проєкти",
    description: "Реалізовані проєкти — пам'ятники, стільниці, каміни, сходи, фасади, бруківка.",
    url: absoluteUrl(PATH),
    type: "website",
    images: ["/opengraph-image"],
  },
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const projects = await fetchProjects()

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Projects", item: absoluteUrl(PATH) },
    ],
  }

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Stone Memory projects portfolio",
    numberOfItems: projects.length,
    itemListElement: projects.slice(0, 30).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.title.en || p.title.uk,
      url: `${absoluteUrl(PATH)}#${p.slug}`,
      image: p.cover,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      {children}
    </>
  )
}
