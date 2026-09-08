'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Filter, X } from 'lucide-react'
import type { Collection } from '@/lib/stone/cms-types'
type Group = 'family' | 'tone' | 'applications' | 'finishes' | 'thicknesses' | 'brand'
const labels: Record<Group, string> = {
  family: 'Родина',
  tone: 'Тон',
  applications: 'Застосування',
  finishes: 'Фініш',
  thicknesses: 'Товщина',
  brand: 'Бренд / родовище',
}
const toneColor = (tone: string) =>
  tone.includes('чор')
    ? 'bg-stone-900'
    : tone.includes('бі')
      ? 'bg-stone-100'
      : tone.includes('черв') || tone.includes('рож')
        ? 'bg-rose-400'
        : tone.includes('сір')
          ? 'bg-stone-400'
          : 'bg-amber-200'
const values = (item: Collection, group: Group): string[] =>
  group === 'applications'
    ? item.applications
    : group === 'finishes'
      ? item.finishes
      : group === 'thicknesses'
        ? item.thicknesses.map(String)
        : group === 'brand'
          ? [item.brand ?? item.origin]
          : [item[group]]
export function FacetedCatalog({ collections }: { collections: Collection[] }) {
  const [active, setActive] = useState<Record<Group, string[]>>({
      family: [],
      tone: [],
      applications: [],
      finishes: [],
      thicknesses: [],
      brand: [],
    }),
    [mobile, setMobile] = useState(false)
  const match = (item: Collection, state = active) =>
    Object.entries(state).every(
      ([group, selected]) =>
        !selected.length || selected.some((value) => values(item, group as Group).includes(value))
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const result = useMemo(() => collections.filter((item) => match(item)), [active, collections])
  const toggle = (group: Group, value: string) =>
    setActive((current) => ({
      ...current,
      [group]: current[group].includes(value)
        ? current[group].filter((item) => item !== value)
        : [...current[group], value],
    }))
  const groups = Object.keys(labels) as Group[]
  const options = (group: Group) =>
    Array.from(new Set(collections.flatMap((item) => values(item, group)))).sort()
  const filters = (
    <div className="flex flex-col gap-7">
      {groups.map((group) => (
        <fieldset key={group}>
          <legend className="text-sm font-semibold">{labels[group]}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {options(group).map((value) => {
              const selected = active[group].includes(value),
                next = {
                  ...active,
                  [group]: selected
                    ? active[group].filter((item) => item !== value)
                    : [...active[group], value],
                },
                count = collections.filter((item) => match(item, next)).length
              return (
                <button
                  type="button"
                  aria-pressed={selected}
                  key={value}
                  onClick={() => toggle(group, value)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs ${selected ? 'border-primary bg-primary text-primary-foreground' : 'bg-background text-foreground'}`}
                >
                  {group === 'tone' && (
                    <span className={`size-3 rounded-full border ${toneColor(value)}`} />
                  )}{' '}
                  {group === 'thicknesses' ? `${value} мм` : value}{' '}
                  <span className="opacity-60">{count}</span>
                </button>
              )
            })}
          </div>
        </fieldset>
      ))}
    </div>
  )
  const chips = groups.flatMap((group) => active[group].map((value) => ({ group, value })))
  return (
    <div className="page-shell py-12">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Знайдено: <strong className="text-foreground">{result.length}</strong>
        </p>
        <button
          onClick={() => setMobile(true)}
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm lg:hidden"
        >
          <Filter className="size-4" /> Фільтри
        </button>
      </div>
      {chips.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={`${chip.group}-${chip.value}`}
              onClick={() => toggle(chip.group, chip.value)}
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-2 text-xs"
            >
              {chip.value}
              <X className="size-3" />
            </button>
          ))}
          <button
            onClick={() =>
              setActive({
                family: [],
                tone: [],
                applications: [],
                finishes: [],
                thicknesses: [],
                brand: [],
              })
            }
            className="px-3 py-2 text-xs font-semibold underline"
          >
            Скинути все
          </button>
        </div>
      )}
      <div className="mt-8 grid gap-10 lg:grid-cols-[300px_1fr]">
        <aside className="hidden rounded-xl border bg-card p-6 lg:block">{filters}</aside>
        <section>
          {result.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {result.map((item) => (
                <Link
                  href={`/arkhitekturnyi-kamin/materialy/${item.slug}`}
                  key={item.slug}
                  className="group overflow-hidden rounded-xl border bg-card"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={item.cardImage}
                      alt={`${item.name}: фактура каменю`}
                      fill
                      sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 33vw"
                      className="object-cover transition-transform group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="p-5">
                    <p className="eyebrow text-muted-foreground">
                      {item.family} · {item.origin}
                    </p>
                    <h2 className="mt-3 text-xl font-semibold">{item.name}</h2>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border bg-card p-10 text-center">
              <h2 className="text-2xl font-semibold">Немає точного збігу</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Скиньте частину фільтрів або перегляньте популярні позиції.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {collections.slice(0, 3).map((item) => (
                  <Link
                    className="rounded-full border px-4 py-2 text-sm"
                    href={`/arkhitekturnyi-kamin/materialy/${item.slug}`}
                    key={item.slug}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
      {mobile && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Фільтри каталогу"
          className="fixed inset-0 z-50 overflow-y-auto bg-background p-5 lg:hidden"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Фільтри</h2>
            <button aria-label="Закрити фільтри" onClick={() => setMobile(false)}>
              <X />
            </button>
          </div>
          <div className="py-8">{filters}</div>
          <button
            onClick={() => setMobile(false)}
            className="sticky bottom-4 w-full rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground"
          >
            Показати {result.length} результатів
          </button>
        </div>
      )}
    </div>
  )
}
