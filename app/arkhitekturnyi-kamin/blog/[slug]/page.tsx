import { notFound } from 'next/navigation'
import { pageMetadata } from '@/lib/stone/seo'
import { getArticle, getArticles } from '@/lib/stone/cms'
import { ArticlePage } from '@/components/stone/pages/article-page'

type Props = { params: Promise<{ slug: string }> }

// Слаги приходять з адмінки: відомі — збираються наперед, нові — при першому
// відкритті, невідомі — 404.
export const dynamicParams = true
export async function generateStaticParams() {
  return (await getArticles()).map((x) => ({ slug: x.slug }))
}
export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const a = await getArticle(slug)
  if (!a) return {}
  return pageMetadata(`/arkhitekturnyi-kamin/blog/${slug}`, {
    title: a.title,
    description: a.description,
    image: a.image || `/blog/${a.slug}.webp`,
  })
}
export default async function Page({ params }: Props) {
  const { slug } = await params
  const a = await getArticle(slug)
  if (!a) notFound()
  return <ArticlePage article={a} />
}
