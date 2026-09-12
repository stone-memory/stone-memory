import { fetchArticles } from "@/lib/data-source"
import { BlogIndexClient } from "@/components/blog-index-client"

export const revalidate = 3600

export default async function BlogIndexPage() {
  const articles = await fetchArticles()
  return <BlogIndexClient initialArticles={articles} />
}
