import { withLocale } from '@/lib/i18n/with-locale'
import { notFound } from 'next/navigation'
import { pageMetadata } from '@/lib/stone/seo'
import { getCollection, getProject, getProjects } from '@/lib/stone/cms'
import { getLocalizedProject } from '@/lib/stone/i18n-content'
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
async function Page({ params }: Props) {
  const { slug } = await params
  const p = await getLocalizedProject(slug)
  if (!p) notFound()
  const material = await getCollection(p.materialSlug)
  return <ProjectDetail project={p} materialAvailable={Boolean(material)} />
}
export default withLocale(Page)
