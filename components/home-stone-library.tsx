"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { STONE_GUIDE } from "@/lib/stone-guide"
import { HomeStoneFamily } from "@/components/home-stone-family"
import { useTranslation } from "@/lib/i18n/context"
import { HOME_COPY } from "@/lib/i18n/copy/home"
import { rockFamilyLabel } from "@/lib/i18n/copy/common"
import type { Collection } from "@/lib/stone/cms-types"

/**
 * Спільна бібліотека каменю на головній.
 *
 * Дані — колекції розділу «Архітектурний камінь» (stilnytsi_materials): це
 * єдине місце, де кожен камінь має фото, походження й тон. Натуральні породи
 * показуємо картками з двома виходами — «для пам'ятників» (довідник або
 * фасет каталогу) і «для дому» (сторінка колекції). Інженерний камінь (кварц,
 * керамограніт) на пам'ятники не йде, тому він окремим рядком лише з
 * посиланням у розділ.
 *
 * Родини в даних названі українською («Граніт»); для інших мов назву й
 * примітку підставляє словник, самі дані не чіпаємо.
 */

const NATURAL = ["Граніт", "Габро", "Базальт", "Лабрадорит", "Пісковик", "Мармур", "Кварцит", "Онікс", "Травертин", "Вапняк"]

// Спершу родини, де є українські родовища, потім суто імпортні.
const FAMILY_ORDER = ["Граніт", "Габро", "Лабрадорит", "Базальт", "Пісковик", "Кварцит", "Мармур", "Онікс", "Травертин", "Вапняк"]

const isUkrainian = (origin: string) => /Украї/.test(origin)

const FAMILY_HREF: Record<string, string> = {
  Граніт: "/arkhitekturnyi-kamin/materialy/granit",
  Габро: "/arkhitekturnyi-kamin/materialy/gabro",
  Базальт: "/arkhitekturnyi-kamin/materialy/bazalt",
  Пісковик: "/arkhitekturnyi-kamin/materialy/piskovyk",
  Лабрадорит: "/arkhitekturnyi-kamin/materialy/labradoryt",
  Мармур: "/arkhitekturnyi-kamin/materialy/marmur",
  Кварцит: "/arkhitekturnyi-kamin/materialy/kvarcyt",
  Онікс: "/arkhitekturnyi-kamin/materialy/oniks",
  Травертин: "/arkhitekturnyi-kamin/materialy/travertyn",
  Вапняк: "/arkhitekturnyi-kamin/materialy/vapnyak",
}

function memorialHref(slug: string): string | null {
  const entry = STONE_GUIDE.find((e) => e.interiorSlug === slug)
  if (!entry) return null
  return entry.facet ? `/memorial/pamyatnyky/${entry.facet}` : "/memorial/kameni"
}

export function HomeStoneLibrary({ collections }: { collections: Collection[] }) {
  const { locale } = useTranslation()
  const c = HOME_COPY[locale].library
  const natural = collections.filter((col) => NATURAL.includes(col.family))
  const engineered = collections.filter((col) => !NATURAL.includes(col.family))
  const families = FAMILY_ORDER.filter((f) => natural.some((col) => col.family === f))
  const brands = Array.from(new Set(engineered.map((col) => col.brand).filter(Boolean))) as string[]
  const ukrainian = natural.filter((col) => isUkrainian(col.origin)).length
  const forMemorial = natural.filter((col) => memorialHref(col.slug)).length

  if (natural.length === 0) return null

  return (
    <section id="stone" className="mx-auto max-w-7xl px-6 pt-16 md:pt-24">
      <div className="mb-8 grid gap-6 md:mb-12 lg:grid-cols-[1.3fr_1fr] lg:items-end">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">{c.eyebrow}</span>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight-custom md:text-6xl text-balance">{c.heading}</h2>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">{c.lead}</p>
        </div>
        <dl className="grid grid-cols-3 gap-3">
          <Stat value={`${natural.length}`} label={c.statNatural} />
          <Stat value={`${ukrainian}`} label={c.statUkrainian} />
          <Stat value={`${forMemorial}`} label={c.statMemorial} />
        </dl>
      </div>

      <div className="space-y-12">
        {families.map((family) => {
          // Українські родовища попереду імпорту в кожній родині.
          const items = natural
            .filter((col) => col.family === family)
            .sort((a, b) => Number(isUkrainian(b.origin)) - Number(isUkrainian(a.origin)))
          const familyLabel = rockFamilyLabel(family, locale)
          return (
            <div key={family}>
              <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
                <h3 className="text-2xl font-semibold tracking-tight-custom md:text-3xl">{familyLabel}</h3>
                <p className="max-w-2xl text-[15px] text-muted-foreground">{c.familyNote[family]}</p>
              </div>
              <HomeStoneFamily
                family={familyLabel}
                items={items.map((col) => ({
                  slug: col.slug,
                  name: col.name,
                  origin: col.origin,
                  tone: col.tone,
                  image: col.cardImage || col.image,
                  memorialHref: memorialHref(col.slug),
                }))}
              />
              <div className="mt-4">
                <Link
                  href={FAMILY_HREF[family] ?? "/arkhitekturnyi-kamin/materialy"}
                  className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-foreground"
                >
                  {c.allAbout(familyLabel)}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {engineered.length > 0 && (
        <div className="mt-12 flex flex-col gap-4 rounded-3xl bg-secondary/60 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h3 className="text-xl font-semibold tracking-tight-custom md:text-2xl">{c.engineeredTitle}</h3>
            <p className="mt-1.5 max-w-2xl text-[15px] text-muted-foreground">
              {c.engineeredText(engineered.length, brands.join(", "))}
            </p>
          </div>
          <Link
            href="/arkhitekturnyi-kamin/materialy"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:-translate-y-[1px]"
          >
            {c.allMaterials}
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      )}
    </section>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-secondary/60 p-4">
      <dd className="text-2xl font-semibold tracking-tight-custom tabular-nums md:text-3xl">{value}</dd>
      <dt className="mt-1 text-xs text-muted-foreground md:text-sm">{label}</dt>
    </div>
  )
}
