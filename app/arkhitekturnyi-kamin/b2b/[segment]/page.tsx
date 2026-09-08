import { notFound } from 'next/navigation'
import { pageMetadata } from '@/lib/stone/seo'
import { getSetting } from '@/lib/stone/cms'
import { ProfessionalPage, resolveProfessional } from '@/components/stone/pages/professional'

type Props = { params: Promise<{ segment: string }> }

// /b2b/slyaby і /b2b/prohrama — статичні сусіди, сюди не потрапляють.
export const dynamicParams = true
export async function generateStaticParams() {
  const pro = await getSetting('professional')
  return [
    ...pro.segments.map((x) => ({ segment: x.slug })),
    ...Object.keys(pro.specials).map((segment) => ({ segment })),
  ]
}
export async function generateMetadata({ params }: Props) {
  const { segment } = await params
  const data = resolveProfessional(await getSetting('professional'), segment)
  if (!data) return {}
  return pageMetadata(`/arkhitekturnyi-kamin/b2b/${segment}`, {
    title: data.seoTitle ?? data.title,
    image: '/detail-stone-edge.webp',
  })
}
export default async function Page({ params }: Props) {
  const { segment } = await params
  const pro = await getSetting('professional')
  if (!resolveProfessional(pro, segment)) notFound()
  return <ProfessionalPage slug={segment} />
}
