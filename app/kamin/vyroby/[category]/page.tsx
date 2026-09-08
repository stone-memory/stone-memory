import { notFound } from 'next/navigation'
import { pageMetadata } from '@/lib/stone/seo'
import { categories } from '@/lib/stone/content'
import { CategoryPage } from '@/components/stone/pages/category-page'

type Props = { params: Promise<{ category: string }> }

export const dynamicParams = false
export function generateStaticParams() {
  return categories.map((x) => ({ category: x.slug }))
}
export async function generateMetadata({ params }: Props) {
  const { category } = await params
  const item = categories.find((x) => x.slug === category)
  if (!item) return {}
  return pageMetadata(`/kamin/vyroby/${category}`, { title: item.name })
}
export default async function Page({ params }: Props) {
  const { category } = await params
  if (!categories.some((x) => x.slug === category)) notFound()
  return <CategoryPage slug={category} />
}
