import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { shouldBypassOptimizer } from "@/lib/image-source"
import { LEAD_TIMES, WARRANTY_YEARS } from "@/lib/site-facts"
import type { StoneItem } from "@/lib/types"

/**
 * Два напрями майстерні — головне розгалуження сайту.
 *
 * Головна не продає пам'ятники й не продає стільниці: вона каже, хто ми, і
 * веде далі. Тому тут дві рівні картки, а не каталог: ліворуч — меморіальний
 * напрям з його хабом /pamyatnyky, праворуч — архітектурний камінь зі своїм
 * розділом. Усе, що стосується лише пам'ятників (ціни, фасети, регіони,
 * відгуки, FAQ), живе на /pamyatnyky.
 */
export function HomeDirections({ stones }: { stones: StoneItem[] }) {
  const monuments = stones.filter((s) => s.category === "memorial")
  const cover = monuments.find((s) => s.isFeatured) ?? monuments[0]

  const cards = [
    {
      href: "/pamyatnyky",
      eyebrow: "Напрям 01",
      title: "Пам'ятники",
      text: "Одинарні й подвійні пам'ятники, хрести, дитячі та військові, меморіальні комплекси під ключ. Від ескізу до встановлення на кладовищі.",
      items: [
        `${monuments.length} моделей у каталозі`,
        `виготовлення ${LEAD_TIMES.single}`,
        "монтаж по всій Україні",
        `${WARRANTY_YEARS} років гарантії на все`,
      ],
      cta: "До пам'ятників",
      image: cover?.imagePath ?? "/hero/hero-poster.jpg",
      alt: "Меморіальний комплекс із габро, виготовлений у Костополі",
    },
    {
      href: "/arkhitekturnyi-kamin",
      eyebrow: "Напрям 02",
      title: "Архітектурний камінь",
      text: "Стільниці, підвіконня, сходи, каміни, фасади й бруківка. Проєктуємо, ріжемо під розмір і монтуємо натуральний та інженерний камінь для дому й архітектури.",
      items: ["10 українських гранітів", "мармур, кварцит, кварц, керамограніт", "безкоштовний замір", "калькулятор вартості онлайн"],
      cta: "До архітектурного каменю",
      image: "/stone-hero.webp",
      alt: "Кухонна стільниця з натурального каменю",
    },
  ]

  return (
    <section id="directions" className="mx-auto max-w-7xl px-6 pt-14 md:pt-20">
      <div className="mb-8 md:mb-10">
        <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">Два напрями</span>
        <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight-custom md:text-6xl text-balance">
          Один цех, один камінь — два призначення
        </h2>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
          Той самий український граніт, габро, лабрадорит і мармур ми ріжемо і на стели для пам'яті, і на
          поверхні для життя. Оберіть, що вам потрібно сьогодні.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 md:gap-6">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            prefetch
            className="group flex flex-col overflow-hidden rounded-3xl bg-card ring-1 ring-black/[0.04] shadow-soft transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-hover"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-foreground/5">
              <Image
                src={c.image}
                alt={c.alt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]"
                unoptimized={shouldBypassOptimizer(c.image)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <span className="absolute left-6 top-6 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-white/95 backdrop-blur-md">
                {c.eyebrow}
              </span>
              <h3 className="absolute bottom-6 left-6 text-3xl font-semibold tracking-tight-custom text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] md:text-4xl">
                {c.title}
              </h3>
            </div>
            <div className="flex flex-1 flex-col p-6 md:p-8">
              <p className="text-[15px] leading-relaxed text-muted-foreground md:text-base">{c.text}</p>
              <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2 text-[15px] text-foreground/85 sm:grid-cols-2">
                {c.items.map((i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-[0.55rem] inline-block h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
                    {i}
                  </li>
                ))}
              </ul>
              <span className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-foreground px-5 py-2.5 pt-2.5 text-sm font-medium text-background transition-transform group-hover:-translate-y-[1px] md:mt-8">
                {c.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
