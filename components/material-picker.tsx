"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Check, ArrowUpRight } from "lucide-react"
import { STONE_GUIDE, priceWithMaterial, type StoneGuideEntry } from "@/lib/stone-guide"
import { cn } from "@/lib/utils"
import type { StoneItem } from "@/lib/types"

/** Значення, яке батьківська сторінка кладе в позицію замовлення. */
export type MaterialChoice = {
  /** `key` каменю з довідника, або вільний текст для «свого варіанта». */
  material: string
  /** Людська назва для сайдбару й CRM. */
  label: string
  price?: number
  isCustom: boolean
}

type Props = {
  stone: StoneItem
  /** Камінь із фотографії — дефолт, з якого рахуються всі інші ціни. */
  defaultEntry: StoneGuideEntry
  onChange: (choice: MaterialChoice) => void
}

export function MaterialPicker({ stone, defaultEntry, onChange }: Props) {
  const [selected, setSelected] = useState<string>(defaultEntry.key)
  const [customText, setCustomText] = useState("")

  const base = stone.priceFrom
  const priceFor = (e: StoneGuideEntry) =>
    base ? priceWithMaterial(base, defaultEntry, e, stone.shape) : undefined

  const pick = (e: StoneGuideEntry) => {
    setSelected(e.key)
    onChange({ material: e.key, label: e.name, price: priceFor(e), isCustom: false })
  }

  const pickCustom = (text: string) => {
    setCustomText(text)
    setSelected("__custom")
    // Ціну не рухаємо: під нестандартний камінь її рахує майстер.
    onChange({ material: text, label: text || "Свій варіант", price: base, isCustom: true })
  }

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Камінь
        </h2>
        <Link
          href="/memorial/kamin"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Чим відрізняються камені
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </div>

      {/* Половина каталогу — двоколірні роботи: чорна стела на червоній основі
          і подібне. Тому селектор змінює ОСНОВНИЙ камінь, а не весь виріб —
          інакше підпис обіцяв би те, чого модель не передбачає. */}
      <p className="mt-2 text-sm text-muted-foreground">
        Основний камінь на фотографії — {defaultEntry.name.toLowerCase()}. Модель
        виконуємо в будь-якому з цих; контрастні елементи майстер добирає під
        обраний камінь.
      </p>

      <div role="radiogroup" aria-label="Камінь" className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {STONE_GUIDE.map((e) => {
          const active = selected === e.key
          return (
            <button
              key={e.key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => pick(e)}
              className={cn(
                "group relative flex gap-3 rounded-xl border p-2 text-left transition-colors",
                active
                  ? "border-foreground/60 bg-foreground/[0.04]"
                  : "border-foreground/10 hover:border-foreground/30"
              )}
            >
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-foreground/5 ring-1 ring-foreground/10">
                <Image
                  src={e.swatch}
                  alt={`Поверхня каменю: ${e.name}`}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </span>
              <span className="min-w-0 flex-1 self-center pr-6">
                <span className="block text-sm font-medium leading-snug text-balance">{e.name}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{e.rock}</span>
              </span>
              {active ? (
                <Check className="absolute right-2 top-2 h-4 w-4 text-foreground" strokeWidth={2.5} />
              ) : null}
              {e.key === defaultEntry.key ? (
                <span className="absolute bottom-1.5 right-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                  на фото
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {/* Свій варіант — камінь поза списком або комбінація двох. */}
      <div
        className={cn(
          "mt-2 rounded-xl border p-3 transition-colors",
          selected === "__custom" ? "border-foreground/60 bg-foreground/[0.04]" : "border-foreground/10"
        )}
      >
        <label htmlFor="custom-material" className="block text-sm font-medium">
          Свій варіант
        </label>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Інший камінь, поєднання двох кольорів або зразок, який ви бачили. Опишіть —
          майстер прорахує окремо.
        </p>
        <input
          id="custom-material"
          type="text"
          value={customText}
          onChange={(ev) => pickCustom(ev.target.value)}
          placeholder="Напр.: чорна стела, основа з червоного лезниківського"
          className="mt-2 w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-foreground/40"
        />
      </div>

      {selected !== defaultEntry.key ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {selected === "__custom"
            ? "Ціну під нестандартний камінь порахує майстер після заміру."
            : "Ціна орієнтовна: камінь — частина вартості, решта це обробка, фундамент і монтаж."}
        </p>
      ) : null}
    </section>
  )
}
