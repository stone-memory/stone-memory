import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/api-auth"
import { sendToChannel } from "@/lib/crm/send"
import type { CommChannel } from "@/lib/crm/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Універсальний reply endpoint.
 *
 * POST /api/crm/reply
 *   body: { customerId, channel, body, dealId?, subject? }
 *
 * Маршрутизує до правильного каналу через lib/crm/send.ts:sendToChannel
 * і записує у communications. Повертає { ok, channel, error?, communicationId? }.
 *
 * Дозволено лише для admin/manager (через requireAdmin).
 */
export async function POST(req: Request) {
  const unauth = await requireAdmin(req)
  if (unauth) return unauth

  let body: {
    customerId?: string
    channel?: CommChannel
    body?: string
    dealId?: string
    subject?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

  if (!body.customerId || !body.channel || !body.body) {
    return NextResponse.json({ error: "customerId, channel, body обов'язкові" }, { status: 400 })
  }

  if (body.body.length > 4000) {
    return NextResponse.json({ error: "body занадто довге (>4000 символів)" }, { status: 413 })
  }

  const result = await sendToChannel({
    customerId: body.customerId,
    dealId: body.dealId || null,
    channel: body.channel,
    body: body.body,
    subject: body.subject,
  })

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, channel: result.channel, error: result.error },
      { status: 422 }
    )
  }

  return NextResponse.json({
    ok: true,
    channel: result.channel,
    messageId: result.messageId,
    communicationId: result.communicationId,
  })
}
