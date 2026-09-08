'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { Collection } from '@/lib/stone/cms-types'
export function StoneCompareTable() {
  const rows = [
    ['Походження', 'Природна порода', 'Інженерна поверхня', 'Спечена кераміка'],
    ['Тепло', 'Висока стійкість', 'Потрібна підставка', 'Висока стійкість'],
    ['Догляд', 'Перевірка просочення', 'Непористий', 'Непористий'],
    ['Рисунок', 'Кожен сляб унікальний', 'Стабільний декор', 'Повторюваний декор'],
    ['Зовні', 'Залежить від породи', 'Залежить від бренду', 'Підходить'],
  ]
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="min-w-[720px] w-full text-left text-sm">
        <thead className="sticky top-0 bg-primary text-primary-foreground">
          <tr>
            {['Критерій', 'Граніт', 'Кварц', 'Керамограніт'].map((x) => (
              <th className="p-4" key={x}>
                {x}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, index) => (
                <td
                  className={`border-t p-4 ${index ? 'text-muted-foreground' : 'font-semibold'}`}
                  key={cell}
                >
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
export function FinishSlider() {
  const [position, setPosition] = useState(50)
  return (
    <figure>
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
        <Image
          src="/materials/grey-ukraine.webp"
          alt="Полірований фініш сірого граніту"
          fill
          sizes="(max-width:1280px) 100vw, 1180px"
          className="object-cover"
        />
        {/* Верхній шар обрізається clip-path, а не вкладеною шириною від 100vw:
            обидва зображення однакового масштабу, роздільник збігається на будь-якому екрані. */}
        <Image
          src="/materials/kometa-black.webp"
          alt="Матований фініш темного граніту"
          fill
          sizes="(max-width:1280px) 100vw, 1180px"
          className="object-cover"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        />
        <span className="absolute inset-y-0 w-0.5 bg-background" style={{ left: `${position}%` }} />
      </div>
      <label className="mt-4 flex flex-col gap-2 text-sm font-semibold">
        Порівняти полірований і матований фініш
        <input
          aria-label="Положення розділювача фінішів"
          type="range"
          min="5"
          max="95"
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
        />
      </label>
    </figure>
  )
}
type Option = { label: string; match: (c: Collection) => boolean }
const has = (text: string, ...parts: string[]) => parts.some((p) => text.toLowerCase().includes(p))

/**
 * Кожен варіант відповіді — предикат по реальних полях колекції. Раніше
 * варіанти порівнювались із полями як рядки, і 9 із 16 не збігались ні з
 * чим, тож shortlist майже не залежав від відповідей.
 */
const questions: { label: string; options: Option[] }[] = [
  {
    label: 'Де використовуватимете камінь?',
    options: [
      { label: 'Стільниця на кухні', match: (c) => c.applications.includes('стільниці') },
      { label: 'Ванна кімната', match: (c) => c.applications.includes('ванна') },
      {
        label: 'Сходи або підлога',
        match: (c) => has(c.applications.join(' '), 'сходи', 'підлога'),
      },
      {
        label: 'Фасад або тераса',
        match: (c) => has(c.applications.join(' '), 'фасад', 'бруківка', 'облицювання'),
      },
    ],
  },
  {
    label: 'Який тон потрібен?',
    options: [
      { label: 'Світлий', match: (c) => has(c.tone, 'біл', 'світл', 'крем', 'беж') },
      { label: 'Темний', match: (c) => has(c.tone, 'чорн', 'темн', 'графіт') },
      {
        label: 'Теплий',
        match: (c) => has(c.tone, 'беж', 'крем', 'корич', 'золот', 'рож', 'червон', 'іржав'),
      },
      { label: 'Сірий, нейтральний', match: (c) => has(c.tone, 'сір', 'бетон', 'цемент') },
    ],
  },
  {
    label: 'Що важливіше?',
    options: [
      {
        label: 'Простий догляд',
        match: (c) => c.family === 'Кварц' || c.family === 'Керамограніт',
      },
      {
        label: 'Природний рисунок',
        match: (c) => ['Граніт', 'Мармур', 'Кварцит', 'Лабрадорит'].includes(c.family),
      },
      { label: 'Тонкий профіль', match: (c) => c.thicknesses.some((t) => t <= 12) },
      {
        label: 'Термостійкість',
        match: (c) => ['Граніт', 'Кварцит', 'Керамограніт'].includes(c.family),
      },
    ],
  },
  {
    label: 'Який фініш подобається?',
    options: [
      { label: 'Полірований', match: (c) => c.finishes.includes('полірований') },
      { label: 'Матовий', match: (c) => c.finishes.includes('матовий') },
      { label: 'Шліфований', match: (c) => c.finishes.includes('шліфований') },
      { label: 'Не має значення', match: () => true },
    ],
  },
]
export function StoneQuiz({ collections }: { collections: Collection[] }) {
  const [step, setStep] = useState(0),
    [answers, setAnswers] = useState<Option[]>([])
  const results = useMemo(
    () =>
      collections
        .map((item) => ({
          ...item,
          score: answers.reduce((score, answer) => score + (answer.match(item) ? 1 : 0), 0),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3),
    [answers, collections]
  )
  if (step === questions.length)
    return (
      <div className="rounded-xl bg-card p-7">
        <p className="eyebrow text-accent">Ваш shortlist</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {results.map((item) => (
            <Link
              className="rounded-lg border p-4"
              href={`/arkhitekturnyi-kamin/materialy/${item.slug}`}
              key={item.slug}
            >
              <strong>{item.name}</strong>
              <p className="mt-2 text-sm text-muted-foreground">
                {item.family} · {item.tone}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Збігається з {item.score} із {answers.length} відповідей
              </p>
            </Link>
          ))}
        </div>
        <button
          className="mt-6 text-sm underline"
          onClick={() => {
            setStep(0)
            setAnswers([])
          }}
        >
          Пройти ще раз
        </button>
      </div>
    )
  const q = questions[step]
  return (
    <div className="rounded-xl border p-7">
      <p className="eyebrow text-muted-foreground">Крок {step + 1} із 4</p>
      <h2 className="mt-4 text-2xl font-semibold">{q.label}</h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {q.options.map((option) => (
          <button
            className="rounded-lg border p-4 text-left hover:bg-secondary"
            key={option.label}
            onClick={() => {
              setAnswers([...answers, option])
              setStep(step + 1)
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
export function PavingCalc() {
  const [area, setArea] = useState(20),
    [waste, setWaste] = useState(7)
  const total = area * (1 + waste / 100)
  return (
    <div className="grid gap-6 rounded-xl bg-card p-7 sm:grid-cols-2">
      <label className="flex flex-col gap-2 text-sm">
        Площа, м²
        <input
          className="h-12 rounded-md border bg-background px-4"
          min="1"
          type="number"
          value={area}
          onChange={(e) => setArea(Math.max(0, Number(e.target.value)))}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        Запас, %
        <input
          className="h-12 rounded-md border bg-background px-4"
          min="0"
          max="30"
          type="number"
          value={waste}
          onChange={(e) => setWaste(Math.max(0, Number(e.target.value)))}
        />
      </label>
      <div className="sm:col-span-2">
        <p className="text-3xl font-semibold">
          {total.toLocaleString('uk-UA', { maximumFractionDigits: 1 })} м²
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Орієнтовна площа замовлення з урахуванням запасу. Кількість палет буде доступна після
          підтвердження норми пакування.
        </p>
      </div>
    </div>
  )
}
