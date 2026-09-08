"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"
import type { Locale } from "@/lib/types"

/**
 * Другий напрям компанії на головній: розділ «Архітектурний камінь» (/arkhitekturnyi-kamin) —
 * стільниці, підвіконня, сходи, каміни, фасади, бруківка.
 *
 * Дзеркальна розкладка до блоку памʼятників вище (фото праворуч), щоб два
 * напрями читались як пара, а не як повтор. Текст статичний: це вітрина
 * розділу, а не редагована картка — сам розділ наповнюється в
 * /admin/stilnytsi.
 */
type Copy = { title: string; description: string; cta: string; items: string[] }

const COPY: Record<Locale, Copy> = {
  uk: {
    title: "Архітектурний камінь",
    description:
      "Другий напрям майстерні: кам’яні поверхні для житла й архітектури. Проєктуємо, ріжемо під розмір і монтуємо — від кухонної стільниці до фасаду й двору.",
    cta: "Перейти до розділу",
    items: [
      "Стільниці, острови, підвіконня",
      "Сходи, каміни, стінові панелі",
      "Фасади, бруківка, ландшафт",
      "Граніт, мармур, кварц, керамограніт",
    ],
  },
  pl: {
    title: "Kamień architektoniczny",
    description:
      "Drugi kierunek pracowni: kamienne powierzchnie do domu i architektury — od blatu kuchennego po elewację i podjazd.",
    cta: "Przejdź do działu",
    items: [
      "Blaty, wyspy, parapety",
      "Schody, kominki, panele ścienne",
      "Elewacje, kostka, ogród",
      "Granit, marmur, kwarc, gres",
    ],
  },
  en: {
    title: "Architectural stone",
    description:
      "Our second line of work: stone surfaces for homes and architecture — from a kitchen worktop to a façade and a driveway.",
    cta: "Open the section",
    items: [
      "Worktops, islands, window sills",
      "Stairs, fireplaces, wall panels",
      "Façades, paving, landscaping",
      "Granite, marble, quartz, porcelain",
    ],
  },
  de: {
    title: "Architekturstein",
    description:
      "Unser zweiter Bereich: Steinflächen für Haus und Architektur — von der Küchenarbeitsplatte bis zur Fassade und Hofeinfahrt.",
    cta: "Zum Bereich",
    items: [
      "Arbeitsplatten, Inseln, Fensterbänke",
      "Treppen, Kamine, Wandpaneele",
      "Fassaden, Pflaster, Garten",
      "Granit, Marmor, Quarz, Feinsteinzeug",
    ],
  },
  lt: {
    title: "Architektūrinis akmuo",
    description:
      "Antroji dirbtuvių kryptis: akmens paviršiai namams ir architektūrai — nuo virtuvės stalviršio iki fasado ir kiemo.",
    cta: "Eiti į skyrių",
    items: [
      "Stalviršiai, salos, palangės",
      "Laiptai, židiniai, sienų plokštės",
      "Fasadai, trinkelės, kraštovaizdis",
      "Granitas, marmuras, kvarcas, akmens masė",
    ],
  },
}

export function StoneDirection() {
  const { locale } = useTranslation()
  const copy = COPY[locale] ?? COPY.uk

  return (
    <section id="architectural-stone" className="mx-auto max-w-7xl px-6 pt-10 pb-2 md:pt-14">
      <article className="group overflow-hidden rounded-3xl bg-card ring-1 ring-black/[0.04] shadow-soft transition-[box-shadow,transform] duration-300 hover:shadow-hover hover:-translate-y-0.5">
        <Link href="/arkhitekturnyi-kamin" prefetch className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] lg:items-stretch">
          <div className="flex flex-col justify-center p-6 md:p-8 lg:order-1 lg:p-10">
            <h3 className="hidden text-3xl font-semibold tracking-tight-custom text-balance lg:block xl:text-4xl">
              {copy.title}
            </h3>
            <p className="text-[15px] leading-relaxed text-muted-foreground md:text-base lg:mt-4">
              {copy.description}
            </p>
            <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-2.5 text-[15px] text-foreground/85 sm:grid-cols-2">
              {copy.items.map((i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-[0.55rem] inline-block h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
                  {i}
                </li>
              ))}
            </ul>
            <span className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform group-hover:-translate-y-[1px]">
              {copy.cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </span>
          </div>

          <div className="relative aspect-[16/10] overflow-hidden bg-foreground/5 lg:order-2 lg:aspect-auto lg:min-h-[26rem]">
            <Image
              src="/stone-hero.webp"
              alt={copy.title}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent lg:hidden" />
            <h3 className="absolute bottom-6 left-6 text-3xl font-semibold tracking-tight-custom text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] lg:hidden">
              {copy.title}
            </h3>
          </div>
        </Link>
      </article>
    </section>
  )
}
