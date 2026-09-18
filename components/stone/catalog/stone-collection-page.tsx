import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { SITE_URL } from '@/lib/site-config'
import { versioned } from '@/lib/stone/asset-url'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import type { Collection } from '@/lib/stone/cms-types'
import { getCollections } from '@/lib/stone/cms'
import { specs as seedSpecs } from '@/data/stone/seed/specs'
import { getStoneT } from '@/lib/i18n/stone/server'
import { collectionName, collectionSummary, stonePrice } from '@/lib/i18n/stone'
import { GalleryLightbox } from '@/components/stone/catalog/gallery-lightbox'

// Застосування з даних колекцій → категорія виробів (data/materials.ts → categories).
// Категорій «ванна», «підлога», «меблі» в каталозі немає: ведемо на найближчий виріб.
const categorySlug: Record<string, string> = {
  стільниці: 'stilnytsi',
  сходи: 'skhody',
  фасади: 'fasady',
  бруківка: 'brukivka',
  каміни: 'kaminy',
  ванна: 'stilnytsi',
  підлога: 'slyaby',
  підвіконня: 'pidvikonnya',
  меблі: 'stilnytsi',
  острови: 'stilnytsi',
  облицювання: 'fasady',
}
const familyFaq: Record<string, [string, string][]> = {
  Граніт: [
    [
      'Чи підходить граніт для кухні?',
      'Так, після точного проєктування вирізів і перевірки фінішу.',
    ],
    [
      'Чи потрібне просочення?',
      'Потребу визначаємо за водопоглинанням конкретної партії та сценарієм використання.',
    ],
    ['Як очищувати поверхню?', 'Використовуйте м’яку тканину й засіб із нейтральним pH.'],
  ],
  Габро: [
    [
      'Чим габро відрізняється від чорного граніту?',
      'Габро щільніше й дрібнозернистіше: після полірування дає рівний чорний без сірих плям і краще тримає гравіювання.',
    ],
    ['Чи темніє від вологи?', 'Водопоглинання близько 0,1 %, тому камінь не плямиться після дощу чи миття.'],
    ['Де застосовують?', 'Стільниці, каміни, сходи, фасади й цоколі; на пам’ятниках — це основний чорний камінь.'],
  ],
  Базальт: [
    [
      'Чому базальт матовий?',
      'Дрібнокристалічна структура майже не полірується до дзеркала, тому його беруть у шліфованому чи термообробленому фініші.',
    ],
    ['Чи підходить для вулиці?', 'Так, це один із найстійкіших до морозу й стирання українських каменів: бруківка, сходи, цоколі.'],
    ['Чи можна на стільницю?', 'Можна, але текстура нерівномірна; частіше базальт іде на зовнішні роботи.'],
  ],
  Пісковик: [
    [
      'Чи міцний пісковик?',
      'Менш щільний за граніт, але Теребовлянський добре тримає фасади й доріжки десятиліттями; для стільниць не радимо.',
    ],
    ['Чи потрібне просочення?', 'Так, гідрофобізатор обов’язковий: порода пориста й без захисту темніє від вологи.'],
    ['Який фініш?', 'Природний скол, пиляна або шліфована поверхня; полірування пісковику не роблять.'],
  ],
  Лабрадорит: [
    [
      'Як проявляється синій відблиск?',
      'Іризація змінюється разом із напрямом денного та штучного світла.',
    ],
    [
      'Чи кожен сляб однаковий?',
      'Ні, розташування кристалів і сила відблиску природно відрізняються.',
    ],
    ['Який фініш обрати?', 'Полірування найвиразніше показує глибину й кольорові спалахи.'],
  ],
  Мармур: [
    [
      'Чи можна використовувати мармур у ванній?',
      'Так, за умови правильної гідроізоляції, монтажу та регулярного догляду.',
    ],
    [
      'Чого уникати під час очищення?',
      'Кислотних і абразивних засобів, які можуть змінити поверхню.',
    ],
    ['Чи повторюється рисунок?', 'Ні, кожна плита має власний напрям і густоту прожилок.'],
  ],
  Кварцит: [
    [
      'Чим кварцит відрізняється від мармуру?',
      'Він зазвичай твердіший, але властивості підтверджуємо для конкретної партії.',
    ],
    ['Чи погоджується розкладка?', 'Так, напрям прожилок фіксуємо перед розкроєм.'],
    ['Як доглядати?', 'Щодня достатньо м’якої тканини й нейтрального засобу.'],
  ],
  Кварц: [
    ['Чи потрібно просочувати кварц?', 'Дотримуйтеся технічної карти конкретного бренду.'],
    ['Чи можна ставити гаряче?', 'Рекомендуємо завжди використовувати термопідставку.'],
    ['Як обрати декор?', 'Оцініть великий зразок поруч із фасадами та освітленням інтер’єру.'],
  ],
  Керамограніт: [
    [
      'Чи підходить тонка плита для фасаду?',
      'Таке рішення потребує проєктного вузла й системи кріплення.',
    ],
    ['Як обробляють краї?', 'Профіль залежить від товщини плити та конструкції виробу.'],
    ['Як очищувати?', 'Виконуйте рекомендації виробника для обраної серії та фінішу.'],
  ],
}
function schemaOffer(c: Collection) {
  const p = c.price
  return p?.value
    ? {
        offers: {
          '@type': 'AggregateOffer',
          lowPrice: String(p.value),
          priceCurrency: p.currency === '€' ? 'EUR' : 'UAH',
          offerCount: '1',
        },
      }
    : {}
}
export async function StoneCollectionPage({ collection: c }: { collection: Collection }) {
  const [collections, { t, locale }] = await Promise.all([getCollections(), getStoneT()])
  const description = collectionSummary(locale, c)
  const name = collectionName(locale, c.name)
  const price = stonePrice(locale, c.price)
  // Показуємо лише ті знімки, які реально є: для частини каменів сцени сляба
  // й застосування ще не згенеровані, і три однакові текстури виглядали гірше,
  // ніж одна. Файли перевіряються на сервері, у public/.
  // Версія ?v= додається вже після перевірки, бо existsSync шукає файл за
  // чистим шляхом.
  const gallery = [
      `/collections/${c.slug}-macro.webp`,
      `/collections/${c.slug}-slab.webp`,
      `/collections/${c.slug}-application.webp`,
    ]
      .filter((src, i) => i === 0 || existsSync(join(process.cwd(), 'public', src)))
      .map(versioned),
    // Характеристики з картки матеріалу в адмінці (c.specs); якщо в базі їх ще
    // немає — з довідкового сіду. Порожній рядок не показуємо, а не пишемо
    // «за запитом»: 73 зі 110 сторінок мали п'ять таких рядків поспіль.
    sp = c.specs ?? seedSpecs[c.slug] ?? {},
    specs = (
      [
        [t('Порода'), t(c.family)],
        [t('Країна/родовище'), t(c.origin)],
        [t('Щільність (кг/м³)'), sp.density],
        [t('Водопоглинання (%)'), sp.absorption],
        [t('Міцність на стиск (МПа)'), sp.compressive],
        [t('Морозостійкість (циклів)'), sp.frost],
        [t('Клас радіації'), sp.radiation && t(sp.radiation)],
        [t('Фініші'), c.finishes.map(t).join(', ')],
      ] as [string, string | undefined][]
    ).filter((row): row is [string, string] => Boolean(row[1] && row[1].trim())),
    related = collections
      .filter((x) => x.slug !== c.slug && (x.family === c.family || x.tone === c.tone))
      .slice(0, 3),
    faqs = familyFaq[c.family] ?? familyFaq.Граніт
  return (
    <main id="main-content">
      <nav
        className="page-shell pt-8 text-xs text-muted-foreground"
        aria-label={t('Навігаційний ланцюжок')}
      >
        <Link href="/">{t('Головна')}</Link>
        <span className="px-2">/</span>
        <Link href="/arkhitekturnyi-kamin/materialy">{t('Матеріали')}</Link>
        <span className="px-2">/</span>
        <span>{name}</span>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: c.name,
            image: gallery.map((x) => SITE_URL + x),
            description: c.description,
            brand: { '@type': 'Brand', name: c.brand || 'Stone Memory' },
            ...schemaOffer(c),
          }),
        }}
      />
      <section className="page-shell py-12">
        <div className="grid gap-5 lg:grid-cols-2">
          <GalleryLightbox
            items={gallery.map((src) => ({
              src,
              alt: src.includes('-macro.webp')
                ? `${t('Макрофактура')} ${name}`
                : src.includes('-slab.webp')
                  ? `${t('Повний сляб')} ${name} ${t('на складі')}`
                  : `${t('Застосування')} ${name} ${t('в інтер’єрі')}`,
            }))}
          />
          <div className="rounded-xl bg-card p-8 md:p-12">
            <p className="eyebrow text-accent">
              {t(c.family)} · {t(c.tone)}
            </p>
            <h1 className="mt-5 text-balance text-3xl font-semibold tracking-[-.05em] sm:text-5xl md:text-7xl">
              {name}
            </h1>
            <p className="mt-6 leading-7 text-muted-foreground">{description}</p>
            <p className="mt-6 inline-flex rounded-full border px-4 py-2 text-sm font-semibold">
              {price}
            </p>
            {c.exteriorOnly && (
              <p className="mt-4 rounded-lg border border-destructive/30 p-4 text-sm">
                {t('II клас — лише зовнішнє застосування.')}
              </p>
            )}
            <Link
              className="mt-8 inline-flex rounded-md bg-primary px-5 py-3 text-sm text-primary-foreground"
              href="/arkhitekturnyi-kamin/kontakty"
            >
              {t('Замовити зразок')}
            </Link>
          </div>
        </div>
        <section className="mt-20 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold">{t('Технічні характеристики')}</h2>
            <div className="mt-6 overflow-hidden rounded-xl border">
              {specs.map(([a, b]) => (
                <div className="grid grid-cols-2 gap-4 border-b p-4 last:border-0" key={a}>
                  <span className="text-sm text-muted-foreground">{a}</span>
                  <span className="text-sm font-medium">{b}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-semibold">{t('Орієнтир вартості')}</h2>
            {/* Прайс не залежить від товщини, тому одна ціна замість таблиці 20/30 мм з однаковими числами. */}
            <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border p-4">
              <span>{t('Базова товщина 20 мм')}</span>
              <strong>{price}</strong>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {t('Товщина 30 мм, нестандартні профілі та вирізи рахуються окремо. Остаточну вартість визначаємо після заміру, креслення та погодження конкретної плити.')}
            </p>
            <h2 className="mt-10 text-2xl font-semibold">{t('Вироби з цього каменю')}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {c.applications.map((x) => (
                <Link
                  className="rounded-full border px-4 py-2 text-sm"
                  href={`/arkhitekturnyi-kamin/vyroby/${categorySlug[x] || 'stilnytsi'}`}
                  key={x}
                >
                  {t(x)}
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section className="mt-20">
          <h2 className="text-3xl font-semibold">{t('Схожі колекції')}</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {related.map((x) => (
              <Link
                href={`/arkhitekturnyi-kamin/materialy/${x.slug}`}
                className="overflow-hidden rounded-xl bg-card"
                key={x.slug}
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={versioned(`/collections/${x.slug}-macro.webp`)}
                    alt={`${t('Фактура')} ${collectionName(locale, x.name)}`}
                    fill
                    // Без sizes телефон брав 1200 px на картку 342 px завширшки.
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <h3 className="p-5 text-xl font-semibold">{collectionName(locale, x.name)}</h3>
              </Link>
            ))}
          </div>
        </section>
        <section className="mt-20 max-w-4xl">
          <h2 className="text-3xl font-semibold">{t('Питання про')} {locale === 'uk' ? c.family.toLowerCase() : t(c.family)}</h2>
          <div className="mt-6 rounded-xl border">
            {faqs.map(([q, a]) => (
              <details className="group border-b p-5 last:border-0" key={q}>
                <summary className="faq-summary flex cursor-pointer list-none items-start justify-between gap-4 font-semibold">
                  <span>{t(q)}</span>
                  <ChevronDown
                    className="mt-0.5 size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-3 leading-7 text-muted-foreground">{t(a)}</p>
              </details>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}
