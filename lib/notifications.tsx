import "server-only"
import * as React from "react"
import { sendOne, SITE_URL } from "@/lib/email"
import { sendTelegram, tgEscape } from "@/lib/telegram"
import { OrderReceived } from "@/lib/email-templates/order-received"
import { OrderStatusUpdate, type OrderStatus } from "@/lib/email-templates/order-status"
import { AdminOrderAlert } from "@/lib/email-templates/admin-order-alert"
import type { Locale } from "@/lib/email-templates/styles"

type OrderItemSummary = { id: string; priceFrom?: number; material?: string; [key: string]: unknown }

type OrderSummary = {
  id: string
  name: string
  phone: string
  email?: string | null
  message?: string | null
  locale?: string | null
  reference?: string | null
  items?: OrderItemSummary[] | null
  created_at?: string
  status?: string | null
}

const ADMIN_EMAIL = process.env.EMAIL_REPLY_TO || "sttonememory@gmail.com"

function normalizeLocale(raw?: string | null): Locale {
  if (raw === "uk" || raw === "en" || raw === "pl" || raw === "de" || raw === "lt") return raw
  return "uk"
}

function mapItems(items?: OrderItemSummary[] | null): OrderItemSummary[] {
  return (items || []).map((i) => ({
    id: String(i.id ?? "—"),
    priceFrom: typeof i.priceFrom === "number" ? i.priceFrom : undefined,
    material: typeof i.material === "string" ? i.material : undefined,
  }))
}

// Admin: email + Telegram on new order.
export async function notifyAdminNewOrder(order: OrderSummary): Promise<void> {
  const items = mapItems(order.items)

  const adminReact = (
    <AdminOrderAlert
      customerName={order.name}
      phone={order.phone}
      email={order.email}
      reference={order.reference}
      items={items}
      message={order.message}
      siteUrl={SITE_URL}
    />
  )
  const adminSubject = `Нове замовлення — ${order.name}${order.reference ? ` · ${order.reference}` : ""}`

  const tgText = [
    "<b>🆕 Нове замовлення</b>",
    "",
    `<b>Ім'я:</b> ${tgEscape(order.name)}`,
    `<b>Телефон:</b> ${tgEscape(order.phone)}`,
    order.email ? `<b>Email:</b> ${tgEscape(order.email)}` : "",
    order.reference ? `<b>Реф:</b> ${tgEscape(order.reference)}` : "",
    "",
    items.length ? "<b>Позиції:</b>" : "",
    ...items.map((i) => `• № ${tgEscape(i.id)}${typeof i.priceFrom === "number" ? ` — від €${i.priceFrom}` : ""}`),
    order.message ? `\n<b>Повідомлення:</b>\n${tgEscape(order.message)}` : "",
  ]
    .filter(Boolean)
    .join("\n")

  await Promise.all([
    sendOne({
      to: ADMIN_EMAIL,
      subject: adminSubject,
      react: adminReact,
      scope: "transactional",
    }),
    sendTelegram({ text: tgText }),
  ])
}

// Customer: confirmation after submitting an order.
export async function sendCustomerConfirmation(order: OrderSummary): Promise<void> {
  if (!order.email) return
  const locale = normalizeLocale(order.locale)

  await sendOne({
    to: order.email,
    subject: subjectFor("confirmation", locale, order.reference),
    react: (
      <OrderReceived
        customerName={order.name}
        reference={order.reference}
        items={mapItems(order.items)}
        locale={locale}
        siteUrl={SITE_URL}
      />
    ),
    scope: "transactional",
  })
}

// Customer: notification when admin changes order status.
export async function notifyCustomerStatusChange(
  order: OrderSummary,
  newStatus: OrderStatus
): Promise<void> {
  if (!order.email) return
  const locale = normalizeLocale(order.locale)

  await sendOne({
    to: order.email,
    subject: subjectFor(newStatus, locale, order.reference),
    react: (
      <OrderStatusUpdate
        customerName={order.name}
        reference={order.reference}
        status={newStatus}
        locale={locale}
        siteUrl={SITE_URL}
      />
    ),
    scope: "transactional",
  })
}

// Subjects per locale.
function subjectFor(
  kind: "confirmation" | "in_progress" | "completed",
  locale: Locale,
  ref?: string | null
): string {
  const refSuffix = ref ? ` · ${ref}` : ""
  const tbl: Record<Locale, Record<typeof kind, string>> = {
    uk: {
      confirmation: "Ваш запит отримано",
      in_progress: "Ваше замовлення в роботі",
      completed: "Ваше замовлення готове",
    },
    en: {
      confirmation: "We received your enquiry",
      in_progress: "Your order is in progress",
      completed: "Your order is complete",
    },
    pl: {
      confirmation: "Otrzymaliśmy zapytanie",
      in_progress: "Zamówienie w realizacji",
      completed: "Zamówienie gotowe",
    },
    de: {
      confirmation: "Anfrage erhalten",
      in_progress: "Bestellung in Bearbeitung",
      completed: "Bestellung abgeschlossen",
    },
    lt: {
      confirmation: "Gavome užklausą",
      in_progress: "Užsakymas vykdomas",
      completed: "Užsakymas baigtas",
    },
  }
  return `${tbl[locale][kind]}${refSuffix}`
}
