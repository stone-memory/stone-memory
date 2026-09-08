import Image from 'next/image'
import Link from 'next/link'
import { SITE_URL } from '@/lib/site-config'
import type { Project } from '@/lib/stone/cms-types'
import { Cta } from '@/components/stone/site/sections'
import { Breadcrumbs, JsonLd } from '@/components/stone/pages/primitives'

export function ProjectDetail({ project: x }: { project: Project }) {
  return (
    <main>
      <Breadcrumbs items={[{ name: 'Проєктні пропозиції', href: '/kamin/proekty' }, { name: x.name }]} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          name: x.name,
          description: x.story,
          image: x.gallery.map((i) => (i.startsWith('http') ? i : SITE_URL + i)),
          about: { '@type': 'Product', name: x.material },
        }}
      />
      <section className="page-shell py-10">
        <div className="relative min-h-[68vh] overflow-hidden rounded-xl">
          <Image src={x.image} alt={x.alt} fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
          <div className="absolute bottom-0 p-8 text-primary-foreground md:p-12">
            <p className="eyebrow opacity-70">
              Проєктна пропозиція · {x.type} · {x.location}
            </p>
            <h1 className="mt-4 text-6xl font-semibold tracking-[-.055em] md:text-8xl">{x.name}</h1>
          </div>
        </div>
      </section>
      <section className="page-shell grid gap-12 py-20 lg:grid-cols-[.55fr_1fr]">
        <div>
          <p className="eyebrow text-accent">Концепція</p>
          <p className="mt-6 text-sm leading-6 text-muted-foreground">
            Візуалізація показує можливий характер рішення. Фактична розкладка залежить від обраного
            сляба, заміру й технічного завдання.
          </p>
        </div>
        <div>
          <p className="text-2xl leading-relaxed">{x.story}</p>
          <div className="mt-8 grid gap-px overflow-hidden rounded-xl bg-border sm:grid-cols-3">
            {[
              ['Матеріал', x.material],
              ['Рішення', x.solution],
              ['Процес', 'Підбір · замір · розкладка · монтаж'],
            ].map(([a, b]) => (
              <div key={a} className="bg-card p-5">
                <p className="text-xs text-muted-foreground">{a}</p>
                <p className="mt-3 text-sm leading-6">{b}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/kamin/materialy/${x.materialSlug}`}
              className="rounded-full border px-5 py-3 text-sm font-semibold"
            >
              Дивитися матеріал
            </Link>
            <Link
              href={`/kamin/kontakty?proposal=${x.slug}`}
              className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Обговорити цю пропозицію
            </Link>
          </div>
        </div>
      </section>
      <section className="page-shell grid gap-5 pb-20 md:grid-cols-3">
        {x.gallery.slice(1).map((img, i) => (
          <div key={img + i} className="relative aspect-[4/3] overflow-hidden rounded-xl">
            <Image
              src={img}
              alt={`${x.name}: матеріал і технічна деталь ${i + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          </div>
        ))}
      </section>
      <Cta />
    </main>
  )
}
