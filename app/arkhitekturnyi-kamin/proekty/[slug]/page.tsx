import { notFound } from 'next/navigation'
import { pageMetadata } from '@/lib/stone/seo'
import { getProject, getProjects } from '@/lib/stone/cms'
import { ProjectDetail } from '@/components/stone/pages/project-detail'

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = true
export async function generateStaticParams() {
  return (await getProjects()).map((x) => ({ slug: x.slug }))
}
export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const p = await getProject(slug)
  if (!p) return {}
  return pageMetadata(`/arkhitekturnyi-kamin/proekty/${slug}`, { title: p.name, image: p.image })
}
export default async function Page({ params }: Props) {
  const { slug } = await params
  const p = await getProject(slug)
  if (!p) notFound()
  return <ProjectDetail project={p} />
}
