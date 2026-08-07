import { notFound } from "next/navigation"
import { fetchArticleBySlug, fetchArticles } from "@/lib/data-source"
import { ArticleDetailClient } from "@/components/article-detail-client"

/**
 * Server component — see the note in components/article-detail-client.tsx.
 * fetchArticleBySlug() returns null only for a genuinely absent/hidden row, so
 * a Supabase outage cannot 404 the whole journal.
 */
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [article, articles] = await Promise.all([fetchArticleBySlug(slug), fetchArticles()])

  if (!article) notFound()

  return <ArticleDetailClient initialArticle={article} initialArticles={articles} />
}
