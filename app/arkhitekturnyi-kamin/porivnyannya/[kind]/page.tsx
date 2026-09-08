import { notFound } from 'next/navigation'
import { pageMetadata } from '@/lib/stone/seo'
import { getSetting } from '@/lib/stone/cms'
import { ComparisonPage } from '@/components/stone/pages/comparison'

type Props = { params: Promise<{ kind: string }> }

// /porivnyannya/materialiv — статичний сусід, сюди не потрапляє.
export const dynamicParams = true
export async function generateStaticParams() {
  return Object.keys(await getSetting('comparisons')).map((kind) => ({ kind }))
}
export async function generateMetadata({ params }: Props) {
  const { kind } = await params
  const c = (await getSetting('comparisons'))[kind]
  if (!c) return {}
  return pageMetadata(`/arkhitekturnyi-kamin/porivnyannya/${kind}`, { title: c.seoTitle || c.title })
}
export default async function Page({ params }: Props) {
  const { kind } = await params
  const c = (await getSetting('comparisons'))[kind]
  if (!c) notFound()
  return <ComparisonPage comparison={c} />
}
