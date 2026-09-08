import { pageMetadata } from '@/lib/stone/seo'
import { SITE_URL } from '@/lib/site-config'
import { getProjects } from '@/lib/stone/cms'
import { ProposalCatalog } from '@/components/stone/interactive/tools'
import { JsonLd, PageHero } from '@/components/stone/pages/primitives'

export const metadata = pageMetadata('/arkhitekturnyi-kamin/proekty', {
  title: 'Проєкти',
  image: '/proposal-kitchen.webp',
})
export default async function Page() {
  const projects = await getProjects()
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Проєктні пропозиції Stone Memory',
          itemListElement: projects.map((x, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${SITE_URL}/proekty/${x.slug}`,
            name: x.name,
            image: SITE_URL + x.image,
          })),
        }}
      />
      <PageHero
        eyebrow="Проєктні пропозиції"
        title="Як камінь може працювати у просторі."
        copy="Концепції для обговорення матеріалу, вузлів і характеру майбутнього виробу. Це проєктні пропозиції, а не фотографії завершених обʼєктів."
      >
        <ProposalCatalog projects={projects} />
      </PageHero>
    </>
  )
}
