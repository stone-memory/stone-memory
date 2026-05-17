import "server-only"
import { sendOne } from "@/lib/email"
import { sendTelegram } from "@/lib/telegram"
import { recordOutgoing, getCustomerChannels } from "@/lib/crm/comms"
import { getIntegrationConfig } from "@/lib/integrations/config"
import type { CommChannel } from "@/lib/crm/types"

/**
 * Outbound router. Один API для відправки повідомлень у будь-який канал.
 *
 *   await sendToChannel({ customerId, channel: 'whatsapp', body: 'Привіт!' })
 *
 * Маршрутизація:
 *   - email          → Resend (lib/email.ts)
 *   - telegram       → sendTelegram (lib/telegram.ts) на admin chat або direct PM
 *   - whatsapp       → Meta Cloud API
 *   - instagram      → Meta Graph API
 *   - sms            → Twilio
 *   - site_chat      → запис у chat_messages (як operator)
 *   - manual / phone → лише запис у communications (вже сталося офлайн)
 *
 * Кожен successful send автоматично пише запис у communications.
 */

export type SendArgs = {
  customerId: string
  dealId?: string | null
  channel: CommChannel
  body: string
  subject?: string
  actorId?: string | null
}

export type SendResult = {
  ok: boolean
  channel: CommChannel
  messageId?: string
  error?: string
  /** ID запису в communications */
  communicationId?: number
}

export async function sendToChannel(args: SendArgs): Promise<SendResult> {
  const channels = await getCustomerChannels(args.customerId)

  switch (args.channel) {
    case "email":
      return sendEmail(args, channels.email)
    case "telegram":
      return sendTg(args, channels.telegramUserId)
    case "whatsapp":
      return sendWhatsApp(args, channels.phone)
    case "instagram":
      return sendInstagram(args, channels.instagramPsid)
    case "viber":
      return sendViber(args, channels.viberUserId)
    case "sms":
      return sendSms(args, channels.phone)
    case "site_chat":
      return sendSiteChat(args)
    case "phone":
    case "manual":
    default:
      // Просто записуємо як вихідне (операція вже сталася офлайн)
      const id = await recordOutgoing({
        customerId: args.customerId,
        dealId: args.dealId,
        channel: args.channel,
        body: args.body,
        subject: args.subject,
        actorId: args.actorId,
      })
      return { ok: true, channel: args.channel, communicationId: id }
  }
}

// ====================================================
// Email (Resend)
// ====================================================
async function sendEmail(args: SendArgs, email?: string): Promise<SendResult> {
  if (!email) return { ok: false, channel: "email", error: "У клієнта немає email" }

  const subject = args.subject || "Повідомлення від Stone Memory"
  const html = `<p>${escapeHtml(args.body).replace(/\n/g, "<br>")}</p>`

  // Same thread_key shape as inbound email (app/api/email/inbound &
  // app/api/cron/email-poll) so the reply groups with the conversation:
  //   email:<lowercase-address>:<subject sans re/fw, ≤60 chars>
  const cleanSubject = (args.subject || "").replace(/^(re|fw|fwd):\s*/gi, "").trim()
  const threadKey = `email:${email.toLowerCase()}:${cleanSubject.slice(0, 60)}`

  // Send via Resend (domain stonememory.com.ua is verified there, so the
  // From can be info@stonememory.com.ua without a domain mailbox/SMTP).
  // The Gmail mailbox (EMAIL_MAILBOX_*) is used ONLY for IMAP inbound —
  // we deliberately do NOT send through Gmail SMTP (that would send as
  // the gmail login, not info@, and there is no domain SMTP server).
  const sent = await sendOne({ to: email, subject, html, scope: "individual" })
  if (!sent.ok) return { ok: false, channel: "email", error: sent.error }
  const messageId = sent.id

  const commId = await recordOutgoing({
    customerId: args.customerId,
    dealId: args.dealId,
    channel: "email",
    body: args.body,
    subject: args.subject,
    actorId: args.actorId,
    externalId: messageId,
    threadKey,
  })
  return { ok: true, channel: "email", messageId, communicationId: commId }
}

// ====================================================
// Telegram (через бота — тільки якщо клієнт сам перший написав)
// ====================================================
async function sendTg(args: SendArgs, telegramUserId?: string): Promise<SendResult> {
  if (!telegramUserId) {
    return {
      ok: false,
      channel: "telegram",
      error: "Клієнт ще не писав у наш Telegram-бот. Telegram дозволяє писати першими лише після того як юзер натиснув /start.",
    }
  }
  const r = await sendTelegram({ chatId: telegramUserId, text: args.body })
  if (!r.ok) return { ok: false, channel: "telegram", error: r.error }

  const commId = await recordOutgoing({
    customerId: args.customerId,
    dealId: args.dealId,
    channel: "telegram",
    body: args.body,
    actorId: args.actorId,
    threadKey: `telegram:${telegramUserId}`,
  })
  return { ok: true, channel: "telegram", communicationId: commId }
}

// ====================================================
// WhatsApp (Meta Cloud API)
// Документація: https://developers.facebook.com/docs/whatsapp/cloud-api/
// ====================================================
async function sendWhatsApp(args: SendArgs, phone?: string): Promise<SendResult> {
  const cfg = await getIntegrationConfig("whatsapp")
  const token = cfg.token
  const phoneNumberId = cfg.phone_number_id
  if (!token || !phoneNumberId) {
    return { ok: false, channel: "whatsapp", error: "WhatsApp не налаштовано (WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID)" }
  }
  if (!phone) return { ok: false, channel: "whatsapp", error: "У клієнта немає телефону" }

  // Нормалізуємо: WhatsApp очікує без + і пробілів
  const to = phone.replace(/\D/g, "")

  try {
    const r = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { body: args.body, preview_url: false },
      }),
    })
    const data = (await r.json()) as { messages?: Array<{ id: string }>; error?: { message?: string } }
    if (!r.ok || data.error) {
      return { ok: false, channel: "whatsapp", error: data.error?.message || `HTTP ${r.status}` }
    }
    const messageId = data.messages?.[0]?.id
    const commId = await recordOutgoing({
      customerId: args.customerId,
      dealId: args.dealId,
      channel: "whatsapp",
      body: args.body,
      actorId: args.actorId,
      externalId: messageId,
      threadKey: `whatsapp:${to}`,
    })
    return { ok: true, channel: "whatsapp", messageId, communicationId: commId }
  } catch (e) {
    return { ok: false, channel: "whatsapp", error: e instanceof Error ? e.message : "network error" }
  }
}

// ====================================================
// Instagram (Meta Graph API — Messaging)
// Документація: https://developers.facebook.com/docs/messenger-platform/instagram/
// ====================================================
async function sendInstagram(args: SendArgs, psid?: string): Promise<SendResult> {
  const cfg = await getIntegrationConfig("instagram")
  const token = cfg.page_access_token
  const pageId = cfg.page_id
  if (!token || !pageId) {
    return { ok: false, channel: "instagram", error: "Instagram не налаштовано (INSTAGRAM_PAGE_ACCESS_TOKEN, INSTAGRAM_PAGE_ID)" }
  }
  if (!psid) return { ok: false, channel: "instagram", error: "У клієнта немає Instagram PSID" }

  try {
    const r = await fetch(`https://graph.facebook.com/v21.0/${pageId}/messages?access_token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: psid },
        message: { text: args.body },
        messaging_type: "RESPONSE",
      }),
    })
    const data = (await r.json()) as { message_id?: string; error?: { message?: string } }
    if (!r.ok || data.error) {
      return { ok: false, channel: "instagram", error: data.error?.message || `HTTP ${r.status}` }
    }
    const commId = await recordOutgoing({
      customerId: args.customerId,
      dealId: args.dealId,
      channel: "instagram",
      body: args.body,
      actorId: args.actorId,
      externalId: data.message_id,
      threadKey: `instagram:${psid}`,
    })
    return { ok: true, channel: "instagram", messageId: data.message_id, communicationId: commId }
  } catch (e) {
    return { ok: false, channel: "instagram", error: e instanceof Error ? e.message : "network error" }
  }
}

// ====================================================
// SMS (Twilio)
// Документація: https://www.twilio.com/docs/sms/send-messages
// ====================================================
async function sendSms(args: SendArgs, phone?: string): Promise<SendResult> {
  const cfg = await getIntegrationConfig("twilio_sms")
  const sid = cfg.account_sid
  const token = cfg.auth_token
  const from = cfg.from_number
  if (!sid || !token || !from) {
    return { ok: false, channel: "sms", error: "Twilio не налаштовано (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER)" }
  }
  if (!phone) return { ok: false, channel: "sms", error: "У клієнта немає телефону" }

  try {
    const auth = Buffer.from(`${sid}:${token}`).toString("base64")
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: phone, From: from, Body: args.body }).toString(),
    })
    const data = (await r.json()) as { sid?: string; error_message?: string }
    if (!r.ok || data.error_message) {
      return { ok: false, channel: "sms", error: data.error_message || `HTTP ${r.status}` }
    }
    const commId = await recordOutgoing({
      customerId: args.customerId,
      dealId: args.dealId,
      channel: "sms",
      body: args.body,
      actorId: args.actorId,
      externalId: data.sid,
      threadKey: `sms:${phone.replace(/\D/g, "")}`,
    })
    return { ok: true, channel: "sms", messageId: data.sid, communicationId: commId }
  } catch (e) {
    return { ok: false, channel: "sms", error: e instanceof Error ? e.message : "network error" }
  }
}

// ====================================================
// Viber (REST Bot API)
// Документація: https://developers.viber.com/docs/api/rest-bot-api/
// ====================================================
async function sendViber(args: SendArgs, viberUserId?: string): Promise<SendResult> {
  const cfg = await getIntegrationConfig("viber")
  const token = cfg.auth_token
  if (!token) {
    return { ok: false, channel: "viber", error: "Viber не налаштовано (VIBER_AUTH_TOKEN)" }
  }
  if (!viberUserId) {
    return { ok: false, channel: "viber", error: "У клієнта немає Viber user_id" }
  }
  const senderName = cfg.sender_name || "Stone Memory"
  const senderAvatar = cfg.sender_avatar || undefined

  try {
    const r = await fetch("https://chatapi.viber.com/pa/send_message", {
      method: "POST",
      headers: {
        "X-Viber-Auth-Token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receiver: viberUserId,
        min_api_version: 1,
        sender: senderAvatar ? { name: senderName, avatar: senderAvatar } : { name: senderName },
        type: "text",
        text: args.body,
      }),
    })
    const data = (await r.json()) as { status: number; status_message?: string; message_token?: string | number }
    // Viber returns status:0 on success regardless of HTTP code
    if (!r.ok || data.status !== 0) {
      return {
        ok: false,
        channel: "viber",
        error: data.status_message || `HTTP ${r.status}`,
      }
    }
    const commId = await recordOutgoing({
      customerId: args.customerId,
      dealId: args.dealId,
      channel: "viber",
      body: args.body,
      actorId: args.actorId,
      externalId: data.message_token ? String(data.message_token) : undefined,
      threadKey: `viber:${viberUserId}`,
    })
    return { ok: true, channel: "viber", messageId: data.message_token ? String(data.message_token) : undefined, communicationId: commId }
  } catch (e) {
    return { ok: false, channel: "viber", error: e instanceof Error ? e.message : "network error" }
  }
}

// ====================================================
// Site chat — пишемо у chat_messages як operator
// (інтегрується зі старим site chat віджетом)
// ====================================================
async function sendSiteChat(args: SendArgs): Promise<SendResult> {
  // Site chat має sessionId. Якщо у customer.channels немає site_chat session_id —
  // то ми не знаємо куди писати. Тоді просто recordOutgoing і нехай покажеться у timeline.
  const { supabaseAdmin } = await import("@/lib/supabase/admin")

  const { data: customer } = await supabaseAdmin
    .from("customers")
    .select("channels")
    .eq("id", args.customerId)
    .single()

  const sessionId = (customer?.channels as Record<string, string> | null)?.site_chat_session_id

  if (sessionId) {
    // Записуємо в chat_messages — site chat віджет polls і покаже
    await supabaseAdmin.from("chat_messages").insert({
      session_id: sessionId,
      from_role: "operator",
      text: args.body,
    })
  }

  const commId = await recordOutgoing({
    customerId: args.customerId,
    dealId: args.dealId,
    channel: "site_chat",
    body: args.body,
    actorId: args.actorId,
    threadKey: sessionId ? `site_chat:${sessionId}` : null as unknown as undefined,
  })
  return { ok: true, channel: "site_chat", communicationId: commId }
}

// ====================================================
// Utils
// ====================================================
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")
}
