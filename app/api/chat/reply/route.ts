import { NextResponse } from "next/server"
import { addOperatorMessage } from "@/lib/chat-store"
import { guardCapability } from "@/lib/auth/permissions"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const unauthorized = await guardCapability(req, "customers.message")
  if (unauthorized) return unauthorized

  try {
    const body = (await req.json()) as { sessionId?: string; text?: string }
    if (!body.sessionId || !body.text || body.text.length > 4000) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    const msg = await addOperatorMessage(body.sessionId, body.text.trim())
    if (!msg) return NextResponse.json({ ok: false }, { status: 500 })
    return NextResponse.json({ ok: true, message: msg })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
