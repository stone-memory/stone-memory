import Link from 'next/link'
import { getCollections } from '@/lib/stone/cms'
import { families, type FamilySlug } from '@/data/stone/families'
import { Breadcrumbs, CardGrid } from '@/components/stone/pages/primitives'

export async function FamilyHub({ family }: { family: FamilySlug }) {
  const name = families[family]
  const items = (await getCollections()).filter((item) => item.family === name)
  return (
    <main>
      <Breadcrumbs items={[{ name: 'Матеріали', href: '/kamin/materialy' }, { name }]} />
      <section className="page-shell py-20">
        <p className="eyebrow text-accent">Родина матеріалів</p>
        <h1 className="mt-5 text-balance text-6xl font-semibold tracking-[-.055em] md:text-8xl">
          {name}
        </h1>
        <p className="mt-7 max-w-xl leading-7 text-muted-foreground">
          Порівняйте доступні колекції, фініші та застосування. Для природного каменю фінально
          погоджуємо конкретний сляб і розкладку деталей.
        </p>
        <div className="mt-12">
          <CardGrid
            items={items.map((item) => ({
              name: item.name,
              copy: item.description,
              href: `/kamin/materialy/${item.slug}`,
              image: item.cardImage,
              alt: `Фактура ${item.name}`,
            }))}
          />
        </div>
        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            className="rounded-full border px-5 py-3 text-sm font-semibold"
            href="/kamin/porivnyannya/materialiv"
          >
            Порівняти матеріали
          </Link>
          <Link
            className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            href="/kamin/pidbir-kamenyu"
          >
            Пройти підбір
          </Link>
        </div>
      </section>
    </main>
  )
}
