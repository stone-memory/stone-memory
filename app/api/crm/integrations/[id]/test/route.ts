import { NextResponse } from "next/server"
import { requireSuperAdmin } from "@/lib/auth/permissions"
import { getIntegrationConfig, type IntegrationId } from "@/lib/integrations/config"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type Ctx = { params: Promise<{ id: string }> }

const VALID: IntegrationId[] = ["telegram", "whatsapp", "instagram", "viber", "email_inbound", "twilio_sms"]

/**
 * POST /api/crm/integrations/[id]/test
 * Pings the channel's identity API with the currently stored config.
 * Verifies "the tokens I just saved actually work" without sending a
 * real message to a customer.
 *
 * Returns:
 *   { ok: true, info: { ...arbitrary platform metadata } }
 *   { ok: false, error: "...short, human-readable..." }
 *
 * super_admin only — same gate as the config write endpoint.
 */
export async function POST(req: Request, ctx: Ctx) {
  const user = await requireSuperAdmin(req)
  if (user instanceof NextResponse) return user

  const { id } = await ctx.params
  if (!VALID.includes(id as IntegrationId)) {
    return NextResponse.json({ ok: false, error: "unknown_integration" }, { status: 404 })
  }

  const cfg = await getIntegrationConfig(id as IntegrationId)

  try {
    switch (id) {
      case "telegram":
        return await testTelegram(cfg)
      case "whatsapp":
        return await testWhatsapp(cfg)
      case "instagram":
        return await testInstagram(cfg)
      case "viber":
        return await testViber(cfg)
      case "email_inbound":
        return await testEmail(cfg)
      case "twilio_sms":
        return await testTwilio(cfg)
      default:
        return NextResponse.json({ ok: false, error: "no_test_for_channel" }, { status: 400 })
    }
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "test_failed" },
      { status: 500 }
    )
  }
}

// ----------------------------------------------------------------
// Per-channel test implementations.
// Each returns NextResponse with { ok: boolean, info?, error? }.
// ----------------------------------------------------------------

async function testTelegram(cfg: Record<string, string>) {
  if (!cfg.bot_token) {
    return NextResponse.json({ ok: false, error: "Не задано bot_token" })
  }
  const r = await fetch(`https://api.telegram.org/bot${cfg.bot_token}/getMe`)
  const j = await r.json().catch(() => ({}))
  if (!r.ok || !j.ok) {
    return NextResponse.json({
      ok: false,
      error: j.description || `HTTP ${r.status}`,
    })
  }
  return NextResponse.json({
    ok: true,
    info: {
      bot_username: j.result?.username,
      bot_name: j.result?.first_name,
      can_join_groups: j.result?.can_join_groups,
    },
  })
}

async function testWhatsapp(cfg: Record<string, string>) {
  if (!cfg.token || !cfg.phone_number_id) {
    return NextResponse.json({ ok: false, error: "Не задано token або phone_number_id" })
  }
  // GET the phone number itself — cheapest identity check
  const r = await fetch(`https://graph.facebook.com/v21.0/${cfg.phone_number_id}`, {
    headers: { Authorization: `Bearer ${cfg.token}` },
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok || j.error) {
    return NextResponse.json({
      ok: false,
      error: j.error?.message || `HTTP ${r.status}`,
    })
  }
  return NextResponse.json({
    ok: true,
    info: { display_phone_number: j.display_phone_number, verified_name: j.verified_name },
  })
}

async function testInstagram(cfg: Record<string, string>) {
  if (!cfg.page_access_token || !cfg.page_id) {
    return NextResponse.json({ ok: false, error: "Не задано page_access_token або page_id" })
  }
  const r = await fetch(
    `https://graph.facebook.com/v21.0/${cfg.page_id}?fields=id,name,access_token`,
    { headers: { Authorization: `Bearer ${cfg.page_access_token}` } }
  )
  const j = await r.json().catch(() => ({}))
  if (!r.ok || j.error) {
    return NextResponse.json({
      ok: false,
      error: j.error?.message || `HTTP ${r.status}`,
    })
  }
  return NextResponse.json({ ok: true, info: { name: j.name, id: j.id } })
}

async function testViber(cfg: Record<string, string>) {
  if (!cfg.auth_token) {
    return NextResponse.json({ ok: false, error: "Не задано auth_token" })
  }
  const r = await fetch("https://chatapi.viber.com/pa/get_account_info", {
    method: "POST",
    headers: { "X-Viber-Auth-Token": cfg.auth_token, "Content-Type": "application/json" },
    body: "{}",
  })
  const j = await r.json().catch(() => ({ status: -1 }))
  if (j.status !== 0) {
    return NextResponse.json({ ok: false, error: j.status_message || `status ${j.status}` })
  }
  return NextResponse.json({
    ok: true,
    info: { name: j.name, uri: j.uri, members: j.members, webhook: j.webhook || "—" },
  })
}

async function testEmail(cfg: Record<string, string>) {
  if (!cfg.resend_api_key) {
    return NextResponse.json({ ok: false, error: "Не задано resend_api_key" })
  }
  // Resend has a /domains endpoint that requires only the API key
  const r = await fetch("https://api.resend.com/domains", {
    headers: { Authorization: `Bearer ${cfg.resend_api_key}` },
  })
  if (!r.ok) {
    return NextResponse.json({
      ok: false,
      error: `Resend API повернув ${r.status} — перевір API key`,
    })
  }
  const j = await r.json().catch(() => ({}))
  return NextResponse.json({
    ok: true,
    info: { domains_count: Array.isArray(j.data) ? j.data.length : 0 },
  })
}

async function testTwilio(cfg: Record<string, string>) {
  if (!cfg.account_sid || !cfg.auth_token) {
    return NextResponse.json({ ok: false, error: "Не задано account_sid або auth_token" })
  }
  const auth = Buffer.from(`${cfg.account_sid}:${cfg.auth_token}`).toString("base64")
  const r = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${cfg.account_sid}.json`,
    { headers: { Authorization: `Basic ${auth}` } }
  )
  if (!r.ok) {
    return NextResponse.json({
      ok: false,
      error: `Twilio API повернув ${r.status} — перевір SID + auth_token`,
    })
  }
  const j = await r.json().catch(() => ({}))
  return NextResponse.json({
    ok: true,
    info: { friendly_name: j.friendly_name, status: j.status },
  })
}
