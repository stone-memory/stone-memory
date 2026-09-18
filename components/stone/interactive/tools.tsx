'use client'
import Image from 'next/image'
import Link from 'next/link'
import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Check, Upload, X } from 'lucide-react'
import { materials } from '@/lib/stone/content'
import { readAttribution } from '@/lib/attribution'
import { estimatePrice } from '@/lib/stone/prices'
import { useStoneT } from '@/lib/i18n/stone/client'
import { collectionName, collectionSummary, stonePrice } from '@/lib/i18n/stone'
import type { CalculatorRates, Collection, Project, Slab } from '@/lib/stone/cms-types'
const field =
  'h-12 w-full rounded-md border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring'
/** Ліміт вкладення. Vercel обмежує тіло запиту до route handler ~4,5 МБ. */
export const MAX_UPLOAD_MB = 4
const ACCEPTED_UPLOAD = 'image/*,.pdf,application/pdf'

export function Calculator({
  collections,
  rates,
}: {
  collections: Collection[]
  rates: CalculatorRates
}) {
  const { t } = useStoneT()
  const products = Object.keys(rates.productRates)
  const [product, setProduct] = useState(products[0] ?? 'Стільниця'),
    [materialSlug, setMaterialSlug] = useState('grey-ukraine'),
    [length, setLength] = useState('2400'),
    [width, setWidth] = useState('600'),
    [edge, setEdge] = useState(Object.keys(rates.edgeRates)[0] ?? 'Прямий'),
    [cutouts, setCutouts] = useState('1'),
    [handoff, setHandoff] = useState(false),
    [file, setFile] = useState<File | null>(null),
    [fileError, setFileError] = useState('')
  const selected = collections.find((item) => item.slug === materialSlug) ?? collections[0]
  // Матеріал «лише для вулиці» не пропонується для стільниці. Якщо його обрали до
  // перемикання типу, повертаємось до базового, інакше розрахунок ішов би по
  // варіанту, якого в списку вже нема.
  const exteriorConflict = product === 'Стільниця' && !!selected.exteriorOnly
  useEffect(() => {
    if (exteriorConflict) setMaterialSlug('grey-ukraine')
  }, [exteriorConflict])
  const pickFile = (next: File | null) => {
    if (next && next.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setFile(null)
      setFileError(`${t('Файл завеликий: до')} ${MAX_UPLOAD_MB} ${t('МБ')}.`)
      return
    }
    setFileError('')
    setFile(next)
  }
  const tier =
    selected.family === 'Мармур' || selected.family === 'Кварцит'
      ? 'Преміальний рівень'
      : selected.family === 'Керамограніт'
        ? 'Базовий рівень'
        : 'Середній рівень'
  const valid =
    Number(length) > 0 && Number(width) > 0 && Number(cutouts) >= 0 && Number(cutouts) <= 20
  const estimate = valid
    ? estimatePrice(rates, {
        product,
        tier,
        lengthMm: Number(length),
        widthMm: Number(width),
        edge,
        cutouts: Number(cutouts),
      })
    : null
  const summary = `${product}; ${selected.name}; ${length} × ${width} мм; кромка: ${edge}; вирізів: ${cutouts}; орієнтир: ${estimate?.toLocaleString('uk-UA')} грн.`
  // Підсумок для менеджера лишається українським: він іде в CRM і Telegram.
  if (handoff)
    return (
      <div>
        <button onClick={() => setHandoff(false)} className="mb-5 text-sm text-muted-foreground">
          {t('← Назад до розрахунку')}
        </button>
        <InquiryForm initialMessage={summary} attachment={file} />
      </div>
    )
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_.8fr]">
      <form
        className="grid gap-5 rounded-xl bg-card p-6 md:grid-cols-2 md:p-10"
        onSubmit={(e) => e.preventDefault()}
      >
        <Select label={t('Тип виробу')} value={product} set={(v) => setProduct(v)} options={products} />
        <MaterialSelect
          product={product}
          value={materialSlug}
          set={setMaterialSlug}
          collections={collections}
        />
        <NumberField label={t('Довжина, мм')} value={length} set={setLength} />
        <NumberField label={t('Ширина, мм')} value={width} set={setWidth} />
        <Select
          label={t('Профіль кромки')}
          value={edge}
          set={(v) => setEdge(v)}
          options={Object.keys(rates.edgeRates)}
        />
        <NumberField label={t('Кількість вирізів')} value={cutouts} set={setCutouts} min={0} />
        <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed p-4 text-sm md:col-span-2">
          <Upload className="shrink-0" />
          <span className="min-w-0 flex-1">
            {file ? (
              <>
                <span className="block truncate font-semibold">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(0)} {t('КБ')} · {t('піде разом із конфігурацією')}
                </span>
              </>
            ) : (
              <>
                {t('Додати фото або креслення')}
                <span className="block text-xs text-muted-foreground">
                  {t('Фото або PDF, до')} {MAX_UPLOAD_MB} {t('МБ')}
                </span>
              </>
            )}
          </span>
          {file && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                pickFile(null)
              }}
              aria-label={t('Прибрати файл')}
              className="rounded-full p-1 hover:bg-secondary"
            >
              <X className="size-4" />
            </button>
          )}
          <input
            type="file"
            className="sr-only"
            accept={ACCEPTED_UPLOAD}
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
        </label>
        {fileError && <p className="text-sm text-destructive md:col-span-2">{fileError}</p>}
        {!valid && (
          <p className="text-sm text-destructive md:col-span-2">
            {t('Введіть додатні розміри та коректну кількість вирізів.')}
          </p>
        )}
      </form>
      <aside className="flex min-h-80 flex-col justify-between rounded-xl bg-primary p-8 text-primary-foreground md:p-10">
        <div>
          <p className="eyebrow opacity-55">{t('Орієнтовна вартість')}</p>
          <p className="mt-6 text-5xl font-semibold">
            {estimate ? `${t('від')} ${estimate.toLocaleString('uk-UA')} ${t('грн')}` : t('Вкажіть розміри')}
          </p>
          <p className="mt-3 text-sm opacity-60">
            {t(product)} · {t(tier.toLowerCase())}
          </p>
        </div>
        <div>
          <p className="mb-5 text-sm opacity-60">
            {t('Орієнтовно. Точна ціна — після заміру й погодження сляба.')}
          </p>
          <button
            disabled={!estimate}
            onClick={() => setHandoff(true)}
            className="w-full rounded-md bg-background p-4 text-sm font-semibold text-foreground disabled:opacity-50"
          >
            {t('Надіслати конфігурацію')}
          </button>
        </div>
      </aside>
    </div>
  )
}
function MaterialSelect({
  product,
  value,
  set,
  collections,
}: {
  product: string
  value: string
  set: (v: string) => void
  collections: Collection[]
}) {
  const { t, locale } = useStoneT()
  const available = collections.filter((item) => !(product === 'Стільниця' && item.exteriorOnly))
  const families = Array.from(new Set(available.map((item) => item.family)))
  return (
    <label className="flex flex-col gap-2 text-sm">
      {t('Матеріал')}
      <select className={field} value={value} onChange={(event) => set(event.target.value)}>
        {families.map((family) => (
          <optgroup key={family} label={t(family)}>
            {available
              .filter((item) => item.family === family)
              .map((item) => (
                <option key={item.slug} value={item.slug}>
                  {collectionName(locale, item.name)}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
    </label>
  )
}
function Select({
  label,
  value,
  set,
  options,
}: {
  label: string
  value: string
  set: (v: string) => void
  options: string[]
}) {
  const { t } = useStoneT()
  return (
    <label className="flex flex-col gap-2 text-sm">
      {label}
      <select className={field} value={value} onChange={(e) => set(e.target.value)}>
        {options.map((x) => (
          <option key={x} value={x}>
            {t(x)}
          </option>
        ))}
      </select>
    </label>
  )
}
function NumberField({
  label,
  value,
  set,
  min = 1,
}: {
  label: string
  value: string
  set: (v: string) => void
  min?: number
}) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      {label}
      <input
        className={field}
        type="number"
        min={min}
        inputMode="numeric"
        value={value}
        onChange={(e) => set(e.target.value)}
      />
    </label>
  )
}

const ROLES = ['Архітектор', 'Дизайнер', 'Кухонна студія', 'Забудовник', 'Фабрикатор']

export function InquiryForm({
  trade = false,
  initialMessage = '',
  attachment = null,
  proposals = [],
}: {
  trade?: boolean
  initialMessage?: string
  /** Файл із калькулятора; йде в Telegram разом із заявкою. */
  attachment?: File | null
  /** Проєктні пропозиції для підстановки з /kontakty?proposal=<slug>. */
  proposals?: Pick<Project, 'slug' | 'name' | 'type' | 'material'>[]
}) {
  const { t } = useStoneT()
  const [status, setStatus] = useState<'idle' | 'pending' | 'sent' | 'error'>('idle')
  const [feedback, setFeedback] = useState('')
  const [role, setRole] = useState(ROLES[0])
  const [interest, setInterest] = useState('')
  const [message, setMessage] = useState(initialMessage)

  // /kontakty?proposal=<slug> зі сторінки проєкту: підставляємо назву пропозиції,
  // щоб менеджер бачив, про що мова. Читаємо після монтування, без useSearchParams,
  // щоб сторінка лишалась статичною.
  useEffect(() => {
    if (initialMessage) return
    const slug = new URLSearchParams(window.location.search).get('proposal')
    const project = slug ? proposals.find((p) => p.slug === slug) : null
    if (!project) return
    setInterest(project.type)
    setMessage(`Хочу обговорити пропозицію «${project.name}» (${project.material}).`)
  }, [initialMessage, proposals])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('pending')
    const body = new FormData(event.currentTarget)
    if (attachment) body.set('file', attachment, attachment.name)
    // Рекламні мітки першого візиту (lib/attribution.ts); порожньо для прямого трафіку.
    const attribution = readAttribution()
    if (attribution) body.set('attribution', JSON.stringify(attribution))
    const response = await fetch('/api/lead', { method: 'POST', body }).catch(() => null)
    const result = response ? await response.json().catch(() => ({})) : {}
    if (response?.ok) {
      setStatus('sent')
      setFeedback(t('Дякуємо. Ми отримали запит і зв’яжемося з вами.'))
    } else {
      setStatus('error')
      setFeedback(
        result.error || t('Не вдалося надіслати запит. Зателефонуйте нам або спробуйте ще раз.')
      )
    }
  }
  if (status === 'sent')
    return (
      <div
        className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-xl bg-card p-10 text-center"
        aria-live="polite"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check />
        </span>
        <h3 className="text-3xl font-semibold">{t('Запит надіслано')}</h3>
        <p className="max-w-md text-sm text-muted-foreground">{feedback}</p>
      </div>
    )
  return (
    <form
      id="forma"
      action="/api/lead"
      method="post"
      onSubmit={submit}
      className="grid gap-4 rounded-xl bg-card p-6 md:grid-cols-2 md:p-10"
    >
      {trade && (
        <>
          <Select label={t('Ваша роль')} value={role} set={setRole} options={ROLES} />
          <input type="hidden" name="role" value={role} />
        </>
      )}
      <label className="sr-only">
        {t('Не заповнюйте це поле')}
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        {t('Ім’я')}
        <input name="name" required minLength={2} className={field} placeholder={t('Ваше ім’я')} />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        {t('Телефон')}
        <input
          name="phone"
          required
          minLength={5}
          inputMode="tel"
          autoComplete="tel"
          className={field}
          placeholder="+380"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        {t('Місто')}
        <input
          name="city"
          autoComplete="address-level2"
          className={field}
          placeholder={t('Ваше місто')}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        {t('Виріб')}
        <input
          name="interest"
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
          className={field}
          placeholder={t('Стільниця, сходи…')}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm md:col-span-2">
        {t('Коротко про запит')}
        <textarea
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={1200}
          className="min-h-32 rounded-md border bg-background p-4 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder={t('Опишіть виріб, матеріал або проєкт')}
        />
      </label>
      {attachment && (
        <p className="text-sm text-muted-foreground md:col-span-2">
          {t('Вкладення:')} <span className="font-semibold">{attachment.name}</span>
        </p>
      )}
      <button
        disabled={status === 'pending'}
        className="h-12 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground disabled:opacity-60 md:col-span-2"
      >
        {status === 'pending' ? t('Надсилаємо…') : t('Надіслати')}
      </button>
      <p className="text-xs leading-5 text-muted-foreground md:col-span-2">
        {t('Ми не передаємо ваші дані третім особам. Натискаючи «Надіслати», ви погоджуєтесь з')}{' '}
        <Link href="/konfidentsiinist" className="underline">
          {t('Політикою конфіденційності')}
        </Link>
        .
      </p>
      <p aria-live="polite" className="text-sm text-destructive md:col-span-2">
        {status === 'error' ? feedback : ''}
      </p>
    </form>
  )
}

export function MaterialCatalog({ collections }: { collections: Collection[] }) {
  const { t, locale } = useStoneT()
  const [family, setFamily] = useState('Усі'),
    [origin, setOrigin] = useState('Усі'),
    [tone, setTone] = useState('Усі'),
    [application, setApplication] = useState('Усі'),
    [finish, setFinish] = useState('Усі')
  const options = (values: string[]) => ['Усі', ...Array.from(new Set(values))]
  // Походження зводимо до країни: «Житомирська область, Україна» і
  // «Покостівське родовище, Україна» — одна опція «Україна», а не тридцять.
  const country = (c: Collection) => (/Украї/.test(c.origin) ? 'Україна' : c.origin)
  // Українські родовища завжди попереду імпорту: сайт показує насамперед те,
  // що є на українському ринку, а не найдовший список порід.
  const ordered = [...collections].sort(
    (a, b) => Number(country(b) === 'Україна') - Number(country(a) === 'Україна')
  )
  const shown = ordered.filter(
    (c) =>
      (family === 'Усі' || c.family === family) &&
      (origin === 'Усі' || country(c) === origin) &&
      (tone === 'Усі' || c.tone === tone) &&
      (application === 'Усі' || c.applications.includes(application)) &&
      (finish === 'Усі' || c.finishes.includes(finish))
  )
  const reset = () => {
    setFamily('Усі')
    setOrigin('Усі')
    setTone('Усі')
    setApplication('Усі')
    setFinish('Усі')
  }
  return (
    <>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <Filter
          label={t('Родина')}
          value={family}
          set={setFamily}
          options={options(collections.map((c) => c.family))}
        />
        <Filter
          label={t('Походження')}
          value={origin}
          set={setOrigin}
          options={options(ordered.map(country))}
        />
        <Filter
          label={t('Колір')}
          value={tone}
          set={setTone}
          options={options(collections.map((c) => c.tone))}
        />
        <Filter
          label={t('Застосування')}
          value={application}
          set={setApplication}
          options={options(collections.flatMap((c) => c.applications))}
        />
        <Filter
          label={t('Фініш')}
          value={finish}
          set={setFinish}
          options={options(collections.flatMap((c) => c.finishes))}
        />
        <button
          type="button"
          onClick={reset}
          className="h-12 self-end rounded-md border px-4 text-sm"
        >
          {t('Скинути')}
        </button>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">{t('Знайдено матеріалів:')} {shown.length}</p>
      <div className="grid gap-px overflow-hidden rounded-xl bg-border md:grid-cols-2 lg:grid-cols-4">
        {shown.map((c) => (
          <Link
            href={`/arkhitekturnyi-kamin/materialy/${c.slug}`}
            key={c.slug}
            className="group flex flex-col overflow-hidden bg-card hover:bg-secondary"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={c.image}
                alt={`${t('Текстура')} ${collectionName(locale, c.name)}`}
                fill
                sizes="(max-width:768px) 100vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
              />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <p className="text-xs text-muted-foreground">
                {t(c.family)} · {t(c.tone)}
              </p>
              <h3 className="mt-4 text-2xl font-semibold">{collectionName(locale, c.name)}</h3>
              <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{collectionSummary(locale, c)}</p>
              <p className="mt-auto pt-5 text-sm font-semibold">{stonePrice(locale, c.price)}</p>
            </div>
          </Link>
        ))}
      </div>
      {!shown.length && (
        <p className="rounded-xl border p-8 text-center text-muted-foreground">
          {t('За цими параметрами матеріалів не знайдено.')}
        </p>
      )}
    </>
  )
}

export function ProposalCatalog({ projects }: { projects: Project[] }) {
  const { t, locale } = useStoneT()
  const [type, setType] = useState('Усі'),
    [material, setMaterial] = useState('Усі')
  const types = ['Усі', ...Array.from(new Set(projects.map((p) => p.type)))],
    mats = ['Усі', ...Array.from(new Set(projects.map((p) => p.material)))]
  const shown = projects.filter(
    (p) => (type === 'Усі' || p.type === type) && (material === 'Усі' || p.material === material)
  )
  return (
    <>
      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        <Filter label={t('Тип простору')} value={type} set={setType} options={types} />
        <Filter label={t('Матеріал')} value={material} set={setMaterial} options={mats} />
      </div>
      <p className="mb-6 text-sm text-muted-foreground">{t('Знайдено пропозицій:')} {shown.length}</p>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => (
          <Link
            href={`/arkhitekturnyi-kamin/proekty/${p.slug}`}
            key={p.slug}
            className="group overflow-hidden rounded-xl bg-card"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={p.image}
                alt={p.alt}
                fill
                sizes="(max-width:768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
              />
              <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur">
                {t('Візуалізація')}
              </span>
            </div>
            <div className="p-6">
              <p className="eyebrow text-muted-foreground">
                {t(p.type)} · {t('приклад застосування:')} {t(p.location)}
              </p>
              <h2 className="mt-4 text-2xl font-semibold">{t(p.name)}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{collectionName(locale, p.material)}</p>
              <p className="mt-4 text-xs leading-5 text-muted-foreground">
                {t("Приклад дизайну (візуалізація, створена за допомогою ШІ). Прив'язка до міста наведена як приклад стилю; це не фотографія виконаного проєкту.")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}

export function Inventory({ slabs }: { slabs: Slab[] }) {
  const { t, locale } = useStoneT()
  const [material, setMaterial] = useState('Усі'),
    [tone, setTone] = useState('Усі'),
    [thickness, setThickness] = useState('Усі'),
    [status, setStatus] = useState('Усі'),
    [selected, setSelected] = useState<Slab | null>(null)
  const filtered = useMemo(
    () =>
      slabs.filter(
        (s) =>
          (material === 'Усі' || s.material === material) &&
          (tone === 'Усі' || s.tone === tone) &&
          (thickness === 'Усі' || String(s.thickness) === thickness) &&
          (status === 'Усі' || s.status === status)
      ),
    [material, tone, thickness, status]
  )
  const reset = () => {
    setMaterial('Усі')
    setTone('Усі')
    setThickness('Усі')
    setStatus('Усі')
  }
  return (
    <>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Filter
          label={t('Матеріал')}
          value={material}
          set={setMaterial}
          options={['Усі', ...materials.map((m) => m.slug)]}
        />
        <Filter
          label={t('Колір')}
          value={tone}
          set={setTone}
          options={['Усі', ...Array.from(new Set(slabs.map((s) => s.tone)))]}
        />
        <Filter
          label={t('Товщина')}
          value={thickness}
          set={setThickness}
          options={['Усі', '12', '20', '30']}
        />
        <Filter
          label={t('Статус')}
          value={status}
          set={setStatus}
          options={['Усі', 'В наявності', 'Резерв', 'Під замовлення']}
        />
        <button onClick={reset} className="h-12 rounded-md border px-4 text-sm">
          {t('Скинути фільтри')}
        </button>
      </div>
      {filtered.length ? (
        <div className="grid gap-5 md:grid-cols-3">
          {filtered.map((s) => (
            <article key={s.id} className="overflow-hidden rounded-xl bg-card">
              <div className="relative aspect-[4/3]">
                <Image
                  src={s.image}
                  alt={s.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <div className="flex justify-between gap-3">
                  <p className="eyebrow text-muted-foreground">{s.id}</p>
                  <span className="rounded-full bg-secondary px-3 py-1 text-[10px]">
                    {t(s.status)}
                  </span>
                </div>
                <h2 className="mt-5 text-2xl font-semibold">{collectionName(locale, s.collection)}</h2>
                <p className="mt-2 text-xs text-muted-foreground">
                  {s.dimensions[0]} × {s.dimensions[1]} {t('см')} · {s.thickness} {t('мм')} · {t(s.finish)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t('Партія')} {s.lot} · {t('Походження:')} {t(s.origin)} · {t('Кількість:')} {s.quantity}
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {s.price
                    ? `${t('від')} ${s.price.toLocaleString('uk-UA')} ${s.origin === 'Україна' ? t('грн') : '€'}`
                    : t('Ціна за запитом')}
                </p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{t(s.uniqueness)}</p>
                <button
                  onClick={() => setSelected(s)}
                  className="mt-6 w-full rounded-md border p-3 text-sm"
                >
                  {t('Зарезервувати цей сляб')}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border p-10 text-center text-muted-foreground">
          {t('Слябів за обраними параметрами не знайдено. Скиньте фільтри або змініть критерії.')}
        </p>
      )}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-primary/60 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={`${t('Запит про')} ${selected.id}`}
        >
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl bg-background p-4">
            <button
              onClick={() => setSelected(null)}
              className="absolute right-5 top-5 z-10 rounded-full bg-secondary p-2"
              aria-label={t('Закрити')}
            >
              <X />
            </button>
            <InquiryForm
              initialMessage={`Запит про сляб ${selected.id}: ${selected.collection}, ${selected.dimensions[0]} × ${selected.dimensions[1]} см, ${selected.thickness} мм, ${selected.finish}, статус: ${selected.status}.`}
            />
          </div>
        </div>
      )}
    </>
  )
}
function Filter({
  label,
  value,
  set,
  options,
}: {
  label: string
  value: string
  set: (v: string) => void
  options: string[]
}) {
  const { t, locale } = useStoneT()
  const slugName: Record<string, string> = { granit: 'Граніт', marmur: 'Мармур', kvarcyt: 'Кварцит', kvarc: 'Кварц', keramohranit: 'Керамограніт' }
  // Назви колекцій у фільтрі пропозицій не мають словникового перекладу — транслітеруємо.
  const label_ = (x: string) => {
    const hit = t(slugName[x] ?? x)
    return hit === x ? collectionName(locale, x) : hit
  }
  return (
    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
      {label}
      <select className={field} value={value} onChange={(e) => set(e.target.value)}>
        {options.map((x) => (
          <option key={x} value={x}>
            {label_(x)}
          </option>
        ))}
      </select>
    </label>
  )
}
