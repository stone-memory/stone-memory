'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { edgeProfiles, finishes } from '@/data/stone/technical'
import type { Remnant } from '@/lib/stone/cms-types'
import { readAttribution } from '@/lib/attribution'

export function EdgeProfiles() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {edgeProfiles.map(([name, copy, tier], i) => (
        <article key={name} className="rounded-xl bg-card p-6">
          <svg
            viewBox="0 0 160 80"
            role="img"
            aria-label={`Переріз профілю ${name}`}
            className="h-24 w-full text-foreground"
          >
            <path
              d={
                i % 3 === 0
                  ? 'M18 20H142V60H18Z'
                  : i % 3 === 1
                    ? 'M18 20H126Q142 20 142 36V60H18Z'
                    : 'M18 20H130Q142 26 142 40Q142 54 130 60H18Z'
              }
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
          </svg>
          <p className="eyebrow text-accent">{tier}</p>
          <h2 className="mt-3 text-2xl font-semibold">{name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{copy}</p>
        </article>
      ))}
    </div>
  )
}

export function FinishGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {finishes.map(([name, image, feel, use, slip, care]) => (
        <article key={name} className="overflow-hidden rounded-xl bg-card">
          <div className="relative aspect-square">
            <Image
              src={image}
              alt={`${name} фініш натурального каменю крупним планом`}
              fill
              sizes="(max-width:768px) 100vw, 33vw"
              className="object-cover"
            />
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-semibold">{name}</h2>
            <dl className="mt-5 grid gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Тактильність</dt>
                <dd>{feel}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Застосування</dt>
                <dd>{use}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Зчеплення</dt>
                <dd>{slip}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Догляд</dt>
                <dd>{care}</dd>
              </div>
            </dl>
          </div>
        </article>
      ))}
    </div>
  )
}

export function RemnantInventory({ remnants }: { remnants: Remnant[] }) {
  const [selected, setSelected] = useState('')
  const item = remnants.find((r) => r.id === selected)
  return (
    <div>
      <div className="grid gap-5 md:grid-cols-2">
        {remnants.map((r) => (
          <article key={r.id} className="overflow-hidden rounded-xl bg-card">
            <div className="relative aspect-[4/3]">
              <Image
                src={r.image}
                alt={`Залишок сляба ${r.name}, ${r.id}`}
                fill
                sizes="(max-width:768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between gap-4">
                <p className="eyebrow text-accent">{r.id}</p>
                <span className="rounded-full border px-3 py-1 text-xs">{r.status}</span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold">{r.name}</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {r.size} · {r.thickness} · {r.finish}
              </p>
              <p className="mt-4 font-semibold">{r.price}</p>
              <button
                onClick={() => setSelected(r.id)}
                className="mt-5 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
              >
                Зарезервувати
              </button>
            </div>
          </article>
        ))}
      </div>
      {item && (
        <ReservationForm
          item={`${item.id} · ${item.name}, ${item.size}, ${item.thickness}, ${item.finish}`}
          itemId={item.id}
          onClose={() => setSelected('')}
        />
      )}
    </div>
  )
}

/**
 * Резерв залишку — це справжня заявка через /api/lead (CRM + Telegram),
 * а не імітація. Раніше форма чекала 600 мс і писала «надіслано».
 */
function ReservationForm({
  item,
  itemId,
  onClose,
}: {
  item: string
  itemId: string
  onClose: () => void
}) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'done'>('idle')
  const [error, setError] = useState('')
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('pending')
    setError('')
    const body = new FormData(e.currentTarget)
    body.set('interest', `Резерв залишку ${itemId}`)
    body.set('message', `Запит на резерв залишку сляба: ${item}.`)
    const attribution = readAttribution()
    if (attribution) body.set('attribution', JSON.stringify(attribution))
    const response = await fetch('/api/lead', { method: 'POST', body }).catch(() => null)
    if (response?.ok) {
      setStatus('done')
      return
    }
    const result = response ? await response.json().catch(() => ({})) : {}
    setError(result.error || 'Не вдалося надіслати запит. Зателефонуйте нам або спробуйте ще раз.')
    setStatus('idle')
  }
  return (
    <div className="mt-8 rounded-xl border bg-card p-6" aria-live="polite">
      {status === 'done' ? (
        <p className="flex items-center gap-2 font-semibold">
          <Check className="size-5" /> Запит на {itemId} надіслано. Ми зв’яжемося протягом робочого
          дня.
        </p>
      ) : (
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="eyebrow text-accent">Резерв {itemId}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Резерв підтверджує менеджер після перевірки залишку.
            </p>
          </div>
          <label className="sr-only">
            Не заповнюйте це поле
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
          <label className="text-sm">
            Ім’я
            <input
              name="name"
              required
              minLength={2}
              autoComplete="name"
              className="mt-2 h-11 w-full rounded-lg border bg-background px-3"
            />
          </label>
          <label className="text-sm">
            Телефон
            <input
              name="phone"
              required
              type="tel"
              autoComplete="tel"
              pattern="[+0-9 ()-]{10,}"
              className="mt-2 h-11 w-full rounded-lg border bg-background px-3"
            />
          </label>
          <div className="flex items-center gap-3 md:col-start-3">
            <button
              disabled={status === 'pending'}
              className="flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {status === 'pending' && <Loader2 className="mr-2 size-4 animate-spin" />}Надіслати
            </button>
            <button type="button" onClick={onClose} className="text-sm">
              Скасувати
            </button>
          </div>
          {error && <p className="text-sm text-destructive md:col-span-3">{error}</p>}
        </form>
      )}
    </div>
  )
}

export function SupportLinks() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link href="/arkhitekturnyi-kamin/materialy/tovshchyny" className="rounded-full border px-4 py-2 text-sm">
        Товщини
      </Link>
      <Link href="/arkhitekturnyi-kamin/materialy/finishi" className="rounded-full border px-4 py-2 text-sm">
        Фініші
      </Link>
      <Link href="/arkhitekturnyi-kamin/dohliad" className="rounded-full border px-4 py-2 text-sm">
        Догляд
      </Link>
    </div>
  )
}
