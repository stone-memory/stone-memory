import Link from 'next/link'
import { getCollections } from '@/lib/stone/cms'
import { families, type FamilySlug } from '@/data/stone/families'
import { Breadcrumbs, CardGrid } from '@/components/stone/pages/primitives'
import { getStoneT } from '@/lib/i18n/stone/server'
import { collectionName, collectionSummary } from '@/lib/i18n/stone'

export async function FamilyHub({ family }: { family: FamilySlug }) {
  const name = families[family]
  const [all, { t, locale }] = await Promise.all([getCollections(), getStoneT()])
  const items = all.filter((item) => item.family === name)
  return (
    <main id="main-content">
      <Breadcrumbs items={[{ name: 'Матеріали', href: '/arkhitekturnyi-kamin/materialy' }, { name }]} />
      <section className="page-shell py-20">
        <p className="eyebrow text-accent">{t('Родина матеріалів')}</p>
        <h1 className="mt-5 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-6xl md:text-8xl">
          {t(name)}
        </h1>
        <p className="mt-7 max-w-xl leading-7 text-muted-foreground">
          {t('Порівняйте доступні колекції, фініші та застосування. Для природного каменю фінально погоджуємо конкретний сляб і розкладку деталей.')}
        </p>
        {items.length === 0 && (
          <p className="mt-10 max-w-xl rounded-xl border p-6 text-sm leading-6 text-muted-foreground">
            {t('Колекції цієї родини вже заведені й готуються до публікації: чекаємо на фото каменю. Напишіть нам, і ми підберемо сляб чи блок під ваш проєкт уже зараз.')}
          </p>
        )}
        <div className="mt-12">
          <CardGrid
            items={items.map((item) => ({
              name: collectionName(locale, item.name),
              copy: collectionSummary(locale, item),
              href: `/arkhitekturnyi-kamin/materialy/${item.slug}`,
              image: item.cardImage,
              alt: `${t('Фактура')} ${collectionName(locale, item.name)}`,
            }))}
          />
        </div>
        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            className="rounded-full border px-5 py-3 text-sm font-semibold"
            href="/arkhitekturnyi-kamin/porivnyannya/materialiv"
          >
            {t('Порівняти матеріали')}
          </Link>
          <Link
            className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            href="/arkhitekturnyi-kamin/pidbir-kamenyu"
          >
            {t('Пройти підбір')}
          </Link>
        </div>
      </section>
    </main>
  )
}
