import { fetchArticles } from "@/lib/data-source"
import { BlogIndexClient } from "@/components/blog-index-client"

export const revalidate = 60

export default async function BlogIndexPage() {
  const articles = await fetchArticles()
  return <BlogIndexClient initialArticles={articles} />
}
