import { notFound } from 'next/navigation'
import { pageMetadata } from '@/lib/stone/seo'
import { getSetting } from '@/lib/stone/cms'
import { GeoPage } from '@/components/stone/pages/geo-page'

type Props = { params: Promise<{ city: string }> }

export const dynamicParams = true
export async function generateStaticParams() {
  return Object.keys(await getSetting('geo')).map((city) => ({ city }))
}
export async function generateMetadata({ params }: Props) {
  const { city } = await params
  const d = (await getSetting('geo'))[city]
  if (!d) return {}
  return pageMetadata(`/kamin/stilnytsi/${city}`, { title: `Кам’яні стільниці у ${d.locative}` })
}
export default async function Page({ params }: Props) {
  const { city } = await params
  const d = (await getSetting('geo'))[city]
  if (!d) notFound()
  return <GeoPage city={city} data={d} />
}
