import type { Metadata } from "next"
import { fetchArticles, fetchArticleBySlug } from "@/lib/data-source"

export const revalidate = 0
export const dynamicParams = true

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://stonememory.com"

export async function generateStaticParams() {
  const articles = await fetchArticles()
  return articles.map((a) => ({ slug: a.slug }))
}

type Params = { slug: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const a = await fetchArticleBySlug(slug)
  if (!a) return { title: "Article not found" }

  const url = `${SITE}/blog/${a.slug}`
  return {
    title: a.title.en,
    description: a.excerpt.en,
    alternates: { canonical: url },
    openGraph: {
      title: a.title.en,
      description: a.excerpt.en,
      url,
      type: "article",
      publishedTime: a.date,
      images: [{ url: a.cover, width: 1600, height: 1000, alt: a.title.en }],
    },
    twitter: {
      card: "summary_large_image",
      title: a.title.en,
      description: a.excerpt.en,
      images: [a.cover],
    },
  }
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<Params>
}) {
  const { slug } = await params
  const a = await fetchArticleBySlug(slug)
  const jsonLd = a
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: a.title.en,
        description: a.excerpt.en,
        image: [a.cover],
        datePublished: a.date,
        dateModified: a.date,
        author: { "@type": "Organization", name: "Stone Memory" },
        publisher: {
          "@type": "Organization",
          name: "Stone Memory",
          logo: { "@type": "ImageObject", url: `${SITE}/logo-512.png` },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}/blog/${a.slug}` },
      }
    : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  )
}
