import Link from "next/link"
import { Phone } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SelectionSidebar } from "@/components/selection-sidebar"
import { Breadcrumbs, type Crumb } from "@/components/breadcrumbs"
import { ConsultButton } from "@/components/consult-button"
import { CONTACT } from "@/lib/site-facts"
import { cn } from "@/lib/utils"

/**
 * Примітиви інформаційних сторінок: «Ціни», «Як замовити», «Доставка і
 * оплата», «Гарантія», «Питання й відповіді», контакти, регіональні лендинги.
 *
 * Серверні компоненти без анімацій: увесь текст має бути в HTML одразу, бо
 * саме за цим текстом сторінки й мають ранжуватись. Верстка повторює
 * сторінку-довідник каменю (/memorial/kameni), щоб розділ читався як одне ціле.
 */

export function InfoPage({
  crumbs,
  title,
  lead,
  children,
}: {
  crumbs: Crumb[]
  title: string
  lead?: string
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main id="main-content">
        <div className="mx-auto max-w-7xl px-6 pt-6">
          <Breadcrumbs items={crumbs} />
        </div>
        <section className="mx-auto max-w-7xl px-6 pt-6 md:pt-8">
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight-custom md:text-6xl text-balance">{title}</h1>
          {lead && (
            <p className="mt-4 max-w-2xl text-base text-muted-foreground text-balance md:text-lg">{lead}</p>
          )}
        </section>
        {children}
      </main>
      <Footer />
      <SelectionSidebar />
    </>
  )
}

export function Section({
  title,
  eyebrow,
  children,
  className,
  id,
}: {
  title?: string
  eyebrow?: string
  children: React.ReactNode
  className?: string
  id?: string
}) {
  return (
    <section id={id} className={cn("mx-auto max-w-7xl px-6 pt-12 md:pt-16", className)}>
      {eyebrow && (
        <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">{eyebrow}</div>
      )}
      {title && (
        <h2 className="mt-2 text-2xl font-semibold tracking-tight-custom md:text-4xl text-balance">{title}</h2>
      )}
      <div className={cn(title || eyebrow ? "mt-6" : "")}>{children}</div>
    </section>
  )
}

/** Абзаци тексту, розділені порожнім рядком. */
export function Prose({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("max-w-3xl space-y-4 text-base leading-relaxed text-foreground/85 md:text-[17px]", className)}>
      {text.split("\n\n").map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  )
}

export function Steps({
  items,
}: {
  items: { title: string; text: string }[]
}) {
  return (
    <ol className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((s, i) => (
        <li
          key={s.title}
          className="relative rounded-2xl bg-card p-6 ring-1 ring-black/[0.06] shadow-soft"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-sm font-semibold tabular-nums text-background">
            {i + 1}
          </span>
          <h3 className="mt-4 text-lg font-semibold tracking-tight-custom">{s.title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{s.text}</p>
        </li>
      ))}
    </ol>
  )
}

export function Facts({ items }: { items: { value: string; label: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map((f) => (
        <div key={f.label} className="rounded-2xl bg-secondary/60 p-5">
          <dt className="text-sm text-muted-foreground">{f.label}</dt>
          <dd className="mt-1 text-2xl font-semibold tracking-tight-custom tabular-nums md:text-3xl">{f.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Table({
  head,
  rows,
  caption,
}: {
  head: string[]
  rows: (string | React.ReactNode)[][]
  caption?: string
}) {
  return (
    <div className="overflow-x-auto rounded-2xl ring-1 ring-black/[0.06] shadow-soft">
      <table className="w-full min-w-[560px] border-collapse bg-card text-left text-[15px]">
        {caption && <caption className="px-5 py-3 text-left text-sm text-muted-foreground">{caption}</caption>}
        <thead>
          <tr className="border-b border-foreground/10 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {head.map((h) => (
              <th key={h} className="px-5 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-foreground/5 last:border-b-0">
              {r.map((cell, j) => (
                <td key={j} className={cn("px-5 py-3 align-top", j === 0 ? "font-medium" : "text-foreground/80", j > 0 && "tabular-nums")}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((f) => (
        <details
          key={f.q}
          className="group rounded-2xl bg-card px-6 ring-1 ring-black/[0.06] shadow-soft open:pb-5"
        >
          <summary className="cursor-pointer list-none py-5 text-base font-semibold tracking-tight-custom md:text-lg [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-4">
              {f.q}
              <span aria-hidden className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
            </span>
          </summary>
          <div className="space-y-3 text-[15px] leading-relaxed text-muted-foreground md:text-base">
            {f.a.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </details>
      ))}
    </div>
  )
}

export function CtaBand({
  title = "Порахуємо вартість за фото ділянки",
  text = "Надішліть фото місця і побажання — протягом робочого дня повернемось з ескізом і ціною. Це безкоштовно й ні до чого не зобов'язує.",
  cta = "Надіслати фото ділянки",
}: {
  title?: string
  text?: string
  /** Текст кнопки; стає заголовком модалки заявки. */
  cta?: string
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-14 pb-20 md:pt-20 md:pb-28">
      <div className="rounded-3xl bg-foreground px-6 py-10 text-background md:px-12 md:py-14">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight-custom md:text-4xl text-balance">{title}</h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-background/75 md:text-base">{text}</p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <ConsultButton className="bg-background text-foreground" topic={title}>{cta}</ConsultButton>
            <a
              href={CONTACT.phoneHref}
              className="inline-flex items-center gap-2 text-sm font-medium text-background/85 hover:text-background"
            >
              <Phone className="h-4 w-4" strokeWidth={2} />
              {CONTACT.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export function LinkPills({ items }: { items: { href: string; label: string; count?: number }[] }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className="rounded-full border border-foreground/15 px-4 py-2 text-sm transition-colors hover:border-foreground/40"
        >
          {it.label}
          {typeof it.count === "number" && (
            <span className="ml-1.5 text-muted-foreground tabular-nums">{it.count}</span>
          )}
        </Link>
      ))}
    </div>
  )
}
