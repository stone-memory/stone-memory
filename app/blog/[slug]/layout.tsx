import type { Metadata } from "next"
import { fetchArticles, fetchArticleBySlug } from "@/lib/data-source"
import { absoluteUrl } from "@/lib/site-config"

export const revalidate = 60
export const dynamicParams = true

export async function generateStaticParams() {
  const articles = await fetchArticles()
  return articles.map((a) => ({ slug: a.slug }))
}

type Params = { slug: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const a = await fetchArticleBySlug(slug)
  if (!a) return { title: "Статтю не знайдено" }

  // uk is the priority market — prefer the Ukrainian copy, fall back to
  // English only if a translation is missing.
  const title = a.title.uk || a.title.en
  const excerpt = a.excerpt.uk || a.excerpt.en
  const url = absoluteUrl(`/blog/${a.slug}`)
  return {
    title,
    description: excerpt,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: excerpt,
      url,
      type: "article",
      publishedTime: a.date,
      images: [{ url: a.cover, width: 1600, height: 1000, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: excerpt,
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
        headline: a.title.uk || a.title.en,
        description: a.excerpt.uk || a.excerpt.en,
        image: [a.cover],
        datePublished: a.date,
        dateModified: a.date,
        author: { "@type": "Organization", name: "Stone Memory" },
        publisher: {
          "@type": "Organization",
          name: "Stone Memory",
          logo: { "@type": "ImageObject", url: absoluteUrl("/logo-512.png") },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/blog/${a.slug}`) },
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
