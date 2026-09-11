"use client"

import { useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import * as Dialog from "@radix-ui/react-dialog"
import { Check, ArrowUpRight, X, ZoomIn } from "lucide-react"
import { STONE_GUIDE, priceWithMaterial, type StoneGuideEntry } from "@/lib/stone-guide"
import { useTranslation } from "@/lib/i18n/context"
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

/** Порядок груп у модалці: спершу те, з чого роблять більшість пам'ятників. */
const ROCK_ORDER: StoneGuideEntry["rock"][] = ["Граніт", "Габро", "Лабрадорит", "Базальт", "Мармур"]

/**
 * Селектор каменю: на сторінці лише обраний камінь, решта 40 — у модалці з
 * великим прев'ю. Довідник виріс із 17 до 41 запису, і список на сторінці
 * став довшим за саму картку товару, а свотч 56 px не давав роздивитись зерно.
 */
export function MaterialPicker({ stone, defaultEntry, onChange }: Props) {
  const { formatPrice } = useTranslation()
  const [selected, setSelected] = useState<string>(defaultEntry.key)
  const [customText, setCustomText] = useState("")
  const [open, setOpen] = useState(false)
  /** Камінь, який зараз показано великим у модалці (ще не обраний). */
  const [preview, setPreview] = useState<StoneGuideEntry>(defaultEntry)
  const previewRef = useRef<HTMLDivElement>(null)

  const base = stone.priceFrom
  const priceFor = (e: StoneGuideEntry) =>
    base ? priceWithMaterial(base, defaultEntry, e, stone.shape) : undefined

  const current = useMemo(
    () => STONE_GUIDE.find((e) => e.key === selected) ?? defaultEntry,
    [selected, defaultEntry]
  )
  const isCustom = selected === "__custom"

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

  const openWith = (e: StoneGuideEntry) => {
    setPreview(e)
    setOpen(true)
  }

  const ConfirmButton = () => (
    <button
      type="button"
      onClick={() => {
        pick(preview)
        setOpen(false)
      }}
      className="inline-flex shrink-0 items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:-translate-y-[1px] active:scale-[0.98]"
    >
      <Check className="h-4 w-4" strokeWidth={2.5} />
      {preview.key === selected ? "Залишити" : "Обрати цей камінь"}
    </button>
  )

  const groups = ROCK_ORDER.map((rock) => ({
    rock,
    items: STONE_GUIDE.filter((e) => e.rock === rock),
  })).filter((g) => g.items.length > 0)

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Камінь
        </h2>
        <Link
          href="/memorial/kameni"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Чим відрізняються камені
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </div>

      {/* Обраний камінь. Половина каталогу — двоколірні роботи, тому це
          ОСНОВНИЙ камінь, а не весь виріб. */}
      <div
        className={cn(
          "mt-3 flex gap-4 rounded-2xl border p-3 transition-colors",
          isCustom ? "border-foreground/10" : "border-foreground/60 bg-foreground/[0.04]"
        )}
      >
        <button
          type="button"
          onClick={() => openWith(current)}
          className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-foreground/5 ring-1 ring-foreground/10"
          aria-label={`Роздивитись камінь ${current.name}`}
        >
          <Image src={current.swatch} alt={`Поверхня каменю: ${current.name}`} fill sizes="96px" className="object-cover" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/25">
            <ZoomIn className="h-5 w-5 text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100" strokeWidth={2} />
          </span>
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-base font-medium leading-snug">{isCustom ? customText || "Свій варіант" : current.name}</span>
            {!isCustom && current.key === defaultEntry.key ? (
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">на фото</span>
            ) : null}
          </div>
          {!isCustom ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {current.rock} · {current.priceLevel}
              {priceFor(current) ? ` · ${formatPrice(priceFor(current)!)}` : ""}
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground">Ціну порахує майстер після заміру</p>
          )}
          <div className="mt-2.5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openWith(current)}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-xs font-medium text-background transition-transform hover:-translate-y-[1px] active:scale-[0.98]"
            >
              Обрати інший камінь
            </button>
            {!isCustom ? (
              <button
                type="button"
                onClick={() => openWith(current)}
                className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 px-3.5 py-1.5 text-xs font-medium transition-colors hover:bg-foreground/5"
              >
                <ZoomIn className="h-3.5 w-3.5" strokeWidth={2} />
                Роздивитись
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Основний камінь на фотографії — {defaultEntry.name.toLowerCase()}. Модель виконуємо в будь-якому
        з {STONE_GUIDE.length} каменів довідника; контрастні елементи майстер добирає під обраний.
        {!isCustom && selected !== defaultEntry.key
          ? " Ціна орієнтовна: камінь — частина вартості, решта це обробка, фундамент і монтаж."
          : ""}
      </p>

      {/* Свій варіант — камінь поза списком або комбінація двох. */}
      <details className="mt-2 rounded-xl border border-foreground/10 p-3" open={isCustom}>
        <summary className="cursor-pointer text-sm font-medium">Свій варіант</summary>
        <p className="mt-1 text-xs text-muted-foreground">
          Інший камінь, поєднання двох кольорів або зразок, який ви бачили. Опишіть — майстер прорахує окремо.
        </p>
        <input
          id="custom-material"
          type="text"
          value={customText}
          onChange={(ev) => pickCustom(ev.target.value)}
          placeholder="Напр.: чорна стела, основа з червоного лезниківського"
          className="mt-2 w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-foreground/40"
        />
      </details>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[95] bg-black/60 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
          <Dialog.Content
            className={cn(
              "fixed z-[95] flex flex-col bg-background shadow-2xl outline-none",
              "inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:h-[88dvh] md:w-[min(96vw,72rem)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-foreground/10 px-4 py-3 md:px-6 md:py-4">
              <div>
                <Dialog.Title className="text-base font-semibold tracking-tight-custom md:text-xl">Оберіть камінь</Dialog.Title>
                <Dialog.Description className="mt-0.5 text-xs text-muted-foreground md:text-sm">
                  {STONE_GUIDE.length} каменів. Натисніть на зразок, щоб роздивитись, і підтвердіть вибір.
                </Dialog.Description>
              </div>
              <Dialog.Close
                className="-mr-2 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                aria-label="Закрити"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </Dialog.Close>
            </div>

            {/* Мобільний: один скрол (прев'ю зверху, сітка під ним) і закріплена
                кнопка знизу. Десктоп: дві колонки з незалежним скролом. */}
            <div className="min-h-0 flex-1 overflow-y-auto md:grid md:grid-cols-[1.05fr_1fr] md:overflow-hidden">
              <div ref={previewRef} className="flex flex-col gap-3 p-4 md:gap-4 md:overflow-y-auto md:border-r md:border-foreground/10 md:p-6">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-foreground/5 ring-1 ring-foreground/10 md:aspect-square">
                  <Image
                    key={preview.key}
                    src={preview.swatch}
                    alt={`Поверхня каменю: ${preview.name}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover"
                    priority
                  />
                </div>
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <h3 className="text-base font-semibold tracking-tight-custom md:text-xl">{preview.name}</h3>
                    <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[11px] text-muted-foreground md:text-xs">{preview.rock}</span>
                    <span className="text-[11px] text-muted-foreground md:text-xs">{preview.priceLevel}</span>
                  </div>
                  <p className="mt-1.5 text-sm leading-snug text-foreground/85 md:leading-relaxed">{preview.look}</p>
                  <p className="mt-1 hidden text-sm leading-relaxed text-muted-foreground md:block">{preview.why}</p>
                  {priceFor(preview) ? (
                    <p className="mt-2 text-base font-semibold tracking-tight-custom">
                      {formatPrice(priceFor(preview)!)}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">ця модель у цьому камені</span>
                    </p>
                  ) : null}
                  <div className="mt-3 hidden flex-wrap items-center gap-3 md:flex">
                    <ConfirmButton />
                    {preview.interiorSlug ? (
                      <Link
                        href={`/arkhitekturnyi-kamin/materialy/${preview.interiorSlug}`}
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                      >
                        Той самий камінь для дому
                        <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Сітка зразків за породою */}
              <div role="radiogroup" aria-label="Камінь" className="border-t border-foreground/10 p-4 md:min-h-0 md:overflow-y-auto md:border-t-0 md:p-6">
                {groups.map((g) => (
                  <div key={g.rock} className="mb-5 last:mb-0">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {g.rock} · {g.items.length}
                    </p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {g.items.map((e) => {
                        const isPreview = preview.key === e.key
                        const isSelected = selected === e.key
                        return (
                          <button
                            key={e.key}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => {
                              setPreview(e)
                              // на телефоні прев'ю вгорі, повертаємо користувача до нього
                              if (window.innerWidth < 768) {
                                previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                              }
                            }}
                            onDoubleClick={() => {
                              pick(e)
                              setOpen(false)
                            }}
                            className={cn(
                              "group relative overflow-hidden rounded-xl text-left ring-1 transition-shadow",
                              isPreview ? "ring-2 ring-foreground" : "ring-foreground/10 hover:ring-foreground/40"
                            )}
                          >
                            <span className="relative block aspect-square w-full bg-foreground/5">
                              <Image src={e.swatch} alt="" fill sizes="(max-width: 640px) 33vw, 160px" className="object-cover" />
                            </span>
                            <span className="block px-1.5 py-1 text-[11px] font-medium leading-tight text-balance md:px-2 md:py-1.5">
                              {e.name.replace(/\s*\(.*\)$/, "")}
                            </span>
                            {isSelected ? (
                              <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background">
                                <Check className="h-3 w-3" strokeWidth={3} />
                              </span>
                            ) : null}
                            {e.key === defaultEntry.key ? (
                              <span className="absolute left-1.5 top-1.5 rounded-full bg-background/90 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                                на фото
                              </span>
                            ) : null}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Закріплена кнопка на телефоні */}
            <div className="flex items-center gap-3 border-t border-foreground/10 bg-background px-4 py-3 md:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{preview.name}</p>
                {priceFor(preview) ? <p className="text-xs text-muted-foreground">{formatPrice(priceFor(preview)!)}</p> : null}
              </div>
              <ConfirmButton />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  )
}
