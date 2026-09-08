import { NextResponse } from 'next/server'
import { sanitizeAttribution } from '@/lib/attribution'
import { getClientIp, rateLimit } from '@/lib/rate-limit'
import { createLeadOrder } from '@/lib/crm/lead-intake'

/**
 * Точка входу заявок із форм розділу «Архітектурний камінь».
 *
 * Дві незалежні доставки, паралельно:
 *   1. CRM — прямий запис у `orders` (lib/crm/lead-intake.ts). Заявка
 *      зʼявляється на дашборді й у воронці «Угоди» з категорією «Інтерʼєр».
 *   2. Telegram — швидка нотифікація людині. Якщо є вкладення (фото або PDF
 *      з калькулятора), воно йде сюди документом; у CRM лише згадка про нього.
 *
 * Заявка вважається доставленою, якщо прийняв хоча б один канал: падіння
 * Telegram не має губити лід, і навпаки. Обидва виклики йдуть із сервера,
 * тому CSP браузера (connect-src) на них не поширюється.
 */

export const runtime = 'nodejs'

const MAX_FILE_BYTES = 4 * 1024 * 1024
const ALLOWED_FILE = /^(image\/|application\/pdf$)/

const text = (value: FormDataEntryValue | null, max = 500) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

type Lead = {
  name: string
  phone: string
  city: string
  interest: string
  role: string
  message: string
  file: File | null
  utm: ReturnType<typeof sanitizeAttribution>
}

/** Текст для людини: роль і файл згадуються там, де їх нема окремим полем. */
function composeMessage(lead: Lead, { mentionFile }: { mentionFile: boolean }) {
  return [
    lead.role ? `Роль: ${lead.role}` : '',
    lead.message,
    mentionFile && lead.file
      ? `Файл: ${lead.file.name} (${Math.round(lead.file.size / 1024)} КБ), надіслано в Telegram`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n')
}

async function sendToCrm(lead: Lead): Promise<boolean | null> {
  const result = await createLeadOrder({
    name: lead.name,
    phone: lead.phone,
    city: lead.city,
    interest: lead.interest,
    message: composeMessage(lead, { mentionFile: true }),
    source: 'stilnytsi',
    locale: 'uk',
    attribution: lead.utm,
  })
  if (!result.ok) throw new Error(`CRM intake: ${result.error}`)
  return true
}

async function sendToTelegram(lead: Lead): Promise<boolean | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  // Той самий бот, що й у CRM: приймаємо обидва імені змінної, щоб не
  // заводити дубль у налаштуваннях проєкту.
  const chatId = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID
  if (!token || !chatId) return null
  const body = [
    'Новий запит Stone Memory (стільниці)',
    `Ім’я: ${lead.name}`,
    `Контакт: ${lead.phone}`,
    `Місто: ${lead.city || '—'}`,
    `Виріб: ${lead.interest || '—'}`,
    lead.role ? `Роль: ${lead.role}` : '',
    `Повідомлення: ${lead.message || '—'}`,
    lead.utm?.utm_source ? `Джерело: ${lead.utm.utm_source}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  // З файлом — sendDocument з підписом (ліміт підпису 1024 символи, наш текст коротший).
  if (lead.file) {
    const form = new FormData()
    form.set('chat_id', chatId)
    form.set('caption', body.slice(0, 1024))
    form.set('document', lead.file, lead.file.name)
    const response = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) throw new Error(`Telegram sendDocument ${response.status}`)
    return true
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: body }),
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error(`Telegram ${response.status}`)
  return true
}

export async function POST(request: Request) {
  if (!rateLimit(`lead:${getClientIp(request)}`, 5, 60_000).allowed) {
    return NextResponse.json(
      { error: 'Забагато запитів. Спробуйте за хвилину або зателефонуйте.' },
      { status: 429 }
    )
  }

  const form = await request.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Некоректний запит.' }, { status: 400 })
  if (text(form.get('website'))) return NextResponse.json({ ok: true }) // honeypot

  const rawFile = form.get('file')
  const file = rawFile instanceof File && rawFile.size > 0 ? rawFile : null
  if (file && (file.size > MAX_FILE_BYTES || !ALLOWED_FILE.test(file.type))) {
    return NextResponse.json({ error: 'Вкладення має бути фото або PDF до 4 МБ.' }, { status: 400 })
  }

  const lead: Lead = {
    name: text(form.get('name'), 80),
    phone: text(form.get('phone'), 80),
    city: text(form.get('city'), 80),
    interest: text(form.get('interest'), 120),
    role: text(form.get('role'), 60),
    message: text(form.get('message'), 1200),
    file,
    utm: parseUtm(form.get('attribution')),
  }
  if (lead.name.length < 2 || lead.phone.length < 5) {
    return NextResponse.json({ error: 'Перевірте ім’я та контактний номер.' }, { status: 400 })
  }

  const results = await Promise.allSettled([sendToCrm(lead), sendToTelegram(lead)])
  const labels = ['crm', 'telegram']
  let delivered = false
  let configured = false
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      if (result.value === null) return
      configured = true
      delivered = true
    } else {
      configured = true
      console.error(`[lead] ${labels[i]} failed:`, result.reason)
    }
  })

  if (!configured) {
    return NextResponse.json(
      { error: 'Канал надсилання ще не підключений. Зателефонуйте нам.' },
      { status: 503 }
    )
  }
  if (!delivered) {
    return NextResponse.json(
      { error: 'Не вдалося надіслати запит. Спробуйте ще раз або зателефонуйте.' },
      { status: 502 }
    )
  }
  return NextResponse.json({ ok: true })
}

function parseUtm(raw: FormDataEntryValue | null) {
  if (typeof raw !== 'string' || !raw) return null
  try {
    return sanitizeAttribution(JSON.parse(raw))
  } catch {
    return null
  }
}
