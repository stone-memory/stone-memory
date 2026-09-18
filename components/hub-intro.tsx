"use client"

import Link from "next/link"
import { ConsultButton } from "@/components/consult-button"
import { useTranslation } from "@/lib/i18n/context"
import { HUB_COPY } from "@/lib/i18n/copy/hub"

/** Заголовок і три кнопки хабу /pamyatnyky — за мовою відвідувача. */
export function HubIntro() {
  const { locale } = useTranslation()
  const c = HUB_COPY[locale].intro
  return (
    <section className="mx-auto max-w-7xl px-6 pt-6 md:pt-8">
      <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">{c.eyebrow}</span>
      <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight-custom md:text-6xl text-balance">{c.heading}</h1>
      <p className="mt-4 max-w-2xl text-base text-muted-foreground text-balance md:text-lg">{c.lead}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/memorial/pamyatnyky"
          prefetch
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:-translate-y-[1px]"
        >
          {c.catalog}
        </Link>
        <Link
          href="/tsiny"
          prefetch
          className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-6 py-3 text-sm font-medium transition-colors hover:bg-foreground/5"
        >
          {c.prices}
        </Link>
        <ConsultButton variant="secondary" topic="Хаб пам'ятників">
          {c.consult}
        </ConsultButton>
      </div>
    </section>
  )
}
