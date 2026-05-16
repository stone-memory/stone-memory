import "server-only"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { recordIncoming, recordOutgoing } from "@/lib/crm/comms"

export type SessionWithMessages = {
  id: string
  sessionId: string
  name: string | null
  phone: string | null
  locale: string
  first_seen_at: string
  last_activity_at: string
  lastUserAt: number
  userMessages: Array<{ id: string; text: string; at: number }>
  operatorMessages: Array<{ id: string; text: string; at: number }>
}

export async function upsertSession(
  sessionId: string,
  patch: { name?: string; phone?: string; locale?: string; lastUserAt?: number }
): Promise<void> {
  const now = new Date().toISOString()

  const { data: existing, error: readErr } = await supabaseAdmin
    .from("chat_sessions")
    .select("id, name, phone, locale")
    .eq("id", sessionId)
    .maybeSingle()
  if (readErr) console.error("[chat-store] upsertSession read error:", readErr)

  const row = {
    id: sessionId,
    name: patch.name ?? existing?.name ?? null,
    phone: patch.phone ?? existing?.phone ?? null,
    locale: patch.locale ?? existing?.locale ?? "uk",
    last_activity_at: patch.lastUserAt ? new Date(patch.lastUserAt).toISOString() : now,
  }
  const { error } = await supabaseAdmin.from("chat_sessions").upsert(row, { onConflict: "id" })
  if (error) console.error("[chat-store] upsertSession write error:", error.message)
}

export async function addUserMessage(
  sessionId: string,
  text: string
): Promise<{ id: string; text: string; at: number } | null> {
  const { data, error } = await supabaseAdmin
    .from("chat_messages")
    .insert({ session_id: sessionId, from_role: "user", text })
    .select()
    .single()
  if (error || !data) {
    console.error("[chat-store] addUserMessage error:", error?.message)
    return null
  }
  await supabaseAdmin
    .from("chat_sessions")
    .update({ last_activity_at: data.created_at })
    .eq("id", sessionId)

  // Дзеркаламо в communications щоб з'явилось у /admin/inbox.
  // Підтягуємо name/phone/locale з поточної chat_sessions — якщо клієнт уже їх ввів,
  // створиться повноцінний customer; якщо ні — guest-customer прив'язаний до sessionId.
  await mirrorToInbox(sessionId, "inbound", text, data.id, data.created_at).catch((e) =>
    console.error("[chat-store] mirror inbound failed:", e)
  )

  return { id: String(data.id), text: data.text, at: new Date(data.created_at).getTime() }
}

export async function addOperatorMessage(
  sessionId: string,
  text: string
): Promise<{ id: string; text: string; at: number } | null> {
  // Make sure the session row exists — operator may reply before user sends anything.
  await supabaseAdmin.from("chat_sessions").upsert(
    { id: sessionId, locale: "uk" },
    { onConflict: "id", ignoreDuplicates: true }
  )
  const { data, error } = await supabaseAdmin
    .from("chat_messages")
    .insert({ session_id: sessionId, from_role: "operator", text })
    .select()
    .single()
  if (error || !data) {
    console.error("[chat-store] addOperatorMessage error:", error?.message)
    return null
  }

  await mirrorToInbox(sessionId, "outbound", text, data.id, data.created_at).catch((e) =>
    console.error("[chat-store] mirror outbound failed:", e)
  )

  return { id: String(data.id), text: data.text, at: new Date(data.created_at).getTime() }
}

/**
 * Дзеркало повідомлення з chat_messages у communications (для /admin/inbox).
 *
 * Підтягує name/phone/locale з chat_sessions і викликає recordIncoming/recordOutgoing
 * — це означає що customer буде знайдено по телефону або створено "guest-{sessionId}".
 *
 * Усі помилки swallow-имо: дзеркало — не критичне, головне щоб chat-store працював.
 */
async function mirrorToInbox(
  sessionId: string,
  direction: "inbound" | "outbound",
  body: string,
  messageId: number | string,
  createdAt: string
): Promise<void> {
  const { data: session } = await supabaseAdmin
    .from("chat_sessions")
    .select("name, phone, locale")
    .eq("id", sessionId)
    .maybeSingle()

  const name = session?.name || "Гість"
  const phone = session?.phone || undefined
  const locale = session?.locale || "uk"

  if (direction === "inbound") {
    await recordIncoming({
      channel: "site_chat",
      identifier: { phone, siteSessionId: sessionId },
      name,
      locale,
      body,
      externalId: String(messageId),
      threadKey: `site_chat:${sessionId}`,
      rawMeta: { session_id: sessionId, mirrored_at: createdAt },
    })
  } else {
    // Для outbound нам потрібен customerId — знайдемо/створимо
    const { findOrCreateCustomer, findActiveDealForCustomer } = await import("@/lib/crm/comms")
    const { id: customerId } = await findOrCreateCustomer(
      { phone, siteSessionId: sessionId },
      { name, locale }
    )
    const dealId = await findActiveDealForCustomer(customerId)
    await recordOutgoing({
      customerId,
      dealId,
      channel: "site_chat",
      body,
      externalId: String(messageId),
      threadKey: `site_chat:${sessionId}`,
    })
  }
}

export async function getOperatorMessages(
  sessionId: string
): Promise<Array<{ id: string; text: string; at: number }>> {
  const { data, error } = await supabaseAdmin
    .from("chat_messages")
    .select("id, text, created_at")
    .eq("session_id", sessionId)
    .eq("from_role", "operator")
    .order("created_at", { ascending: true })
    .limit(200)
  if (error || !data) return []
  return data.map((m) => ({ id: String(m.id), text: m.text, at: new Date(m.created_at).getTime() }))
}

export async function listSessions(): Promise<SessionWithMessages[]> {
  const { data: sessions, error } = await supabaseAdmin
    .from("chat_sessions")
    .select("*")
    .order("last_activity_at", { ascending: false })
    .limit(200)
  if (error) console.error("[chat-store] listSessions error:", error.message)
  if (error || !sessions) return []

  const ids = sessions.map((s) => s.id as string)
  if (ids.length === 0) return []

  const { data: messages } = await supabaseAdmin
    .from("chat_messages")
    .select("id, session_id, from_role, text, created_at")
    .in("session_id", ids)
    .order("created_at", { ascending: true })

  const byId = new Map<string, SessionWithMessages>()
  for (const s of sessions) {
    byId.set(s.id as string, {
      id: s.id as string,
      sessionId: s.id as string,
      name: (s.name as string | null) ?? null,
      phone: (s.phone as string | null) ?? null,
      locale: (s.locale as string) ?? "uk",
      first_seen_at: s.first_seen_at as string,
      last_activity_at: s.last_activity_at as string,
      lastUserAt: new Date(s.last_activity_at as string).getTime(),
      userMessages: [],
      operatorMessages: [],
    })
  }
  for (const m of messages || []) {
    const bucket = byId.get(m.session_id as string)
    if (!bucket) continue
    const entry = {
      id: String(m.id),
      text: m.text as string,
      at: new Date(m.created_at as string).getTime(),
    }
    if (m.from_role === "user") bucket.userMessages.push(entry)
    else bucket.operatorMessages.push(entry)
  }
  return Array.from(byId.values())
}

// Telegram reply routing. The map telegram_message_id → session_id is short-
// lived and not part of the CRM history, so we keep it in memory.
const gx = globalThis as unknown as { __SM_CHAT_REPLY__?: Map<number, string> }
if (!gx.__SM_CHAT_REPLY__) gx.__SM_CHAT_REPLY__ = new Map<number, string>()
const replyIndex = gx.__SM_CHAT_REPLY__

export function rememberRelayMessage(telegramMessageId: number, sessionId: string) {
  replyIndex.set(telegramMessageId, sessionId)
  if (replyIndex.size > 500) {
    const firstKey = replyIndex.keys().next().value
    if (firstKey !== undefined) replyIndex.delete(firstKey)
  }
}

export function sessionForRelayMessage(telegramMessageId: number): string | undefined {
  return replyIndex.get(telegramMessageId)
}
