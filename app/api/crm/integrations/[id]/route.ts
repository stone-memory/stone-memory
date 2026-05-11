import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireSuperAdmin } from "@/lib/auth/permissions"
import { getKeysFor, invalidateIntegrationConfig, type IntegrationId } from "@/lib/integrations/config"

export const dynamic = "force-dynamic"

const VALID_IDS: IntegrationId[] = ["telegram", "whatsapp", "instagram", "email_inbound", "twilio_sms"]

type Ctx = { params: Promise<{ id: string }> }

/**
 * GET /api/crm/integrations/[id]
 * Returns this channel's stored config — DB-only, NOT merged with env
 * (we don't want to leak Vercel secrets through this endpoint).
 *
 * Response shape:
 *   { id, enabled, config: Record<string, string>, last_event_at, updated_at }
 *
 * Values are returned in plaintext to the super_admin who already has
 * permission to set them. Production secret values aren't displayed
 * in the UI — see PUT below for the "write-only" semantics.
 */
export async function GET(req: Request, ctx: Ctx) {
  const user = await requireSuperAdmin(req)
  if (user instanceof NextResponse) return user

  const { id } = await ctx.params
  if (!VALID_IDS.includes(id as IntegrationId)) {
    return NextResponse.json({ error: "unknown_integration" }, { status: 404 })
  }

  const { data, error } = await supabaseAdmin
    .from("integrations")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Return whether each canonical key has SOMETHING set (either DB or
  // env), without leaking the actual env value. Lets the UI render
  // "set / not set" indicators for env-only fields.
  const keys = getKeysFor(id as IntegrationId)
  const stored = (data?.config as Record<string, string> | null) ?? {}
  const envSet: Record<string, boolean> = {}
  for (const k of keys) {
    const dbHas = typeof stored[k] === "string" && stored[k].length > 0
    if (!dbHas) {
      // Reflect env presence without exposing the value
      const envKey = getEnvKeyFor(id as IntegrationId, k)
      envSet[k] = envKey ? Boolean(process.env[envKey]) : false
    }
  }

  return NextResponse.json({
    id,
    enabled: data?.enabled ?? false,
    config: stored,
    envSet,
    last_event_at: data?.last_event_at ?? null,
    last_error: data?.last_error ?? null,
    updated_at: data?.updated_at ?? null,
  })
}

/**
 * PUT /api/crm/integrations/[id]
 * Body: { enabled?: boolean, config?: Record<string, string> }
 *
 * super_admin only. Config keys outside the canonical list for this
 * channel are silently dropped (defense against typos / future fields
 * that aren't supported here yet).
 *
 * After write, the per-process config cache is invalidated so the
 * next runtime call picks up the new values within ~5s.
 */
export async function PUT(req: Request, ctx: Ctx) {
  const user = await requireSuperAdmin(req)
  if (user instanceof NextResponse) return user

  const { id } = await ctx.params
  if (!VALID_IDS.includes(id as IntegrationId)) {
    return NextResponse.json({ error: "unknown_integration" }, { status: 404 })
  }

  const body = (await req.json().catch(() => null)) as {
    enabled?: boolean
    config?: Record<string, string>
  } | null
  if (!body) return NextResponse.json({ error: "invalid_json" }, { status: 400 })

  const allowedKeys = new Set(getKeysFor(id as IntegrationId))
  const cleanConfig: Record<string, string> = {}
  if (body.config) {
    for (const [k, v] of Object.entries(body.config)) {
      if (!allowedKeys.has(k)) continue
      if (typeof v !== "string") continue
      const trimmed = v.trim()
      if (trimmed.length > 0) cleanConfig[k] = trimmed
    }
  }

  // Upsert — integrations rows exist by id (seeded in
  // crm-channels-migration.sql). Use upsert to be defensive.
  const update: Record<string, unknown> = {
    id,
    config: cleanConfig,
    updated_at: new Date().toISOString(),
  }
  if (typeof body.enabled === "boolean") update.enabled = body.enabled

  const { data, error } = await supabaseAdmin
    .from("integrations")
    .upsert(update, { onConflict: "id" })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  invalidateIntegrationConfig(id as IntegrationId)

  return NextResponse.json({ id, enabled: data.enabled, updated_at: data.updated_at })
}

/** Mirror of ENV_MAP — kept here too to avoid exporting internals. */
function getEnvKeyFor(id: IntegrationId, key: string): string | null {
  const map: Record<IntegrationId, Record<string, string>> = {
    telegram: { bot_token: "TELEGRAM_BOT_TOKEN", admin_chat_id: "TELEGRAM_ADMIN_CHAT_ID", webhook_secret: "TELEGRAM_WEBHOOK_SECRET" },
    whatsapp: { token: "WHATSAPP_TOKEN", phone_number_id: "WHATSAPP_PHONE_NUMBER_ID", verify_token: "WHATSAPP_VERIFY_TOKEN" },
    instagram: { page_access_token: "INSTAGRAM_PAGE_ACCESS_TOKEN", page_id: "INSTAGRAM_PAGE_ID", verify_token: "INSTAGRAM_VERIFY_TOKEN" },
    email_inbound: { resend_api_key: "RESEND_API_KEY", email_from: "EMAIL_FROM", email_from_name: "EMAIL_FROM_NAME", email_reply_to: "EMAIL_REPLY_TO", inbound_secret: "INBOUND_EMAIL_SECRET" },
    twilio_sms: { account_sid: "TWILIO_ACCOUNT_SID", auth_token: "TWILIO_AUTH_TOKEN", from_number: "TWILIO_FROM_NUMBER" },
  }
  return map[id]?.[key] ?? null
}
