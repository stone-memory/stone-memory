import { notFound } from 'next/navigation'
import { pageMetadata } from '@/lib/stone/seo'
import { getCollection, getCollections } from '@/lib/stone/cms'
import { StoneCollectionPage } from '@/components/stone/catalog/stone-collection-page'

type Props = { params: Promise<{ collection: string }> }

// Родини (granit, marmur…) і технічні сторінки (tovshchyny, finishi) — статичні
// сусідні сегменти, тому сюди потрапляють лише слаги колекцій з адмінки.
export const dynamicParams = true
export async function generateStaticParams() {
  return (await getCollections()).map((x) => ({ collection: x.slug }))
}
export async function generateMetadata({ params }: Props) {
  const { collection } = await params
  const c = await getCollection(collection)
  if (!c) return {}
  return pageMetadata(`/kamin/materialy/${collection}`, { title: c.name, image: c.image })
}
export default async function Page({ params }: Props) {
  const { collection } = await params
  const c = await getCollection(collection)
  if (!c) notFound()
  return <StoneCollectionPage collection={c} />
}
