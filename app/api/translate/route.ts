import { NextResponse } from "next/server"
import { translateAll, ALL_LOCALES } from "@/lib/translate"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import type { Locale } from "@/lib/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const ip = getClientIp(req)
  const rl = rateLimit(`translate:${ip}`, 30, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    )
  }

  let body: { text?: string; source?: Locale; targets?: Locale[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 })
  }

  const { text, source } = body
  if (!text || typeof text !== "string" || text.length > 5000) {
    return NextResponse.json({ ok: false, error: "bad_text" }, { status: 400 })
  }
  if (!source || !ALL_LOCALES.includes(source)) {
    return NextResponse.json({ ok: false, error: "bad_source" }, { status: 400 })
  }
  const targets = (body.targets || ALL_LOCALES).filter((t) => ALL_LOCALES.includes(t)) as Locale[]

  const { result, provider } = await translateAll({ text, source, targets })
  return NextResponse.json({ ok: true, provider, result })
}
