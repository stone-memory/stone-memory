import { NextResponse } from 'next/server'
import { sanitizeAttribution } from '@/lib/attribution'
import { getClientIp, rateLimit } from '@/lib/rate-limit'
import { createLeadOrder } from '@/lib/crm/lead-intake'
import { getIntegrationConfig } from '@/lib/integrations/config'
import { sendOne, type EmailAttachment } from '@/lib/email'
import { storeLeadAttachments } from '@/lib/crm/lead-attachments'

/**
 * Точка входу заявок із форм сайту, які не проходять через кошик каталогу:
 *   - розділ «Архітектурний камінь» (source=stilnytsi, InquiryForm);
 *   - модалка «Отримати розрахунок» на інфосторінках, у каталозі й на
 *     головній (source=consult, components/consult-modal.tsx).
 *
 * Три незалежні доставки, паралельно:
 *   1. CRM — прямий запис у `orders` (lib/crm/lead-intake.ts). Тригер у базі
 *      створює клієнта й угоду: source=stilnytsi → «Інтерʼєр», інакше «Меморіал».
 *      Вкладення зберігаються в приватному бакеті й прив'язуються до угоди
 *      (lib/crm/lead-attachments.ts), щоб фото було видно в адмінці.
 *   2. Telegram — швидка нотифікація людині; вкладення йдуть документами.
 *   3. Пошта майстерні — лист із тими самими вкладеннями, щоб фото ділянки
 *      лишались у скриньці поруч із перепискою.
 *
 * Заявка вважається доставленою, якщо прийняв хоча б один канал: падіння
 * одного не має губити лід. Усі виклики йдуть із сервера, тому CSP браузера
 * (connect-src) на них не поширюється.
 */

export const runtime = 'nodejs'

/** Vercel обмежує тіло запиту ~4,5 МБ; клієнт стискає фото до цього ліміту. */
const MAX_FILE_BYTES = 4 * 1024 * 1024
const MAX_TOTAL_BYTES = 4 * 1024 * 1024
const MAX_FILES = 5
const ALLOWED_FILE = /^(image\/|application\/pdf$)/

const SOURCES = new Set(['stilnytsi', 'consult'])
const CHANNEL_LABELS: Record<string, string> = {
  phone: 'Дзвінок',
  viber: 'Viber',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  email: 'Email',
}
const ADMIN_EMAIL = process.env.EMAIL_REPLY_TO || 'info@stonememory.com.ua'

const text = (value: FormDataEntryValue | null, max = 500) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

type Lead = {
  source: 'stilnytsi' | 'consult'
  name: string
  phone: string
  email: string
  city: string
  interest: string
  role: string
  message: string
  /** Блок сайту, з якого відкрили форму («Не знайшли свою модель?»). */
  topic: string
  /** Як клієнт просить зв'язатись; порожньо для старої форми стільниць. */
  channel: string
  files: File[]
  utm: ReturnType<typeof sanitizeAttribution>
}

function headline(lead: Lead): string {
  return lead.source === 'stilnytsi' ? 'Новий запит Stone Memory (стільниці)' : 'Новий запит з сайту Stone Memory'
}

function filesLine(lead: Lead, where: string): string {
  if (!lead.files.length) return ''
  const names = lead.files.map((f) => `${f.name} (${Math.round(f.size / 1024)} КБ)`).join(', ')
  return `Файли: ${names} — ${where}`
}

/** Текст для людини: усе, для чого в orders нема окремого поля. */
function composeMessage(lead: Lead) {
  return [
    lead.topic ? `Звідки: ${lead.topic}` : '',
    lead.channel ? `Зв'язок: ${CHANNEL_LABELS[lead.channel] ?? lead.channel}${lead.channel === 'email' && lead.email ? ` (${lead.email})` : ''}` : '',
    lead.role ? `Роль: ${lead.role}` : '',
    lead.message,
    filesLine(lead, 'у картці заявки, в Telegram і на пошті'),
  ]
    .filter(Boolean)
    .join('\n\n')
}

async function sendToCrm(lead: Lead): Promise<boolean | null> {
  const result = await createLeadOrder({
    name: lead.name,
    phone: lead.phone,
    email: lead.email || null,
    city: lead.city,
    interest: lead.interest,
    message: composeMessage(lead),
    source: lead.source,
    locale: 'uk',
    attribution: lead.utm,
  })
  if (!result.ok) throw new Error(`CRM intake: ${result.error}`)
  // Заявка вже в CRM — проблема з файлами не має її «провалити».
  if (result.id && lead.files.length) {
    await storeLeadAttachments({ orderId: result.id, customerName: lead.name, files: lead.files }).catch((e) =>
      console.error('[lead] attachments not stored:', e)
    )
  }
  return true
}

function summaryLines(lead: Lead): string[] {
  return [
    `Ім’я: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    lead.email ? `Email: ${lead.email}` : '',
    lead.channel ? `Зв'язок: ${CHANNEL_LABELS[lead.channel] ?? lead.channel}` : '',
    lead.city ? `Місто: ${lead.city}` : '',
    lead.interest ? `Виріб: ${lead.interest}` : '',
    lead.role ? `Роль: ${lead.role}` : '',
    lead.topic ? `Звідки: ${lead.topic}` : '',
    `Повідомлення: ${lead.message || '—'}`,
    lead.utm?.utm_source ? `Джерело: ${lead.utm.utm_source}` : '',
  ].filter(Boolean)
}

async function sendToTelegram(lead: Lead): Promise<boolean | null> {
  // Той самий бот, що й у CRM (DB-конфіг з /admin/integrations має пріоритет
  // над env); TELEGRAM_CHAT_ID лишається як застаріла назва змінної.
  const cfg = await getIntegrationConfig('telegram')
  const token = cfg.bot_token
  const chatId = cfg.admin_chat_id || process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return null

  const body = [headline(lead), ...summaryLines(lead)].join('\n')
  const api = (method: string) => `https://api.telegram.org/bot${token}/${method}`

  // Один файл — документ із підписом (ліміт підпису 1024 символи), як і раніше.
  // Кілька — спершу текст, потім кожен файл окремо, щоб жоден не загубився.
  if (lead.files.length === 1) {
    const form = new FormData()
    form.set('chat_id', chatId)
    form.set('caption', body.slice(0, 1024))
    form.set('document', lead.files[0], lead.files[0].name)
    const response = await fetch(api('sendDocument'), { method: 'POST', body: form, signal: AbortSignal.timeout(15000) })
    if (!response.ok) throw new Error(`Telegram sendDocument ${response.status}`)
    return true
  }

  const response = await fetch(api('sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: body }),
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error(`Telegram ${response.status}`)

  for (const [i, file] of lead.files.entries()) {
    const form = new FormData()
    form.set('chat_id', chatId)
    form.set('caption', `${lead.name} · файл ${i + 1} з ${lead.files.length}`)
    form.set('document', file, file.name)
    const r = await fetch(api('sendDocument'), { method: 'POST', body: form, signal: AbortSignal.timeout(15000) })
    if (!r.ok) console.error(`[lead] telegram sendDocument ${i + 1}/${lead.files.length} failed: ${r.status}`)
  }
  return true
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

async function sendToEmail(lead: Lead): Promise<boolean | null> {
  const attachments: EmailAttachment[] = []
  for (const file of lead.files) {
    attachments.push({ filename: file.name, content: Buffer.from(await file.arrayBuffer()) })
  }
  const rows = summaryLines(lead)
    .map((line) => {
      const [label, ...rest] = line.split(': ')
      return `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td><td style="padding:4px 0;white-space:pre-wrap">${escapeHtml(rest.join(': '))}</td></tr>`
    })
    .join('')
  const html = `
    <h1 style="font-size:22px;margin:0 0 12px">${escapeHtml(headline(lead))}</h1>
    <table style="border-collapse:collapse;font-size:15px">${rows}</table>
    ${attachments.length ? `<p style="margin-top:16px;color:#6b7280">Вкладення: ${attachments.length}</p>` : ''}
  `
  const result = await sendOne({
    to: ADMIN_EMAIL,
    subject: `Заявка з сайту — ${lead.name}${lead.topic ? ` · ${lead.topic}` : ''}`,
    html,
    scope: 'transactional',
    attachments,
  })
  if (!result.ok) {
    if (result.error === 'RESEND_API_KEY not set') return null
    throw new Error(`Email: ${result.error}`)
  }
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

  const files = form.getAll('file').filter((f): f is File => f instanceof File && f.size > 0)
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `Можна прикріпити до ${MAX_FILES} файлів.` }, { status: 400 })
  }
  const totalBytes = files.reduce((sum, f) => sum + f.size, 0)
  if (
    totalBytes > MAX_TOTAL_BYTES ||
    files.some((f) => f.size > MAX_FILE_BYTES || !ALLOWED_FILE.test(f.type))
  ) {
    return NextResponse.json({ error: 'Вкладення мають бути фото або PDF, разом до 4 МБ.' }, { status: 400 })
  }

  const rawSource = text(form.get('source'), 40)
  const rawChannel = text(form.get('contact_channel'), 20)
  const lead: Lead = {
    source: SOURCES.has(rawSource) ? (rawSource as Lead['source']) : 'stilnytsi',
    name: text(form.get('name'), 80),
    phone: text(form.get('phone'), 80),
    email: text(form.get('email'), 120),
    city: text(form.get('city'), 80),
    interest: text(form.get('interest'), 120),
    role: text(form.get('role'), 60),
    message: text(form.get('message'), 1200),
    topic: text(form.get('topic'), 120),
    channel: rawChannel in CHANNEL_LABELS ? rawChannel : '',
    files,
    utm: parseUtm(form.get('attribution')),
  }
  if (lead.name.length < 2 || lead.phone.length < 5) {
    return NextResponse.json({ error: 'Перевірте ім’я та контактний номер.' }, { status: 400 })
  }
  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return NextResponse.json({ error: 'Перевірте email.' }, { status: 400 })
  }
  if (lead.channel === 'email' && !lead.email) {
    return NextResponse.json({ error: 'Вкажіть email, щоб ми могли відповісти.' }, { status: 400 })
  }

  const results = await Promise.allSettled([sendToCrm(lead), sendToTelegram(lead), sendToEmail(lead)])
  const labels = ['crm', 'telegram', 'email']
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
