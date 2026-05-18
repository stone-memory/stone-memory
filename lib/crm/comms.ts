import "server-only"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { CommChannel, CommDirection } from "@/lib/crm/types"

/**
 * Універсальні helpers для всіх канальних інтеграцій.
 * Використовуються у /api/telegram, /api/whatsapp, /api/instagram, /api/email/inbound, /api/sms/inbound.
 *
 * Ключові обовʼязки:
 *   1. Знайти або створити customer на основі ідентифікатора з каналу (телефон/email/telegram_id)
 *   2. Записати communication (вхідне або вихідне)
 *   3. Опціонально привʼязати до останньої активної угоди клієнта
 *   4. Оновити customer.last_contact_at
 */

export type ChannelIdentifier = {
  /** Нормалізований телефон (без знаків) — для WhatsApp/SMS/phone */
  phone?: string
  /** Email — для email каналу */
  email?: string
  /** Telegram user_id — для Telegram */
  telegramUserId?: string
  /** Instagram PSID (page-scoped ID) */
  instagramPsid?: string
  /** Facebook PSID */
  facebookPsid?: string
  /** Viber user_id (стабільний 16-символьний ідентифікатор від платформи Viber) */
  viberUserId?: string
  /** Site chat session_id — щоб гостьові розмови без телефону теж потрапляли в Inbox */
  siteSessionId?: string
}

export type IncomingMessage = {
  channel: CommChannel
  identifier: ChannelIdentifier
  /** Імʼя клієнта (із профіля каналу) */
  name?: string
  /** Локаль клієнта */
  locale?: string
  /** Тема (для email) */
  subject?: string
  /** Тіло повідомлення */
  body: string
  /** ID повідомлення на платформі */
  externalId?: string
  /** Thread / conversation key — для групування */
  threadKey?: string
  /** Вкладення */
  attachments?: Array<{ name: string; url: string; mime: string; size: number }>
  /** Сирі дані з платформи (для дебагу) */
  rawMeta?: Record<string, unknown>
  /** Оригінальний час повідомлення (ISO) — напр. дата email-листа.
   *  Якщо не задано, БД ставить now(). */
  createdAt?: string
}

/**
 * Знайти існуючого клієнта по будь-якому ідентифікатору з каналу.
 * Якщо нема — створити з мінімальною інформацією.
 *
 * Стратегія пошуку (по пріоритету):
 *   1. По phone (нормалізований) — найнадійніше
 *   2. По email
 *   3. По channels->>telegram_user_id / instagram_psid / facebook_psid
 *   4. Не знайдено — створюємо нового з мінімальним contact info
 */
export async function findOrCreateCustomer(
  id: ChannelIdentifier,
  fallback: { name?: string; locale?: string } = {}
): Promise<{ id: string; created: boolean }> {
  // 1. По телефону
  if (id.phone) {
    const phoneNorm = id.phone.replace(/\D/g, "")
    if (phoneNorm.length >= 6) {
      const { data: existing } = await supabaseAdmin
        .from("customers")
        .select("id")
        .eq("phone_norm", phoneNorm)
        .maybeSingle()
      if (existing) return { id: existing.id, created: false }
    }
  }

  // 2. По email
  if (id.email) {
    const emailLower = id.email.toLowerCase()
    const { data: existing } = await supabaseAdmin
      .from("customers")
      .select("id")
      .ilike("email", emailLower)
      .maybeSingle()
    if (existing) return { id: existing.id, created: false }
  }

  // 3. По каналу
  const channelKeys = [
    ["telegram_user_id", id.telegramUserId],
    ["instagram_psid", id.instagramPsid],
    ["facebook_psid", id.facebookPsid],
    ["viber_user_id", id.viberUserId],
    ["site_chat_session_id", id.siteSessionId],
  ] as const

  for (const [key, value] of channelKeys) {
    if (!value) continue
    const { data: existing } = await supabaseAdmin
      .from("customers")
      .select("id")
      .filter(`channels->>${key}`, "eq", value)
      .maybeSingle()
    if (existing) return { id: existing.id, created: false }
  }

  // 4. Створюємо нового
  const channels: Record<string, string> = {}
  if (id.telegramUserId) channels.telegram_user_id = id.telegramUserId
  if (id.instagramPsid) channels.instagram_psid = id.instagramPsid
  if (id.facebookPsid) channels.facebook_psid = id.facebookPsid
  if (id.viberUserId) channels.viber_user_id = id.viberUserId
  if (id.siteSessionId) channels.site_chat_session_id = id.siteSessionId

  // Унікальний phone для тих хто без реального — щоб обійти UNIQUE index по phone_norm.
  // Використовуємо session_id або timestamp як суфікс.
  const phone = id.phone || (id.siteSessionId ? `guest-${id.siteSessionId.slice(0, 16)}` : `guest-${Date.now()}`)
  const phoneNorm = phone.replace(/\D/g, "")

  const { data: created, error } = await supabaseAdmin
    .from("customers")
    .insert({
      phone,
      name: fallback.name || (id.email ? id.email.split("@")[0] : "Гість"),
      email: id.email || null,
      locale: fallback.locale || "uk",
      source: "channel",
      channels,
    })
    .select("id")
    .single()

  if (error) {
    // Якщо вже існує по phone_norm унікальному index — спробуємо знайти повторно
    if (error.code === "23505" && phoneNorm.length >= 6) {
      const { data: again } = await supabaseAdmin
        .from("customers")
        .select("id")
        .eq("phone_norm", phoneNorm)
        .maybeSingle()
      if (again) return { id: again.id, created: false }
    }
    throw new Error(`findOrCreateCustomer: ${error.message}`)
  }

  return { id: created.id, created: true }
}

/**
 * Оновити канальні ID клієнта (наприклад, якщо ми вперше дізнались telegram_user_id).
 */
export async function updateCustomerChannelIds(
  customerId: string,
  patch: Partial<Record<keyof ChannelIdentifier, string>>
): Promise<void> {
  // Витягуємо поточні channels
  const { data: current } = await supabaseAdmin
    .from("customers")
    .select("channels")
    .eq("id", customerId)
    .single()
  if (!current) return

  const channels = (current.channels || {}) as Record<string, string>
  if (patch.telegramUserId) channels.telegram_user_id = patch.telegramUserId
  if (patch.instagramPsid) channels.instagram_psid = patch.instagramPsid
  if (patch.viberUserId) channels.viber_user_id = patch.viberUserId
  if (patch.facebookPsid) channels.facebook_psid = patch.facebookPsid
  if (patch.siteSessionId) channels.site_chat_session_id = patch.siteSessionId

  await supabaseAdmin
    .from("customers")
    .update({ channels, last_contact_at: new Date().toISOString() })
    .eq("id", customerId)
}

/**
 * Знайти останню активну угоду клієнта (не cancelled/lost/completed) для авто-привʼязки.
 */
export async function findActiveDealForCustomer(customerId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("deals")
    .select("id")
    .eq("customer_id", customerId)
    .not("status", "in", "(completed,cancelled,lost)")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  return data?.id || null
}

/**
 * Записати вхідне (inbound) повідомлення.
 * Усе разом: customer + communication + auto-link + last_contact update.
 */
export async function recordIncoming(msg: IncomingMessage): Promise<{
  customerId: string
  communicationId: number
  dealId: string | null
}> {
  const { id: customerId, created } = await findOrCreateCustomer(msg.identifier, {
    name: msg.name,
    locale: msg.locale,
  })

  if (!created) {
    // Update channel IDs if new ones arrived (Telegram, Instagram, etc.)
    await updateCustomerChannelIds(customerId, {
      telegramUserId: msg.identifier.telegramUserId,
      instagramPsid: msg.identifier.instagramPsid,
      facebookPsid: msg.identifier.facebookPsid,
    })

    // Upgrade guest placeholder phone → real phone when the chat user
    // provides it later (stage "need-phone"). The customer was initially
    // found by siteSessionId with a "guest-..." placeholder.
    if (msg.identifier.phone) {
      const { error: upErr } = await supabaseAdmin
        .from("customers")
        .update({
          phone: msg.identifier.phone,
          ...(msg.name ? { name: msg.name } : {}),
          last_contact_at: new Date().toISOString(),
        })
        .eq("id", customerId)
        .like("phone", "guest-%")
      if (upErr && upErr.code !== "23505") {
        // 23505 = unique_violation: another customer already has this phone; skip
        console.error("[comms] phone upgrade failed:", upErr.message)
      }
    } else {
      await supabaseAdmin
        .from("customers")
        .update({ last_contact_at: new Date().toISOString() })
        .eq("id", customerId)
    }
  } else {
    await supabaseAdmin
      .from("customers")
      .update({ last_contact_at: new Date().toISOString() })
      .eq("id", customerId)
  }

  const dealId = await findActiveDealForCustomer(customerId)

  const { data: comm, error } = await supabaseAdmin
    .from("communications")
    .insert({
      customer_id: customerId,
      deal_id: dealId,
      channel: msg.channel,
      direction: "inbound" as CommDirection,
      external_id: msg.externalId || null,
      thread_key: msg.threadKey || null,
      subject: msg.subject || null,
      body: msg.body,
      attachments: msg.attachments || null,
      meta: msg.rawMeta || null,
      // Preserve original timestamp (email Date) so the Inbox shows and
      // sorts by the real time, not the moment the poller ingested it.
      ...(msg.createdAt ? { created_at: msg.createdAt } : {}),
    })
    .select("id")
    .single()

  if (error) throw new Error(`recordIncoming: ${error.message}`)

  return {
    customerId,
    communicationId: comm.id,
    dealId,
  }
}

/**
 * Записати вихідне (outbound) повідомлення — після успішного відправлення на канал.
 */
export async function recordOutgoing(args: {
  customerId: string
  dealId?: string | null
  channel: CommChannel
  body: string
  subject?: string
  externalId?: string
  threadKey?: string
  actorId?: string | null
}): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from("communications")
    .insert({
      customer_id: args.customerId,
      deal_id: args.dealId || null,
      channel: args.channel,
      direction: "outbound" as CommDirection,
      external_id: args.externalId || null,
      thread_key: args.threadKey || null,
      subject: args.subject || null,
      body: args.body,
      actor_id: args.actorId || null,
      replied_at: new Date().toISOString(),
    })
    .select("id")
    .single()

  if (error) throw new Error(`recordOutgoing: ${error.message}`)
  return data.id
}

/**
 * Маркер: з якими каналами клієнт у нас пов'язаний.
 * Використовується UI щоб знати куди реплаїти.
 */
export async function getCustomerChannels(customerId: string): Promise<{
  hasPhone: boolean
  hasEmail: boolean
  hasTelegram: boolean
  hasInstagram: boolean
  hasFacebook: boolean
  hasViber: boolean
  phone?: string
  email?: string
  telegramUserId?: string
  instagramPsid?: string
  facebookPsid?: string
  viberUserId?: string
}> {
  const { data } = await supabaseAdmin
    .from("customers")
    .select("phone, email, channels")
    .eq("id", customerId)
    .single()

  if (!data) {
    return { hasPhone: false, hasEmail: false, hasTelegram: false, hasInstagram: false, hasFacebook: false, hasViber: false }
  }

  const channels = (data.channels || {}) as Record<string, string>
  return {
    hasPhone: Boolean(data.phone && data.phone !== "—"),
    hasEmail: Boolean(data.email),
    hasTelegram: Boolean(channels.telegram_user_id),
    hasInstagram: Boolean(channels.instagram_psid),
    hasFacebook: Boolean(channels.facebook_psid),
    hasViber: Boolean(channels.viber_user_id),
    phone: data.phone || undefined,
    email: data.email || undefined,
    telegramUserId: channels.telegram_user_id,
    instagramPsid: channels.instagram_psid,
    facebookPsid: channels.facebook_psid,
    viberUserId: channels.viber_user_id,
  }
}
