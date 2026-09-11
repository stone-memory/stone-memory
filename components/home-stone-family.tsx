"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown } from "lucide-react"

export type FamilyCard = {
  slug: string
  name: string
  origin: string
  tone: string
  image: string
  memorialHref: string | null
}

/** Скільки карток видно до натискання «Показати всі»: один ряд на десктопі. */
const INITIAL = 5

/**
 * Сітка каменів однієї родини на головній. Після розширення довідника у
 * граніту 25 колекцій, у кварциту 15: показувати все одразу означає
 * екран за екраном карток. Тому перший ряд, решта за кнопкою.
 */
export function HomeStoneFamily({ family, items }: { family: string; items: FamilyCard[] }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, INITIAL)
  const hidden = items.length - INITIAL

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {visible.map((c) => (
          <article
            key={c.slug}
            className="group overflow-hidden rounded-2xl bg-card ring-1 ring-black/[0.05] shadow-soft transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-hover"
          >
            <Link href={`/arkhitekturnyi-kamin/materialy/${c.slug}`} className="relative block aspect-square overflow-hidden bg-foreground/5">
              <Image
                src={c.image}
                alt={`${c.name} — ${c.tone}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.05]"
              />
            </Link>
            <div className="p-4">
              <h4 className="text-[15px] font-semibold leading-snug tracking-tight-custom">
                {c.name.replace(/^(Граніт|Мармур|Лабрадорит|Кварцит|Онікс|Травертин|Вапняк)\s+/, "")}
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                {c.origin.split(",")[0]} · {c.tone}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.memorialHref && (
                  <Link
                    href={c.memorialHref}
                    className="rounded-full bg-foreground px-2.5 py-1 text-[11px] font-medium text-background transition-transform hover:-translate-y-[1px]"
                  >
                    Пам'ятники
                  </Link>
                )}
                <Link
                  href={`/arkhitekturnyi-kamin/materialy/${c.slug}`}
                  className="rounded-full border border-foreground/15 px-2.5 py-1 text-[11px] font-medium transition-colors hover:border-foreground/40"
                >
                  Для дому
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-foreground/15 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/5"
        >
          {expanded ? `Згорнути ${family.toLowerCase()}` : `Показати всі ${items.length}`}
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} strokeWidth={2} />
        </button>
      )}
    </>
  )
}
