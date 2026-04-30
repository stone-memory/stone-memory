import type { Metadata } from "next"
import { fetchProjects } from "@/lib/data-source"

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://stonememory.com"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Projects — monuments, countertops, fireplaces, stairs",
  description:
    "Real completed projects by Stone Memory: memorial complexes, kitchen countertops, fireplaces, stairs, facades, paving. Natural stone, hand-finished in Kostopil.",
  alternates: {
    canonical: `${SITE}/projects`,
    languages: {
      "x-default": `${SITE}/projects`,
      en: `${SITE}/projects?lang=en`,
      uk: `${SITE}/projects?lang=uk`,
      pl: `${SITE}/projects?lang=pl`,
      de: `${SITE}/projects?lang=de`,
      lt: `${SITE}/projects?lang=lt`,
    },
  },
  openGraph: {
    title: "Stone Memory — Projects",
    description: "Real completed projects — memorials, countertops, fireplaces, stairs, facades, paving.",
    url: `${SITE}/projects`,
    type: "website",
  },
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const projects = await fetchProjects()

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Projects", item: `${SITE}/projects` },
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
      url: `${SITE}/projects#${p.slug}`,
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
