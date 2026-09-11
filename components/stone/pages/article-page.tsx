import Image from 'next/image'
import Link from 'next/link'
import { SITE_URL } from '@/lib/site-config'
import { getKnownPaths } from '@/lib/stone/routes'
import { stoneHref } from '@/lib/stone/config'
import { categories } from '@/lib/stone/content'
import { getCollections } from '@/lib/stone/cms'
import type { Article } from '@/lib/stone/cms-types'
import { PavingCalc } from '@/components/stone/interactive/stone-tools'
import { AuthorCard } from '@/components/stone/site/content-components'
import { Breadcrumbs, Faq, JsonLd } from '@/components/stone/pages/primitives'

export async function ArticlePage({ article: a }: { article: Article }) {
  const [collections, known] = await Promise.all([getCollections(), getKnownPaths()])
  const cover = a.image || `/blog/${a.slug}.webp`
  const detail = a.detailImage || `/blog/${a.slug}-detail.webp`
  return (
    <main>
      <Breadcrumbs items={[{ name: 'Журнал', href: '/arkhitekturnyi-kamin/blog' }, { name: a.title }]} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: a.title,
          description: a.description,
          datePublished: a.datePublished,
          dateModified: a.dateModified,
          inLanguage: 'uk-UA',
          author: { '@type': 'Organization', name: 'Майстерня Stone Memory' },
          publisher: { '@type': 'Organization', name: 'Stone Memory' },
          mainEntityOfPage: `${SITE_URL}/blog/${a.slug}`,
          image: [
            {
              '@type': 'ImageObject',
              url: cover.startsWith('http') ? cover : SITE_URL + cover,
              width: 1200,
              height: 675,
            },
            {
              '@type': 'ImageObject',
              url: detail.startsWith('http') ? detail : SITE_URL + detail,
              width: 1000,
              height: 750,
            },
          ],
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: a.faq.map((x) => ({
            '@type': 'Question',
            name: x.question,
            acceptedAnswer: { '@type': 'Answer', text: x.answer },
          })),
        }}
      />
      <article className="page-shell max-w-4xl py-20">
        <p className="eyebrow text-accent">
          {a.category} · Оновлено: {a.dateModified} · {a.readingTime}
        </p>
        <h1 className="mt-5 text-balance text-3xl font-semibold tracking-[-.055em] sm:text-5xl md:text-7xl">
          {a.h1}
        </h1>
        <p className="mt-8 text-xl leading-8">{a.intro}</p>
        <div className="relative mt-10 aspect-video overflow-hidden rounded-xl">
          <Image
            src={cover}
            alt={`${a.h1}: приклад каменю та його застосування`}
            fill
            priority
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
          />
        </div>
        {a.sections.map((s) => (
          <section className="mt-12" key={s.heading}>
            <h2 className="text-3xl font-semibold">{s.heading}</h2>
            {s.body
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((para, i) => (
                <p className="mt-4 leading-7 text-muted-foreground" key={i}>
                  {para}
                </p>
              ))}
          </section>
        ))}
        <div className="relative mt-12 aspect-[4/3] overflow-hidden rounded-xl">
          <Image
            src={detail}
            alt={`Деталь поверхні для статті «${a.title}»`}
            fill
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
          />
        </div>
        {a.slug === 'ukladannya-granitnoyi-brukivky' && (
          <section className="mt-12">
            <h2 className="mb-6 text-3xl font-semibold">Розрахуйте площу замовлення</h2>
            <PavingCalc />
          </section>
        )}
        <div className="mt-12 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr>
                {a.table.headers.map((h) => (
                  <th className="border-b p-3" key={h}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {a.table.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((v, j) => (
                    <td className="border-b p-3 text-muted-foreground" key={j}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <section className="mt-12">
          <h2 className="text-3xl font-semibold">Поширені питання</h2>
          <Faq items={a.faq} includeSchema={false} />
        </section>
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Читайте також</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {a.related
              .map(stoneHref)
              .filter((href) => known.has(href))
              .map((href) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-full border px-4 py-2 text-sm font-semibold"
                >
                  {href === '/arkhitekturnyi-kamin/kalkulyator'
                    ? 'Розрахувати вартість'
                    : href.split('/').filter(Boolean).at(-1)?.replaceAll('-', ' ')}
                </Link>
              ))}
          </div>
        </section>
        <AuthorCard />
        <section className="mt-12 rounded-xl bg-card p-6">
          <h2 className="text-2xl font-semibold">Пов’язані матеріали</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {a.materials.map((s) => (
              <Link
                className="rounded-full border px-4 py-2 text-sm"
                href={`/arkhitekturnyi-kamin/materialy/${s}`}
                key={s}
              >
                {collections.find((c) => c.slug === s)?.name || s}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {a.categories.map((s) => (
              <Link className="text-sm underline" href={`/arkhitekturnyi-kamin/vyroby/${s}`} key={s}>
                {categories.find((c) => c.slug === s)?.name || s}
              </Link>
            ))}
          </div>
        </section>
      </article>
    </main>
  )
}
