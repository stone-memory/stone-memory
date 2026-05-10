import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/api-auth"
import { findOrCreateCustomer, findActiveDealForCustomer } from "@/lib/crm/comms"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * Одноразовий backfill: переносить усі існуючі chat_messages у communications.
 *
 * Безпечний: skip-ить ті повідомлення що вже є в communications
 * (перевірка по external_id + channel='site_chat').
 *
 * POST /api/crm/admin/backfill-chat
 * Returns: { ok, processed, skipped, customersCreated, errors }
 */
export async function POST(req: Request) {
  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  let processed = 0
  let skipped = 0
  let customersCreated = 0
  const errors: string[] = []

  // Витягуємо ВСІ chat_messages (порціями)
  const PAGE = 200
  let offset = 0
  let totalSeen = 0

  while (true) {
    const { data: messages, error } = await supabaseAdmin
      .from("chat_messages")
      .select("id, session_id, from_role, text, created_at")
      .order("created_at", { ascending: true })
      .range(offset, offset + PAGE - 1)

    if (error) {
      errors.push(`fetch chat_messages: ${error.message}`)
      break
    }
    if (!messages || messages.length === 0) break
    totalSeen += messages.length

    // Перевіряємо що з цих message_id вже є в communications
    const ids = messages.map((m) => String(m.id))
    const { data: existingComms } = await supabaseAdmin
      .from("communications")
      .select("external_id")
      .eq("channel", "site_chat")
      .in("external_id", ids)
    const existingSet = new Set((existingComms || []).map((c) => c.external_id))

    // Кеш сесій щоб не запитувати кожен раз
    const sessionCache = new Map<string, { name: string | null; phone: string | null; locale: string | null }>()

    for (const m of messages) {
      const externalId = String(m.id)
      if (existingSet.has(externalId)) {
        skipped++
        continue
      }

      try {
        // Сесія
        let session = sessionCache.get(m.session_id as string)
        if (!session) {
          const { data: s } = await supabaseAdmin
            .from("chat_sessions")
            .select("name, phone, locale")
            .eq("id", m.session_id)
            .maybeSingle()
          session = s || { name: null, phone: null, locale: null }
          sessionCache.set(m.session_id as string, session)
        }

        const name = session.name || "Гість"
        const phone = session.phone || undefined
        const locale = session.locale || "uk"

        // Знайти або створити customer
        const { id: customerId, created } = await findOrCreateCustomer(
          { phone, siteSessionId: m.session_id as string },
          { name, locale }
        )
        if (created) customersCreated++

        const dealId = m.from_role === "user" ? await findActiveDealForCustomer(customerId) : null

        // Записати в communications
        const { error: insertErr } = await supabaseAdmin.from("communications").insert({
          customer_id: customerId,
          deal_id: dealId,
          channel: "site_chat",
          direction: m.from_role === "user" ? "inbound" : "outbound",
          external_id: externalId,
          thread_key: `site_chat:${m.session_id}`,
          body: m.text,
          created_at: m.created_at,
          read_at: m.from_role === "operator" ? m.created_at : null, // operator-side вважаємо прочитаним
          meta: { backfilled: true, session_id: m.session_id },
        })

        if (insertErr) {
          errors.push(`insert ${externalId}: ${insertErr.message}`)
        } else {
          processed++
        }
      } catch (e) {
        errors.push(`process ${externalId}: ${e instanceof Error ? e.message : "unknown"}`)
      }
    }

    if (messages.length < PAGE) break
    offset += PAGE
  }

  return NextResponse.json({
    ok: true,
    totalSeen,
    processed,
    skipped,
    customersCreated,
    errors: errors.slice(0, 20),
    errorCount: errors.length,
  })
}

export async function GET() {
  return NextResponse.json({
    info: "POST для backfill всіх chat_messages у communications. Безпечно повторювати — skip-ить дублі.",
  })
}
