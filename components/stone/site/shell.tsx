'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { nav } from '@/lib/stone/content'
import type { Contacts } from '@/lib/stone/cms-types'
import { PrimaryCtaButton } from '@/components/stone/site/content-components'

export function Header({ contacts }: { contacts: Contacts }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="glass sticky top-0 z-40 border-b border-border/70">
      <div className="page-shell flex h-14 items-center justify-between">
        <Link href="/" aria-label="Stone Memory — головна">
          <Image
            src="/logo-stone-memory.svg"
            alt="Stone Memory"
            width={3000}
            height={714}
            priority
            className="h-auto w-32 md:w-36"
          />
        </Link>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Головна навігація">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/memorial/pamyatnyky"
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Памʼятники
          </Link>
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          <a href={contacts.phone.href} className="text-xs font-semibold">
            {contacts.phone.display}
          </a>
          <Link
            href="/arkhitekturnyi-kamin/kontakty"
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Контакти
          </Link>
          <PrimaryCtaButton
            label="Замовити замір"
            href="/arkhitekturnyi-kamin/kontakty#forma"
            className="min-h-9 px-4 py-2 text-xs leading-4"
          />
        </div>
        <button
          className="rounded-full p-2 md:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? 'Закрити меню' : 'Відкрити меню'}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav
          className="page-shell flex flex-col gap-1 border-t py-4 md:hidden"
          aria-label="Мобільна навігація"
        >
          {[...nav, { href: '/arkhitekturnyi-kamin/kontakty', label: 'Контакти' }].map((n) => (
            <Link
              onClick={() => setOpen(false)}
              key={n.href}
              href={n.href}
              className="rounded-xl px-3 py-3 text-base font-semibold hover:bg-secondary"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  copy,
  as = 'h2',
}: {
  eyebrow: string
  title: string
  copy?: string
  as?: 'h1' | 'h2'
}) {
  const Heading = as
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <Heading className="title mt-5 max-w-4xl text-balance">{title}</Heading>
      </div>
      {copy && (
        <p className="max-w-sm text-pretty text-base leading-7 text-muted-foreground">{copy}</p>
      )}
    </div>
  )
}

export function Footer({ contacts }: { contacts: Contacts }) {
  return (
    <footer className="mt-20 bg-primary pb-24 text-primary-foreground md:pb-0">
      <div className="page-shell py-16 md:py-20">
        <div className="grid gap-14 lg:grid-cols-2">
          <div>
            <Image
              src="/logo-stone-memory.svg"
              alt="Stone Memory"
              width={3000}
              height={714}
              className="h-auto w-48 invert"
            />
            <p className="mt-7 max-w-lg text-lg leading-7">
              Натуральний камінь для дому й архітектури. Власне виробництво в Костополі.
            </p>
            <div className="mt-5 flex flex-wrap gap-5 text-sm text-primary-foreground/60">
              <a href={contacts.chat.viber}>Viber</a>
              <a href={contacts.chat.whatsapp}>WhatsApp</a>
              <a href={contacts.chat.telegram}>Telegram</a>
            </div>
          </div>
          {/* Замість «підписки на новини», яка нікуди не писала email: реальний наступний крок. */}
          <div>
            <p className="text-2xl font-semibold">Почнімо з заміру</p>
            <p className="mb-5 mt-2 text-sm text-primary-foreground/60">
              Залиште запит або зателефонуйте. Відповідаємо протягом робочого дня.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/arkhitekturnyi-kamin/kontakty#forma"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-card px-5 text-sm font-semibold text-card-foreground"
              >
                Залишити запит
              </Link>
              <a
                href={contacts.phone.href}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-primary-foreground/30 px-5 text-sm font-semibold"
              >
                {contacts.phone.display}
              </a>
            </div>
          </div>
        </div>
        <div className="mt-16 grid gap-10 border-t border-primary-foreground/15 pt-10 sm:grid-cols-3">
          <FooterGroup
            title="Дослідити"
            items={[
              { href: '/arkhitekturnyi-kamin/vyroby', label: 'Каталог' },
              { href: '/arkhitekturnyi-kamin/materialy', label: 'Матеріали' },
              { href: '/arkhitekturnyi-kamin/proekty', label: 'Пропозиції' },
              { href: '/arkhitekturnyi-kamin/blog', label: 'Блог' },
            ]}
          />
          <FooterGroup
            title="Підтримка"
            items={[
              { href: '/arkhitekturnyi-kamin/harantiya', label: 'Гарантія' },
              { href: '/arkhitekturnyi-kamin/dostavka-i-montazh', label: 'Доставка та монтаж' },
              { href: '/arkhitekturnyi-kamin/faq', label: 'Питання й відповіді' },
              { href: '/arkhitekturnyi-kamin/dohliad', label: 'Догляд' },
            ]}
          />
          <div className="flex flex-col gap-3 text-sm">
            <p className="font-semibold uppercase tracking-wider">Контакти</p>
            <a href={contacts.phone.href} className="text-primary-foreground/60">
              {contacts.phone.display}
            </a>
            <a href={contacts.email.href} className="text-primary-foreground/60">
              {contacts.email.display}
            </a>
            <span className="text-primary-foreground/60">Студія і цех — Костопіль</span>
            <span className="text-primary-foreground/60">
              {contacts.hours.weekdays} · {contacts.hours.saturday}
            </span>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap justify-between gap-5 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/45">
          <span>© 2026 Stone Memory</span>
          <div className="flex flex-wrap gap-5">
            <Link href="/pro-nas">Про нас</Link>
            <Link href="/konfidentsiinist">Конфіденційність</Link>
            <Link href="/umovy">Умови</Link>
            <Link href="/arkhitekturnyi-kamin/kontakty">Контакти</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterGroup({
  title,
  items,
}: {
  title: string
  items: { href: string; label: string }[]
}) {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <p className="font-semibold">{title}</p>
      {items.map((x) => (
        <Link
          key={x.href}
          href={x.href}
          className="text-primary-foreground/60 hover:text-primary-foreground"
        >
          {x.label}
        </Link>
      ))}
    </div>
  )
}
