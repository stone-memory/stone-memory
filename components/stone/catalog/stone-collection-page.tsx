import { SITE_URL } from '@/lib/site-config'
import Image from 'next/image'
import Link from 'next/link'
import type { Collection } from '@/lib/stone/cms-types'
import { getCollections } from '@/lib/stone/cms'
import { formatPrice } from '@/lib/stone/prices'

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
  const collections = await getCollections()
  const gallery = [
      `/collections/${c.slug}-macro.webp`,
      `/collections/${c.slug}-slab.webp`,
      `/collections/${c.slug}-application.webp`,
    ],
    isUaGranite =
      (c.family === 'Граніт' || c.family === 'Лабрадорит') && c.origin.includes('Україна'),
    specs = [
      ['Порода', c.family],
      ['Країна/родовище', c.origin],
      ['Щільність (кг/м³)', isUaGranite ? '2500–2700' : 'за запитом'],
      ['Водопоглинання (%)', isUaGranite ? '0,05–0,17' : 'за запитом'],
      ['Міцність на стиск (МПа)', isUaGranite ? '180–210' : 'за запитом'],
      ['Морозостійкість (циклів)', isUaGranite ? 'близько 300' : 'за запитом'],
      [
        'Клас радіації',
        c.slug === 'carpazi'
          ? 'II клас — лише зовнішнє застосування'
          : isUaGranite
            ? 'I клас'
            : 'за запитом',
      ],
      ['Фініші', c.finishes.join(', ')],
    ],
    related = collections
      .filter((x) => x.slug !== c.slug && (x.family === c.family || x.tone === c.tone))
      .slice(0, 3),
    faqs = familyFaq[c.family] ?? familyFaq.Граніт
  return (
    <main>
      <nav
        className="page-shell pt-8 text-xs text-muted-foreground"
        aria-label="Навігаційний ланцюжок"
      >
        <Link href="/">Головна</Link>
        <span className="px-2">/</span>
        <Link href="/kamin/materialy">Матеріали</Link>
        <span className="px-2">/</span>
        <span>{c.name}</span>
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
          <div className="grid gap-3 sm:grid-cols-2">
            {gallery.map((src, i) => (
              <div
                key={src}
                className={`relative overflow-hidden rounded-xl ${i === 0 ? 'aspect-square sm:col-span-2' : 'aspect-[4/3]'}`}
              >
                <Image
                  src={src}
                  alt={
                    i === 0
                      ? `Макрофактура ${c.name}`
                      : i === 1
                        ? `Повний сляб ${c.name} на складі`
                        : `Застосування ${c.name} в інтер’єрі`
                  }
                  fill
                  priority={i === 0}
                  sizes="(max-width:1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-card p-8 md:p-12">
            <p className="eyebrow text-accent">
              {c.family} · {c.tone}
            </p>
            <h1 className="mt-5 text-balance text-5xl font-semibold tracking-[-.05em] md:text-7xl">
              {c.name}
            </h1>
            <p className="mt-6 leading-7 text-muted-foreground">{c.description}</p>
            <p className="mt-6 inline-flex rounded-full border px-4 py-2 text-sm font-semibold">
              {formatPrice(c.price)}
            </p>
            {c.exteriorOnly && (
              <p className="mt-4 rounded-lg border border-destructive/30 p-4 text-sm">
                II клас — лише зовнішнє застосування.
              </p>
            )}
            <Link
              className="mt-8 inline-flex rounded-md bg-primary px-5 py-3 text-sm text-primary-foreground"
              href="/kamin/kontakty"
            >
              Замовити зразок
            </Link>
          </div>
        </div>
        <section className="mt-20 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold">Технічні характеристики</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Довідкові діапазони для українських гранітів потребують підтвердження для конкретної
              партії.
            </p>
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
            <h2 className="text-3xl font-semibold">Орієнтир вартості</h2>
            {/* Прайс не залежить від товщини, тому одна ціна замість таблиці 20/30 мм з однаковими числами. */}
            <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border p-4">
              <span>Базова товщина 20 мм</span>
              <strong>{formatPrice(c.price)}</strong>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Товщина 30 мм, нестандартні профілі та вирізи рахуються окремо. Остаточну вартість
              визначаємо після заміру, креслення та погодження конкретної плити.
            </p>
            <h2 className="mt-10 text-2xl font-semibold">Вироби з цього каменю</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {c.applications.map((x) => (
                <Link
                  className="rounded-full border px-4 py-2 text-sm"
                  href={`/kamin/vyroby/${categorySlug[x] || 'stilnytsi'}`}
                  key={x}
                >
                  {x}
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section className="mt-20">
          <h2 className="text-3xl font-semibold">Схожі колекції</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {related.map((x) => (
              <Link
                href={`/kamin/materialy/${x.slug}`}
                className="overflow-hidden rounded-xl bg-card"
                key={x.slug}
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={`/collections/${x.slug}-macro.webp`}
                    alt={`Фактура ${x.name}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="p-5 text-xl font-semibold">{x.name}</h3>
              </Link>
            ))}
          </div>
        </section>
        <section className="mt-20 max-w-4xl">
          <h2 className="text-3xl font-semibold">Питання про {c.family.toLowerCase()}</h2>
          <div className="mt-6 rounded-xl border">
            {faqs.map(([q, a]) => (
              <details className="border-b p-5 last:border-0" key={q}>
                <summary className="cursor-pointer font-semibold">{q}</summary>
                <p className="mt-3 leading-7 text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}
