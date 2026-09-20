import { withLocale } from '@/lib/i18n/with-locale'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { SectionHeading } from '@/components/stone/site/shell'
import { Cta, WorkSteps } from '@/components/stone/site/sections'
import { categories, materials } from '@/lib/stone/content'
import { familyHrefForMaterial, families } from '@/data/stone/families'
import { getCollections } from '@/lib/stone/cms'
import { getLocalizedProjects } from '@/lib/stone/i18n-content'
import { pageMetadata } from '@/lib/stone/seo'
import { getStoneT } from '@/lib/i18n/stone/server'
import { collectionName } from '@/lib/i18n/stone'

// Без власних метаданих сторінка успадковує canonical кореневого layout, тобто
// головну сайту, і Bing/Google вважають її дублем головної та не індексують.
export const metadata = pageMetadata('/arkhitekturnyi-kamin', {
  title: 'Архітектурний камінь: стільниці, підвіконня, сходи',
  description:
    'Кам’яні стільниці, підвіконня, сходи, фасади й бруківка з граніту, мармуру та кварцу. Власне виробництво в Костополі, замір, доставка й монтаж по Україні.',
  image: '/stone-hero.webp',
})
// Родини з українськими родовищами, у порядку показу. Сайт насамперед показує
// те, що є на українському ринку, і лише потім імпорт під замовлення.
const UKRAINIAN_FAMILIES: { slug: keyof typeof families; note: string }[] = [
  { slug: 'granit', note: 'сірі, червоні, зелені, коричневі родовища Житомирщини, Кіровоградщини, Дніпропетровщини' },
  { slug: 'gabro', note: 'чорний камінь Житомирщини: Головинське, Букинське, Лугове' },
  { slug: 'labradoryt', note: 'чорний із синіми переливами: Volga Blue, Irina Blue, Extra Blue' },
  { slug: 'bazalt', note: 'Берестовецьке, Костопільське, Хустівське: бруківка, сходи, цоколі' },
  { slug: 'piskovyk', note: 'Теребовлянський: фасади, огорожі, доріжки' },
  { slug: 'kvarcyt', note: 'Овруцький: найтвердіший український камінь для бруківки й цоколів' },
]

async function Home() {
  const [projects, collections, { t, locale }] = await Promise.all([getLocalizedProjects(), getCollections(), getStoneT()])
  const isUkrainian = (origin: string) => /Украї/.test(origin)
  const ukrainian = collections.filter((c) => isUkrainian(c.origin))
  const imported = collections.filter(
    (c) => !isUkrainian(c.origin) && !['Кварц', 'Керамограніт'].includes(c.family)
  )
  const ukrainianFamilies = UKRAINIAN_FAMILIES.map((f) => ({
    ...f,
    name: families[f.slug],
    count: ukrainian.filter((c) => c.family === families[f.slug]).length,
  })).filter((f) => f.count > 0)
  return (
    <main id="main-content">
      <section className="page-shell flex min-h-[58vh] flex-col items-center justify-center py-10 text-center md:min-h-[72vh] md:py-20">
        <p className="eyebrow">{t('Камінь. У своїй найточнішій формі.')}</p>
        <h1 className="display mt-7 max-w-full text-balance md:!text-7xl">
          {t('Кам’яні стільниці, підвіконня та сходи на замовлення')}
        </h1>
        <p className="mt-7 max-w-3xl text-pretty text-lg leading-8 text-muted-foreground">
          {t('Проєктуємо, ріжемо під розмір і монтуємо натуральний камінь для кухонь, ванних, сходів і дворів — доставка і монтаж по всій Україні.')}
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href="/arkhitekturnyi-kamin/kontakty#forma"
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            {t('Замовити безкоштовний замір')}
          </Link>
          <Link
            href="/arkhitekturnyi-kamin/kalkulyator"
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-6 py-3 text-sm font-semibold"
          >
            {t('Порахувати вартість')} <ChevronRight />
          </Link>
        </div>
        <p className="mt-5 max-w-3xl text-pretty text-sm text-muted-foreground">
          {t('Власне виробництво в Костополі')} • {ukrainian.length} {t('українських родовищ')} + {imported.length}{' '}
          {t('імпортних порід під замовлення')} • {t('монтаж під ключ')}
        </p>
      </section>
      <section className="page-shell">
        <div className="media aspect-[16/9] md:aspect-[2/1]">
          <Image
            src="/stone-hero.webp"
            alt={t('Кухонний острів із природного кварциту')}
            fill
            sizes="(max-width: 1280px) 100vw, 1200px"
            priority
            className="object-cover"
          />
        </div>
      </section>
      <section className="page-shell section-pad">
        <SectionHeading
          eyebrow="Простий вибір"
          title="Почніть із того, що створюємо."
          copy="Кожен виріб проходить один шлях: точний замір, підбір плити, виробництво й професійний монтаж."
        />
        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, i) => (
            <Link
              href={`/arkhitekturnyi-kamin/vyroby/${c.slug}`}
              key={c.slug}
              className="surface group flex min-h-48 flex-col justify-between p-6 transition-transform hover:-translate-y-1"
            >
              <span className="text-xs text-muted-foreground">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-xl font-semibold tracking-[-.035em]">{t(c.name)}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(c.blurb)}</p>
                <ArrowRight className="mt-5 text-accent" />
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="page-shell section-pad">
        <SectionHeading
          eyebrow="Український камінь"
          title="Спершу те, що є в Україні."
          copy={`${ukrainian.length} ${t("родовищ із власних кар'єрів країни: ріжемо з блоку в Костополі, без очікування імпортного сляба. Імпортний мармур, кварцит і онікс — під замовлення через українські склади.")}`}
        />
        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ukrainianFamilies.map((f) => (
            <Link
              href={`/arkhitekturnyi-kamin/materialy/${f.slug}`}
              key={f.slug}
              className="surface group flex min-h-44 flex-col justify-between p-6 transition-transform hover:-translate-y-1"
            >
              <span className="text-xs text-muted-foreground">
                {f.count} {t(f.count === 1 ? 'родовище' : f.count < 5 ? 'родовища' : 'родовищ')}
              </span>
              <div>
                <h3 className="text-xl font-semibold tracking-[-.035em]">{t(f.name)}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(f.note)}</p>
                <ArrowRight className="mt-5 text-accent" />
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="bg-secondary">
        <div className="page-shell section-pad">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="media aspect-[4/5]">
              <Image
                src="/stone-slabs.webp"
                alt={t('Сляби природного каменю у консультаційній зоні')}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="md:pl-10">
              <p className="eyebrow">{t('Матеріали')}</p>
              <h2 className="title mt-5 text-balance">{t('Рисунок, який не повторюється.')}</h2>
              <p className="mt-6 max-w-md leading-7 text-muted-foreground">
                {t('Підбирайте матеріал за властивістю, тоном і характером простору.')}
              </p>
              <div className="mt-10 flex flex-col">
                {materials.map((m) => (
                  <Link
                    key={m.slug}
                    href={familyHrefForMaterial(m.slug)}
                    className="flex flex-col gap-1 border-t py-4 font-semibold sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span>{t(m.name)}</span>
                    <span className="text-sm font-normal text-muted-foreground">{t(m.note)}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="page-shell section-pad">
        <SectionHeading eyebrow="Як ми працюємо" title="Менше невідомого. Більше точності." />
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {[
            ['01', 'Підбираємо', 'З’ясовуємо завдання, бюджет і умови експлуатації.'],
            ['02', 'Проєктуємо', 'Робимо замір, креслення та узгоджуємо кожну деталь.'],
            ['03', 'Виготовляємо', 'Обробляємо камінь і монтуємо готовий виріб.'],
          ].map((x) => (
            <div key={x[0]} className="border-t pt-6">
              <p className="text-xs font-bold text-accent">{x[0]}</p>
              <h3 className="mt-8 text-2xl font-semibold tracking-[-.04em]">{t(x[1])}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{t(x[2])}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="page-shell section-pad pt-0">
        <SectionHeading
          eyebrow="Пропозиції"
          title="Що ми можемо реалізувати для вашого простору."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {projects.slice(0, 9).map((p) => (
            <Link href={`/arkhitekturnyi-kamin/proekty/${p.slug}`} key={p.slug} className="group">
              <div className="media aspect-[4/5]">
                <Image src={p.image} alt={p.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              </div>
              <div className="flex items-start justify-between gap-4 py-5">
                <div>
                  <h3 className="text-lg font-semibold">{t(p.name)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(p.type)} · {collectionName(locale, p.material)}
                  </p>
                </div>
                <ArrowRight className="text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-right">
          <Link href="/arkhitekturnyi-kamin/proekty" className="text-sm text-muted-foreground hover:text-foreground">
            {t('Усі пропозиції →')}
          </Link>
        </div>
      </section>
      <WorkSteps />
      <Cta />
    </main>
  )
}
export default withLocale(Home)
