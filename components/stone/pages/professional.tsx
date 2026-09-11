import Image from 'next/image'
import { Layers3 } from 'lucide-react'
import { getProjects, getSetting } from '@/lib/stone/cms'
import type { Professional } from '@/lib/stone/cms-types'
import { InquiryForm } from '@/components/stone/interactive/tools'
import { Breadcrumbs, Faq, PageHero } from '@/components/stone/pages/primitives'

/** Розвʼязує слаг /b2b/<slug> у сегмент аудиторії або тематичну сторінку. */
export function resolveProfessional(pro: Professional, slug: string) {
  const segment = pro.segments.find((x) => x.slug === slug)
  if (segment) {
    return {
      title: segment.name,
      seoTitle: undefined as string | undefined,
      copy: segment.copy,
      items: segment.deliverables,
      image: segment.image,
      alt: segment.alt,
    }
  }
  const special = pro.specials[slug]
  if (!special) return null
  return { ...special, image: undefined, alt: undefined }
}

export async function ProfessionalPage({ slug }: { slug: string }) {
  const [pro, projects] = await Promise.all([getSetting('professional'), getProjects()])
  const data = resolveProfessional(pro, slug)!
  return (
    <main>
      <Breadcrumbs items={[{ name: 'Для професіоналів', href: '/arkhitekturnyi-kamin/b2b' }, { name: data.title }]} />
      <section className="page-shell grid gap-10 py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="eyebrow text-accent">B2B · Stone Memory</p>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-6xl md:text-8xl">
            {data.title}
          </h1>
          <p className="mt-7 max-w-xl leading-7 text-muted-foreground">{data.copy}</p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
          <Image
            src={data.image ?? '/production-gallery.webp'}
            alt={data.alt ?? `${data.title} — робота з каменем у виробництві Stone Memory`}
            fill
            priority
            sizes="(max-width:1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </section>
      <section className="page-shell grid gap-px overflow-hidden rounded-xl bg-border md:grid-cols-2">
        {data.items.map((x, i) => (
          <div key={x} className="bg-card p-7">
            <span className="eyebrow text-accent">{String(i + 1).padStart(2, '0')}</span>
            <p className="mt-5 text-xl font-semibold">{x}</p>
          </div>
        ))}
      </section>
      <section className="page-shell py-20">
        <div className="grid gap-8 lg:grid-cols-[.7fr_1fr]">
          <div>
            <p className="eyebrow text-accent">Почати співпрацю</p>
            <h2 className="mt-5 text-4xl font-semibold">Надішліть бриф або креслення.</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Відповімо з переліком потрібних даних і наступним кроком.
            </p>
          </div>
          <InquiryForm trade proposals={projects} />
        </div>
        <Faq items={pro.b2bFaq.map((x) => ({ question: x.q, answer: x.a }))} />
      </section>
    </main>
  )
}

export async function TradeProgram() {
  const [faq, projects] = await Promise.all([getSetting('faq'), getProjects()])
  return (
    <PageHero
      eyebrow="Trade program"
      title="Партнерство, що працює на проєкт."
      copy="Для архітекторів, дизайнерів, студій, забудовників і фабрикаторів."
    >
      <div className="grid gap-8 lg:grid-cols-[.65fr_1fr]">
        <div className="grid gap-3">
          {['Індивідуальні trade-умови', 'Доступ до CAD/BIM', 'Підбір і резервування слябів'].map(
            (x) => (
              <div className="flex items-center gap-3 rounded-lg border p-5 text-sm" key={x}>
                <Layers3 />
                {x}
              </div>
            )
          )}
        </div>
        <InquiryForm trade proposals={projects} />
      </div>
      <Faq items={faq.b2b} />
    </PageHero>
  )
}
