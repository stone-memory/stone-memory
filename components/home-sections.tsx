import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Award, Hammer, MapPin, Ruler } from "lucide-react"
import { ConsultButton } from "@/components/consult-button"
import { MEMORIAL_FACETS, facetItems, stonePath } from "@/lib/catalog-taxonomy"
import { CITIES, LEAD_TIMES, WARRANTY_YEARS } from "@/lib/site-facts"
import { productType } from "@/lib/product-copy"
import type { StoneItem } from "@/lib/types"

/**
 * Серверні блоки головної: цифри, підбірки, процес, міста.
 *
 * Головна складалась із hero, однієї картки «Пам'ятники» і секцій, що
 * рендеряться лише після гідратації, — разом 190 слів тексту. Ці блоки
 * читають живий каталог і кладуть у HTML те, за що сайт має ранжуватись:
 * типи виробів із цінами «від», процес, географію та гарантію.
 */

function minPriceOf(stones: StoneItem[]): number | null {
  const prices = stones.map((s) => s.priceFrom).filter((p): p is number => typeof p === "number" && p > 0)
  return prices.length ? Math.min(...prices) : null
}

const fmt = (n: number) => `${n.toLocaleString("uk-UA")}\u00A0₴`

export function HomeNumbers({ stones }: { stones: StoneItem[] }) {
  const monuments = stones.filter((s) => s.category === "memorial")
  const single = monuments.filter((s) => productType(s) === "single")
  const facts = [
    { value: `${monuments.length}`, label: "моделей у каталозі", icon: Ruler },
    { value: minPriceOf(single) ? `від ${fmt(minPriceOf(single)!)}` : "—", label: "одинарний пам'ятник з монтажем", icon: Hammer },
    { value: `${WARRANTY_YEARS} років`, label: "гарантії на камінь, фундамент і монтаж", icon: Award },
    { value: LEAD_TIMES.single, label: "від ескізу до встановлення", icon: MapPin },
  ]
  return (
    <section className="mx-auto max-w-7xl px-6 pt-14 md:pt-20">
      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label} className="rounded-2xl bg-card p-5 ring-1 ring-black/[0.06] shadow-soft md:p-6">
            <f.icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
            <dd className="mt-4 text-2xl font-semibold tracking-tight-custom tabular-nums md:text-3xl">{f.value}</dd>
            <dt className="mt-1 text-sm text-muted-foreground">{f.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  )
}

/** Сім типів виробів із ціною «від» і фото з каталогу — те, що людина шукає першим. */
export function HomeCollections({ stones }: { stones: StoneItem[] }) {
  const cards = MEMORIAL_FACETS.filter((f) =>
    ["odynochni", "podviyni", "kompleksy", "viyskovi", "khresty", "yevropeiski", "dytyachi", "chorni"].includes(f.slug)
  )
    .map((f) => {
      const items = facetItems(stones, f)
      const cover = items.find((s) => s.isFeatured) ?? items[0]
      return { facet: f, count: items.length, min: minPriceOf(items), cover }
    })
    .filter((c) => c.count > 0 && c.cover)

  if (cards.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-6 pt-14 md:pt-20">
      <div className="mb-8 flex flex-col items-start gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">Каталог</span>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight-custom md:text-6xl text-balance">
            Оберіть тип пам'ятника
          </h2>
        </div>
        <Link
          href="/memorial/pamyatnyky"
          className="group inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:-translate-y-[1px]"
        >
          Весь каталог
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        {cards.map(({ facet, count, min, cover }) => (
          <Link
            key={facet.slug}
            href={`/memorial/pamyatnyky/${facet.slug}`}
            className="group overflow-hidden rounded-2xl bg-card ring-1 ring-black/[0.04] shadow-soft transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-hover"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-foreground/5">
              <Image
                src={cover!.imagePath}
                alt={facet.h1}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]"
              />
            </div>
            <div className="p-4 md:p-5">
              <h3 className="text-base font-semibold tracking-tight-custom md:text-lg">{facet.h1}</h3>
              <p className="mt-1 text-sm text-muted-foreground tabular-nums">
                {count} {count === 1 ? "модель" : count < 5 ? "моделі" : "моделей"}
                {min ? ` · від ${fmt(min)}` : ""}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

const STEPS = [
  {
    title: "Фото ділянки й побажання",
    text: "Надішліть фото місця в месенджер або через форму. Скажіть, хто спочиває, який камінь до душі та який бюджет. Цього достатньо для першої ціни.",
  },
  {
    title: "Ескіз і ціна за день",
    text: "Протягом робочого дня повертаємось із ескізом у вашому камені й розрахунком. Правки безкоштовні, поки не почали різати камінь.",
  },
  {
    title: "Замір і 3D-проєкт",
    text: "Виїжджаємо на кладовище, міряємо ділянку, робимо шурф під фундамент. Для комплексів готуємо 3D-візуалізацію — щоб побачити пропорції до розпилу.",
  },
  {
    title: "Виготовлення",
    text: `Одинарний пам'ятник — ${LEAD_TIMES.single}, комплекс — ${LEAD_TIMES.complex}. Портрет погоджуємо на пробному відбитку, готовий камінь показуємо у цеху або відео.`,
  },
  {
    title: "Монтаж і гарантія",
    text: `Бригада ставить фундамент і монтує за 1–3 дні, прибирає за собою. ${WARRANTY_YEARS} років гарантії на камінь, фундамент і монтаж — приїжджаємо й виправляємо безкоштовно.`,
  },
]

export function HomeProcess() {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-16 md:pt-24">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">Як це відбувається</span>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight-custom md:text-5xl text-balance">
            Від фото ділянки до встановленого пам'ятника
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            Замовити можна дистанційно з будь-якого міста: усе погодження — по фото, ескізах і відео з цеху.
            Приїхати треба лише якщо хочете побачити камінь наживо.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ConsultButton topic="Головна: як це відбувається">Отримати розрахунок</ConsultButton>
            <Link
              href="/yak-zamovyty"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-6 py-3 text-sm font-medium transition-colors hover:bg-foreground/5"
            >
              Детально про замовлення
            </Link>
          </div>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-2xl bg-card p-6 ring-1 ring-black/[0.06] shadow-soft">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-sm font-semibold tabular-nums text-background">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight-custom">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function HomeRegions() {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-16 md:pt-24">
      <div className="rounded-3xl bg-secondary/60 p-6 md:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">Де працюємо</span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight-custom md:text-5xl text-balance">
              Цех у Костополі, монтаж по всій Україні
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Виїзд на замір і встановлення в Рівненській та Волинській областях безкоштовний. Далі — за пробігом,
              без прихованих доплат. Камінь той самий, що продають у Києві, але напряму з цеху.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-3">
            {CITIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/pamyatnyky/${c.slug}`}
                  className="group flex items-center justify-between rounded-2xl bg-card px-4 py-3 ring-1 ring-black/[0.06] transition-colors hover:ring-foreground/30"
                >
                  <span>
                    <span className="block text-[15px] font-medium">{c.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {c.distanceKm ? `${c.distanceKm} км · ${c.freeTravel ? "виїзд безкоштовно" : "за пробігом"}` : "наш цех"}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/** Три найдорожчі роботи як «портфоліо» на головній — фото змонтованих ділянок. */
export function HomeShowcase({ stones }: { stones: StoneItem[] }) {
  const picks = stones
    .filter((s) => s.category === "memorial" && productType(s) === "complex" && s.priceFrom)
    .sort((a, b) => (b.priceFrom ?? 0) - (a.priceFrom ?? 0))
    .slice(0, 3)
  if (picks.length < 3) return null
  return (
    <section className="mx-auto max-w-7xl px-6 pt-16 md:pt-24">
      <div className="mb-8 md:mb-10">
        <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">Роботи</span>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight-custom md:text-6xl text-balance">
          Меморіальні комплекси під ключ
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3 md:gap-6">
        {picks.map((s) => (
          <Link key={s.id} href={stonePath(s)} className="group block">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-foreground/5 shadow-soft transition-[box-shadow,transform] duration-500 group-hover:-translate-y-0.5 group-hover:shadow-hover">
              <Image
                src={s.imagePath}
                alt={s.name ?? "Меморіальний комплекс"}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-[700ms] group-hover:scale-[1.04]"
              />
            </div>
            <h3 className="mt-4 text-lg font-semibold tracking-tight-custom">{s.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground tabular-nums">від {fmt(s.priceFrom!)}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
