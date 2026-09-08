import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getContacts, getSetting } from '@/lib/stone/cms'
import { SectionHeading } from '@/components/stone/site/shell'
import { PrimaryCtaButton } from '@/components/stone/site/content-components'

/**
 * Серверні секції, що читають контент із CMS самі: їх вставляють у десятки
 * сторінок, тож простіше дати їм власний доступ до даних, ніж тягнути props.
 */

export async function ResponseChip() {
  const service = await getSetting('service')
  return (
    <p className="inline-flex rounded-full border border-current/20 px-3 py-1.5 text-xs opacity-70">
      {service.promises.response}
    </p>
  )
}

export async function WorkSteps() {
  const service = await getSetting('service')
  return (
    <section className="page-shell py-20">
      <SectionHeading
        eyebrow="Процес"
        title="Як ми працюємо."
        copy="Шість зрозумілих кроків від першого запиту до змонтованого виробу."
      />
      <div className="mt-10 grid gap-px overflow-hidden rounded-xl bg-border md:grid-cols-2 lg:grid-cols-3">
        {service.workSteps.map(([number, title, copy]) => (
          <div key={number} className="bg-card p-7">
            <p className="eyebrow text-accent">{number}</p>
            <h3 className="mt-5 text-xl font-semibold">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export async function Cta() {
  const contacts = await getContacts()
  return (
    <section className="page-shell py-10">
      <div className="flex flex-col gap-8 rounded-[2rem] bg-primary p-8 text-primary-foreground md:flex-row md:items-end md:justify-between md:p-14">
        <div>
          <p className="eyebrow text-primary-foreground/60">Від ідеї до монтажу</p>
          <h2 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-.055em] text-primary-foreground md:text-6xl">
            Знайдемо камінь для вашого простору.
          </h2>
          <div className="mt-6">
            <ResponseChip />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/arkhitekturnyi-kamin/kalkulyator"
            className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold leading-5 text-foreground"
          >
            Розрахувати вартість <ArrowUpRight className="size-4" />
          </Link>
          <a
            href={contacts.phone.href}
            className="inline-flex min-h-11 w-fit items-center justify-center rounded-full border border-primary-foreground/30 px-6 py-3 text-sm font-semibold leading-5 text-primary-foreground"
          >
            Зв&apos;язатися
          </a>
        </div>
      </div>
    </section>
  )
}

export async function CtaPair({ equal = false }: { equal?: boolean }) {
  const contacts = await getContacts()
  const width = equal ? 'w-full sm:flex-1' : ''
  return (
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      <PrimaryCtaButton className={width} />
      <a
        href={contacts.phone.href}
        className={`inline-flex min-h-11 items-center justify-center rounded-full border px-6 py-3 text-sm font-semibold leading-5 ${width}`}
      >
        Зв&apos;язатися
      </a>
    </div>
  )
}
