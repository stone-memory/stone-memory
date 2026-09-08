import { pageMetadata } from '@/lib/stone/seo'
import { getSetting } from '@/lib/stone/cms'
import { CardGrid, Faq, PageHero } from '@/components/stone/pages/primitives'

export const metadata = pageMetadata('/kamin/b2b', {
  title: 'Для професіоналів',
  image: '/detail-stone-edge.webp',
})
export default async function Page() {
  const pro = await getSetting('professional')
  return (
    <PageHero
      eyebrow="Професійний відділ"
      title="Камінь без розриву між задумом і монтажем."
      copy="Матеріали, специфікації, резерв слябів і виробнича підтримка для команд."
    >
      <CardGrid
        items={pro.segments.map((x) => ({
          name: x.name,
          copy: x.copy,
          href: `/kamin/b2b/${x.slug}`,
          image: '/production-gallery.webp',
          alt: `Професійна робота Stone Memory — ${x.name}`,
        }))}
      />
      <div className="mt-8">
        <CardGrid
          items={Object.entries(pro.specials).map(([slug, x]) => ({
            name: x.title,
            copy: x.copy,
            href: `/kamin/b2b/${slug}`,
          }))}
        />
      </div>
      <Faq items={pro.b2bFaq.map((x) => ({ question: x.q, answer: x.a }))} />
    </PageHero>
  )
}
