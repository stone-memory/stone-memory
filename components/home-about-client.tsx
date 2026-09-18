"use client"

import { ConsultButton } from "@/components/consult-button"
import { useTranslation } from "@/lib/i18n/context"
import { HOME_COPY } from "@/lib/i18n/copy/home"

/**
 * Розкладка блоку «Як це працює». Дані профілю (телефон) приходять із
 * серверного HomeAbout — тут лишається тільки вибір мови для текстів.
 */
export function HomeAboutClient({ phone, telHref }: { phone: string; telHref: string }) {
  const { locale } = useTranslation()
  const c = HOME_COPY[locale].about
  return (
    <section id="about" className="mx-auto max-w-7xl px-6 pt-16 md:pt-24">
      <div>
        <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">{c.eyebrow}</span>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight-custom md:text-5xl text-balance">{c.heading}</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {c.steps.map((s, i) => (
            <li key={i} className="rounded-2xl bg-card p-6 ring-1 ring-black/[0.06] shadow-soft">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-sm font-semibold tabular-nums text-background">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight-custom">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-16 rounded-3xl bg-foreground px-6 py-10 text-background md:mt-24 md:px-12 md:py-14">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight-custom md:text-4xl text-balance">{c.ctaTitle}</h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-background/75 md:text-base">{c.ctaText}</p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <ConsultButton className="bg-background text-foreground" topic={c.ctaTopic}>
              {c.ctaButton}
            </ConsultButton>
            <a href={telHref} className="text-sm font-medium text-background/85 hover:text-background">
              {phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
