/**
 * PDF-шаблони для CRM. Використовуємо React Email компоненти + конвертуємо
 * у HTML, який вшиваємо в Supabase Storage. Для повного PDF (printable) —
 * можна додати puppeteer або @react-pdf/renderer (heavyweight).
 *
 * Зараз повертаємо HTML — Supabase Storage віддає його як html, браузер
 * друкує в PDF через "Print → Save as PDF". Це 80% рішення без додаткових
 * залежностей.
 *
 * Для production-grade PDF (поліграфічна якість, шрифти, печатки) —
 * рекомендую @react-pdf/renderer (~3MB bundle, але працює без headless Chrome).
 */

import type { Customer, Deal, DealItem, Payment } from "@/lib/crm/types"

// =====================================================
// Загальні стилі (inline для друкабельності)
// =====================================================
const css = `
@page { size: A4; margin: 18mm 15mm; }
* { box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #111; line-height: 1.5; margin: 0; }
.container { max-width: 720px; margin: 0 auto; padding: 24px; }
header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 16px; margin-bottom: 24px; }
.brand { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
.meta { text-align: right; font-size: 12px; color: #555; }
h1 { font-size: 24px; margin: 0 0 4px; }
h2 { font-size: 16px; margin: 24px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #e5e7eb; }
.row { display: grid; grid-template-columns: 180px 1fr; gap: 8px 12px; margin: 4px 0; font-size: 14px; }
.row dt { color: #6b7280; }
.row dd { margin: 0; font-weight: 500; }
table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
th, td { padding: 8px 6px; text-align: left; border-bottom: 1px solid #e5e7eb; }
th { background: #f5f5f5; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
.right { text-align: right; }
.total { font-weight: 700; font-size: 16px; padding-top: 12px; border-top: 2px solid #111; }
.footer { margin-top: 48px; font-size: 11px; color: #6b7280; }
.footer .signs { display: flex; justify-content: space-between; margin-top: 60px; }
.sign { width: 40%; border-top: 1px solid #111; padding-top: 4px; font-size: 11px; }
.notice { background: #fef3c7; padding: 8px 12px; border-radius: 6px; font-size: 12px; margin: 12px 0; }
@media print { body { background: white; } }
`

const COMPANY_INFO = {
  legalName: "ФОП «Stone Memory»",
  address: "Костопіль, Рівненська обл., Україна",
  email: "info@stonememory.com.ua",
  phone: "+380 (68) 808 02 22",
  iban: "(введіть IBAN у Бізнес-профіль)",
  vatId: "(введіть ІПН/VAT у Бізнес-профіль)",
}

function fmtEUR(eur: number): string {
  return `€${eur.toLocaleString("uk-UA")}`
}

function fmtUAH(eur: number): string {
  const uah = eur * 45 // FX за замовчуванням; підтягни з business-profile коли буде /api/fx
  return `${Math.round(uah / 10) * 10} ₴`
}

function fmtDate(d: string | Date): string {
  return new Date(d).toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" })
}

// =====================================================
// QUOTE — комерційна пропозиція (необов'язкова до підпису)
// =====================================================
export function renderQuoteHTML(args: {
  deal: Deal
  customer: Customer
  items: DealItem[]
  number?: string
}): string {
  const { deal, customer, items, number } = args
  const total = items.reduce((s, i) => s + (Number(i.total_eur) || 0), 0) || Number(deal.amount_eur) || 0
  const docNumber = number || `КП-${deal.reference || deal.id.slice(0, 8)}`

  const itemsRows = items.length
    ? items
        .map(
          (it, i) =>
            `<tr><td>${i + 1}</td><td>${esc(it.title)}</td><td class="right">${it.qty}</td><td class="right">${fmtEUR(Number(it.unit_price_eur) || 0)}</td><td class="right">${fmtEUR(Number(it.total_eur) || 0)}</td></tr>`
        )
        .join("")
    : `<tr><td colspan="5" style="color:#9ca3af; font-style: italic; padding: 16px;">Позиції додаються після узгодження ескізу.</td></tr>`

  return `<!doctype html>
<html lang="uk">
<head>
  <meta charset="utf-8" />
  <title>${esc(docNumber)}</title>
  <style>${css}</style>
</head>
<body>
<div class="container">
  <header>
    <div>
      <div class="brand">Stone Memory</div>
      <div style="font-size:12px;color:#6b7280;margin-top:4px">Натуральний камінь · виробництво в Костополі</div>
    </div>
    <div class="meta">
      <div><b>${esc(docNumber)}</b></div>
      <div>${fmtDate(new Date())}</div>
    </div>
  </header>

  <h1>Комерційна пропозиція</h1>
  <p style="color:#555">Ця пропозиція дійсна 14 днів від дати створення.</p>

  <h2>Замовник</h2>
  <dl class="row">
    <dt>Ім'я</dt><dd>${esc(customer.name)}</dd>
    <dt>Телефон</dt><dd>${esc(customer.phone)}</dd>
    ${customer.email ? `<dt>Email</dt><dd>${esc(customer.email)}</dd>` : ""}
    ${customer.city ? `<dt>Місто</dt><dd>${esc(customer.city)}</dd>` : ""}
  </dl>

  ${
    deal.description
      ? `<h2>Технічне завдання</h2><p>${esc(deal.description)}</p>`
      : ""
  }

  <h2>Позиції</h2>
  <table>
    <thead>
      <tr><th style="width:40px">#</th><th>Назва</th><th class="right" style="width:60px">К-сть</th><th class="right" style="width:100px">Ціна</th><th class="right" style="width:120px">Сума</th></tr>
    </thead>
    <tbody>${itemsRows}</tbody>
    <tfoot>
      <tr><td colspan="4" class="right total">Разом, EUR</td><td class="right total">${fmtEUR(total)}</td></tr>
      <tr><td colspan="4" class="right" style="color:#6b7280;font-size:12px">Орієнтовно у грн</td><td class="right" style="color:#6b7280;font-size:12px">${fmtUAH(total)}</td></tr>
    </tfoot>
  </table>

  <div class="notice">
    <b>Що включено:</b> матеріал з документом походження, виготовлення у власному цеху, гравіювання, монтаж, гарантія 5 років. Не включено: благоустрій ділянки, тимчасові огорожі.
  </div>

  <div class="footer">
    <div><b>${esc(COMPANY_INFO.legalName)}</b> · ${esc(COMPANY_INFO.address)}</div>
    <div>${esc(COMPANY_INFO.email)} · ${esc(COMPANY_INFO.phone)}</div>
    <div class="signs">
      <div class="sign">Замовник: ${esc(customer.name)}</div>
      <div class="sign">Виконавець: Stone Memory</div>
    </div>
  </div>
</div>
</body>
</html>`
}

// =====================================================
// CONTRACT — договір
// =====================================================
export function renderContractHTML(args: {
  deal: Deal
  customer: Customer
  items: DealItem[]
  number?: string
  depositPercent?: number
}): string {
  const { deal, customer, items, number, depositPercent = 30 } = args
  const total = items.reduce((s, i) => s + (Number(i.total_eur) || 0), 0) || Number(deal.amount_eur) || 0
  const deposit = Math.round(total * (depositPercent / 100))
  const balance = total - deposit
  const docNumber = number || `ДОГ-${deal.reference || deal.id.slice(0, 8)}`

  const itemsRows = items.length
    ? items
        .map(
          (it, i) =>
            `<tr><td>${i + 1}</td><td>${esc(it.title)}</td><td class="right">${it.qty}</td><td class="right">${fmtEUR(Number(it.total_eur) || 0)}</td></tr>`
        )
        .join("")
    : `<tr><td colspan="4" style="color:#9ca3af;">Позиції узгоджуються окремою специфікацією.</td></tr>`

  return `<!doctype html>
<html lang="uk">
<head><meta charset="utf-8"/><title>${esc(docNumber)}</title><style>${css}</style></head>
<body>
<div class="container">
  <header>
    <div>
      <div class="brand">Stone Memory</div>
      <div style="font-size:12px;color:#6b7280;margin-top:4px">Договір про виготовлення і встановлення</div>
    </div>
    <div class="meta">
      <div><b>${esc(docNumber)}</b></div>
      <div>${fmtDate(new Date())}</div>
    </div>
  </header>

  <h1>Договір ${esc(docNumber)}</h1>
  <p style="color:#555">м. Костопіль, ${fmtDate(new Date())}</p>

  <h2>Сторони</h2>
  <dl class="row">
    <dt>Виконавець</dt><dd>${esc(COMPANY_INFO.legalName)}, ${esc(COMPANY_INFO.address)}</dd>
    <dt>Замовник</dt><dd>${esc(customer.name)}, ${esc(customer.phone)}${customer.email ? ", " + esc(customer.email) : ""}</dd>
  </dl>

  <h2>1. Предмет договору</h2>
  <p>Виконавець зобов'язується виготовити та встановити вироби з натурального каменю згідно зі специфікацією (п.2), а Замовник — прийняти і оплатити роботу.</p>

  <h2>2. Специфікація</h2>
  <table>
    <thead><tr><th style="width:40px">#</th><th>Найменування</th><th class="right" style="width:60px">К-сть</th><th class="right" style="width:140px">Сума, EUR</th></tr></thead>
    <tbody>${itemsRows}</tbody>
    <tfoot>
      <tr><td colspan="3" class="right total">Загальна сума</td><td class="right total">${fmtEUR(total)}</td></tr>
    </tfoot>
  </table>

  <h2>3. Порядок розрахунків</h2>
  <ol style="font-size:14px;line-height:1.7">
    <li>Передоплата ${depositPercent}% — <b>${fmtEUR(deposit)}</b> — впродовж 3 робочих днів від підписання.</li>
    <li>Доплата ${100 - depositPercent}% — <b>${fmtEUR(balance)}</b> — після прийняття готового виробу і перед монтажем.</li>
    <li>Оплата може бути здійснена готівкою, на картку або банківським переказом на рахунок Виконавця.</li>
  </ol>

  <h2>4. Терміни</h2>
  <p>Виготовлення — до 8 тижнів від отримання передоплати і узгодженого ескізу. Монтаж — до 2 тижнів від готовності. Загалом орієнтовно до ${esc(deal.expected_install || "10 тижнів")}.</p>

  <h2>5. Гарантія</h2>
  <p>Виконавець надає <b>5 років гарантії</b> на матеріал, виготовлення, монтаж і фундамент. Гарантія не покриває механічні пошкодження третіми особами, стихійні лиха, недбале поводження.</p>

  <h2>6. Інше</h2>
  <p>Сторони вирішують спори шляхом переговорів. Договір складено у 2-х примірниках, по одному для кожної сторони.</p>

  <div class="footer">
    <div><b>${esc(COMPANY_INFO.legalName)}</b> · ${esc(COMPANY_INFO.address)} · ${esc(COMPANY_INFO.phone)}</div>
    <div>IBAN: ${esc(COMPANY_INFO.iban)} · ${esc(COMPANY_INFO.vatId)}</div>
    <div class="signs">
      <div class="sign">Замовник: ${esc(customer.name)}<br/>Підпис: _________________</div>
      <div class="sign">Виконавець:<br/>Підпис: _________________ М.П.</div>
    </div>
  </div>
</div>
</body>
</html>`
}

// =====================================================
// INVOICE — рахунок-фактура
// =====================================================
export function renderInvoiceHTML(args: {
  deal: Deal
  customer: Customer
  items: DealItem[]
  payments?: Payment[]
  number?: string
}): string {
  const { deal, customer, items, payments = [], number } = args
  const total = items.reduce((s, i) => s + (Number(i.total_eur) || 0), 0) || Number(deal.amount_eur) || 0
  const paid = payments.reduce((s, p) => (p.kind === "refund" ? s - Number(p.amount_eur) : s + Number(p.amount_eur)), 0)
  const due = total - paid
  const docNumber = number || `РФ-${deal.reference || deal.id.slice(0, 8)}-${new Date().getFullYear()}`

  const itemsRows = items.length
    ? items
        .map(
          (it, i) =>
            `<tr><td>${i + 1}</td><td>${esc(it.title)}</td><td class="right">${it.qty}</td><td class="right">${fmtEUR(Number(it.unit_price_eur) || 0)}</td><td class="right">${fmtEUR(Number(it.total_eur) || 0)}</td></tr>`
        )
        .join("")
    : `<tr><td colspan="5" style="color:#9ca3af;">Без позицій</td></tr>`

  return `<!doctype html>
<html lang="uk">
<head><meta charset="utf-8"/><title>${esc(docNumber)}</title><style>${css}</style></head>
<body>
<div class="container">
  <header>
    <div>
      <div class="brand">Stone Memory · Рахунок</div>
      <div style="font-size:12px;color:#6b7280;margin-top:4px">${esc(COMPANY_INFO.legalName)}</div>
    </div>
    <div class="meta">
      <div><b>${esc(docNumber)}</b></div>
      <div>${fmtDate(new Date())}</div>
    </div>
  </header>

  <h1>Рахунок-фактура</h1>

  <h2>Постачальник</h2>
  <dl class="row">
    <dt>Назва</dt><dd>${esc(COMPANY_INFO.legalName)}</dd>
    <dt>Адреса</dt><dd>${esc(COMPANY_INFO.address)}</dd>
    <dt>IBAN</dt><dd>${esc(COMPANY_INFO.iban)}</dd>
    <dt>ІПН / VAT</dt><dd>${esc(COMPANY_INFO.vatId)}</dd>
  </dl>

  <h2>Покупець</h2>
  <dl class="row">
    <dt>Ім'я</dt><dd>${esc(customer.name)}</dd>
    <dt>Телефон</dt><dd>${esc(customer.phone)}</dd>
    ${customer.email ? `<dt>Email</dt><dd>${esc(customer.email)}</dd>` : ""}
  </dl>

  <h2>Позиції</h2>
  <table>
    <thead><tr><th style="width:40px">#</th><th>Найменування</th><th class="right" style="width:60px">К-сть</th><th class="right" style="width:100px">Ціна</th><th class="right" style="width:120px">Сума</th></tr></thead>
    <tbody>${itemsRows}</tbody>
    <tfoot>
      <tr><td colspan="4" class="right">Разом</td><td class="right">${fmtEUR(total)}</td></tr>
      <tr><td colspan="4" class="right">Сплачено</td><td class="right">${fmtEUR(paid)}</td></tr>
      <tr><td colspan="4" class="right total">До сплати</td><td class="right total">${fmtEUR(due)}</td></tr>
    </tfoot>
  </table>

  <div class="notice">
    Будь ласка, при оплаті вказуйте номер ${esc(docNumber)} у призначенні платежу.
  </div>

  <div class="footer">
    <div>${esc(COMPANY_INFO.email)} · ${esc(COMPANY_INFO.phone)}</div>
    <div style="margin-top:8px">Документ створено в Stone Memory CRM · ${fmtDate(new Date())}</div>
  </div>
</div>
</body>
</html>`
}

// =====================================================
// Утиліти
// =====================================================
function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
