import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { guardCapability } from "@/lib/auth/permissions"
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
  const unauth = await guardCapability(req, "integrations.manage")
  if (unauth) return unauth

  let processed = 0
  let skipped = 0
  let customersCreated = 0
  const errors: string[] = []

  // Helper: stringify a Supabase/Postgres error completely.
  // Default `error.message` often hides the column name / constraint / hint.
  const formatDbError = (
    e: { message?: string; details?: string; hint?: string; code?: string } | unknown,
    prefix: string
  ): string => {
    if (e && typeof e === "object") {
      const err = e as { message?: string; details?: string; hint?: string; code?: string }
      const parts = [
        err.code ? `[${err.code}]` : null,
        err.message,
        err.details ? `details=${err.details}` : null,
        err.hint ? `hint=${err.hint}` : null,
      ].filter(Boolean)
      return `${prefix}: ${parts.join(" | ")}`
    }
    return `${prefix}: ${e instanceof Error ? e.message : String(e)}`
  }

  // ----- Pre-flight: confirm prerequisite columns exist -----
  // The most common cause of "22 помилок 0 перенесено" is that the
  // user ran crm-migration.sql but NOT crm-channels-migration.sql, so
  // communications.thread_key and customers.channels don't exist yet.
  // We catch that here with a friendly precondition error instead of
  // letting the user discover it through 22 cryptic insert failures.
  const preflightErrors: { table: string; column: string; migration: string }[] = []
  {
    const { error: tkErr } = await supabaseAdmin
      .from("communications").select("thread_key").limit(1)
    if (tkErr && tkErr.code === "42703") {
      preflightErrors.push({
        table: "communications", column: "thread_key",
        migration: "crm-channels-migration.sql",
      })
    }
    const { error: chErr } = await supabaseAdmin
      .from("customers").select("channels").limit(1)
    if (chErr && chErr.code === "42703") {
      preflightErrors.push({
        table: "customers", column: "channels",
        migration: "crm-channels-migration.sql",
      })
    }
  }
  if (preflightErrors.length > 0) {
    const lines = preflightErrors.map(
      (e) => `• ${e.table}.${e.column} відсутня — потрібна міграція ${e.migration}`
    )
    const message = [
      "Перед backfill потрібно прогнати SQL-міграції у Supabase:",
      ...lines,
      "",
      "Відкрий Supabase Dashboard → SQL Editor → вставити вміст файлу і натиснути Run.",
      "Файли в репо: supabase/crm-channels-migration.sql (і пов'язані)",
    ].join("\n")
    return NextResponse.json(
      {
        ok: false,
        error: "missing_migrations",
        message,
        preflightErrors,
      },
      { status: 412 }
    )
  }

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
      const msg = formatDbError(error, "fetch chat_messages")
      console.error("[backfill-chat]", msg)
      errors.push(msg)
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
          const msg = formatDbError(insertErr, `insert comm for chat_messages.id=${externalId}`)
          console.error("[backfill-chat]", msg)
          errors.push(msg)
        } else {
          processed++
        }
      } catch (e) {
        const msg = formatDbError(e, `process chat_messages.id=${externalId}`)
        console.error("[backfill-chat]", msg)
        errors.push(msg)
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
