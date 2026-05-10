import { NextResponse } from "next/server"
import { requireSuperAdmin } from "@/lib/auth/permissions"

export const dynamic = "force-dynamic"

/**
 * Повертає статус кожної інтеграції — на основі ENV змінних що задані.
 * Це read-only ендпоінт, не зберігає секрети у відповіді — лише boolean чи задано.
 *
 * Доступ — лише super_admin (Fix 6). Канальні інтеграції — критична
 * частина воронки: якщо менеджер випадково побачить токени або зможе
 * відключити канал, вся комунікація з клієнтами зупиниться. Тому
 * налаштовує тільки власник.
 */
export async function GET(req: Request) {
  const unauth = await requireSuperAdmin(req)
  if (unauth instanceof NextResponse) return unauth

  const e = process.env

  return NextResponse.json({
    integrations: [
      {
        id: "site_chat",
        name: "Сайт-чат",
        configured: true, // завжди працює
        webhookUrl: null,
        envVars: [],
        canSend: true,
        canReceive: true,
      },
      {
        id: "telegram",
        name: "Telegram",
        configured: Boolean(e.TELEGRAM_BOT_TOKEN && e.TELEGRAM_ADMIN_CHAT_ID),
        webhookUrl: "/api/telegram",
        envVars: [
          { key: "TELEGRAM_BOT_TOKEN", set: Boolean(e.TELEGRAM_BOT_TOKEN) },
          { key: "TELEGRAM_ADMIN_CHAT_ID", set: Boolean(e.TELEGRAM_ADMIN_CHAT_ID) },
          { key: "TELEGRAM_WEBHOOK_SECRET", set: Boolean(e.TELEGRAM_WEBHOOK_SECRET) },
        ],
        canSend: Boolean(e.TELEGRAM_BOT_TOKEN),
        canReceive: Boolean(e.TELEGRAM_BOT_TOKEN && e.TELEGRAM_WEBHOOK_SECRET),
      },
      {
        id: "whatsapp",
        name: "WhatsApp",
        configured: Boolean(e.WHATSAPP_TOKEN && e.WHATSAPP_PHONE_NUMBER_ID),
        webhookUrl: "/api/whatsapp/webhook",
        envVars: [
          { key: "WHATSAPP_TOKEN", set: Boolean(e.WHATSAPP_TOKEN) },
          { key: "WHATSAPP_PHONE_NUMBER_ID", set: Boolean(e.WHATSAPP_PHONE_NUMBER_ID) },
          { key: "WHATSAPP_VERIFY_TOKEN", set: Boolean(e.WHATSAPP_VERIFY_TOKEN) },
        ],
        canSend: Boolean(e.WHATSAPP_TOKEN && e.WHATSAPP_PHONE_NUMBER_ID),
        canReceive: Boolean(e.WHATSAPP_VERIFY_TOKEN),
      },
      {
        id: "instagram",
        name: "Instagram",
        configured: Boolean(e.INSTAGRAM_PAGE_ACCESS_TOKEN && e.INSTAGRAM_PAGE_ID),
        webhookUrl: "/api/instagram/webhook",
        envVars: [
          { key: "INSTAGRAM_PAGE_ACCESS_TOKEN", set: Boolean(e.INSTAGRAM_PAGE_ACCESS_TOKEN) },
          { key: "INSTAGRAM_PAGE_ID", set: Boolean(e.INSTAGRAM_PAGE_ID) },
          { key: "INSTAGRAM_VERIFY_TOKEN", set: Boolean(e.INSTAGRAM_VERIFY_TOKEN) },
        ],
        canSend: Boolean(e.INSTAGRAM_PAGE_ACCESS_TOKEN && e.INSTAGRAM_PAGE_ID),
        canReceive: Boolean(e.INSTAGRAM_VERIFY_TOKEN),
      },
      {
        id: "email",
        name: "Email",
        configured: Boolean(e.RESEND_API_KEY),
        webhookUrl: "/api/email/inbound",
        envVars: [
          { key: "RESEND_API_KEY", set: Boolean(e.RESEND_API_KEY) },
          { key: "EMAIL_FROM", set: Boolean(e.EMAIL_FROM) },
          { key: "INBOUND_EMAIL_SECRET", set: Boolean(e.INBOUND_EMAIL_SECRET) },
        ],
        canSend: Boolean(e.RESEND_API_KEY),
        canReceive: true, // webhook працює завжди — Mailgun/Postmark постять у нього
      },
      {
        id: "sms",
        name: "SMS (Twilio)",
        configured: Boolean(e.TWILIO_ACCOUNT_SID && e.TWILIO_AUTH_TOKEN && e.TWILIO_FROM_NUMBER),
        webhookUrl: "/api/sms/inbound",
        envVars: [
          { key: "TWILIO_ACCOUNT_SID", set: Boolean(e.TWILIO_ACCOUNT_SID) },
          { key: "TWILIO_AUTH_TOKEN", set: Boolean(e.TWILIO_AUTH_TOKEN) },
          { key: "TWILIO_FROM_NUMBER", set: Boolean(e.TWILIO_FROM_NUMBER) },
        ],
        canSend: Boolean(e.TWILIO_ACCOUNT_SID && e.TWILIO_AUTH_TOKEN && e.TWILIO_FROM_NUMBER),
        canReceive: Boolean(e.TWILIO_ACCOUNT_SID),
      },
    ],
  })
}
