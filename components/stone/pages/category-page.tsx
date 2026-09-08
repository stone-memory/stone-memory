import Image from 'next/image'
import { SITE_URL } from '@/lib/site-config'
import { categories } from '@/lib/stone/content'
import { getCollections, getSetting } from '@/lib/stone/cms'
import { MaterialCatalog } from '@/components/stone/interactive/tools'
import { SectionHeading } from '@/components/stone/site/shell'
import { Cta } from '@/components/stone/site/sections'
import { Breadcrumbs, Faq, JsonLd } from '@/components/stone/pages/primitives'

function CategoryApplications({ slug }: { slug: string }) {
  const imageSets: Record<string, string[]> = {
    stilnytsi: ['kitchen-everyday', 'kyiv-family-kitchen', 'rivne-family-kitchen'],
    pidvikonnya: ['windowsill-for-years', 'zhytomyr-family-windowsill', 'kostopil-window-sill'],
    skhody: ['stairs-in-house', 'lviv-two-storey-stairs', 'rivne-school-steps'],
    kaminy: ['living-room-fireplace', 'frankivsk-house-fireplace', 'ternopil-fireplace-room'],
    fasady: ['lviv-townhouse-facade', 'lviv-hall-wall', 'uzhhorod-shop-entry'],
    brukivka: ['turnkey-yard', 'ternopil-small-yard', 'chernivtsi-small-patio'],
    slyaby: ['lviv-hall-wall', 'lviv-flower-shop', 'kostopil-cafe-counter'],
    'dekoratyvnyi-kamin': ['dubno-family-yard', 'lutsk-house-porch', 'rivne-covered-terrace'],
  }
  const images = imageSets[slug] ?? imageSets.stilnytsi
  return (
    <section className="page-shell py-20">
      <SectionHeading
        eyebrow="Застосування"
        title="Три сценарії у реальному масштабі."
        copy="Візуалізації допомагають оцінити пропорції, тон і характер поверхні до вибору конкретної плити."
      />
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {images.map((name, index) => (
          <figure key={name} className="overflow-hidden rounded-xl bg-card">
            <div className="relative aspect-[4/3]">
              <Image
                src={`/proposals/${name}.webp`}
                alt={`Застосування ${slug}: варіант ${index + 1}`}
                fill
                sizes="(max-width:768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <figcaption className="p-4 text-xs leading-5 text-muted-foreground">
              Візуалізація можливого застосування. Не фотографія виконаного проєкту.
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

export async function CategoryPage({ slug }: { slug: string }) {
  const item = categories.find((x) => x.slug === slug)!
  const [collections, faq] = await Promise.all([getCollections(), getSetting('faq')])
  const categoryImages: Record<string, string> = {
    stilnytsi: '/proposal-kitchen.webp',
    pidvikonnya: '/proposal-window.webp',
    skhody: '/editorial-stairs.webp',
    kaminy: '/proposal-fireplace.webp',
    fasady: '/proposal-travertine-facade.webp',
    brukivka: '/proposal-terrace.webp',
    slyaby: '/stone-slabs.webp',
    'dekoratyvnyi-kamin': '/proposal-pool.webp',
  }
  return (
    <main>
      <Breadcrumbs items={[{ name: 'Вироби', href: '/kamin/vyroby' }, { name: item.name }]} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: item.name,
          description: item.blurb,
          provider: { '@type': 'Organization', name: 'Майстерня Stone Memory' },
          areaServed: ['Рівне', 'Київ', 'Костопіль', 'Луцьк'],
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: `Рішення: ${item.name}`,
            itemListElement: collections.slice(0, 8).map((c) => ({
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Product',
                name: c.name,
                url: `${SITE_URL}/materialy/${c.slug}`,
              },
            })),
          },
        }}
      />
      <section className="page-shell grid gap-10 py-20 lg:grid-cols-2 lg:items-end">
        <div>
          <p className="eyebrow text-accent">Вироби</p>
          <h1 className="mt-5 text-7xl font-semibold tracking-[-.055em] md:text-8xl">
            {item.name}
          </h1>
          <p className="mt-6 max-w-lg leading-7 text-muted-foreground">
            {item.blurb} Матеріал підбираємо за навантаженням, умовами експлуатації та бажаною
            фактурою.
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
          <Image
            src={categoryImages[slug] || '/stone-project.webp'}
            alt={`${item.name}: проєктна пропозиція з архітектурного каменю`}
            fill
            priority
            sizes="(max-width:1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </section>
      <CategoryApplications slug={slug} />
      <section className="page-shell py-20">
        <SectionHeading eyebrow="Підібрати" title="Матеріали для вашого виробу." />
        <div className="mt-10">
          <MaterialCatalog collections={collections} />
        </div>
        <Faq items={faq.category} />
      </section>
      <Cta />
    </main>
  )
}
