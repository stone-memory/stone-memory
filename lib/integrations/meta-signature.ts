import "server-only"
import { createHmac, timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import { getIntegrationConfig, type IntegrationId } from "./config"

/**
 * Перевірка підпису вебхуків Meta (WhatsApp Cloud API, Instagram Messaging).
 *
 * Meta підписує кожен POST заголовком `X-Hub-Signature-256`:
 *   sha256=<hex HMAC-SHA256(app_secret, raw body)>
 *
 * Перевірка вмикається лише коли для каналу задано `app_secret`
 * (META_APP_SECRET у env або поле в /admin/integrations). Без секрету
 * поведінка не змінюється — запит приймається, як і раніше, але в лог
 * іде попередження, щоб відкритий ендпоінт не лишився непоміченим.
 */

export function metaSignatureValid(appSecret: string, rawBody: string, header: string | null): boolean {
  if (!header || !header.startsWith("sha256=")) return false
  const expected = createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex")
  const provided = header.slice("sha256=".length).trim()
  if (provided.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(provided, "utf8"), Buffer.from(expected, "utf8"))
}

/**
 * Читає сире тіло запиту, перевіряє підпис (якщо секрет задано) і повертає
 * розпарсений JSON або готову відповідь з помилкою.
 */
export async function readSignedMetaBody<T>(
  req: Request,
  channel: Extract<IntegrationId, "whatsapp" | "instagram">
): Promise<{ body: T } | { response: NextResponse }> {
  const raw = await req.text()
  const cfg = await getIntegrationConfig(channel)
  const appSecret = cfg.app_secret

  if (appSecret) {
    if (!metaSignatureValid(appSecret, raw, req.headers.get("x-hub-signature-256"))) {
      console.warn(`[${channel}] rejected: invalid X-Hub-Signature-256`)
      return { response: NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 }) }
    }
  } else {
    console.warn(`[${channel}] app_secret not configured — webhook signature is NOT verified`)
  }

  try {
    return { body: JSON.parse(raw) as T }
  } catch {
    return { response: NextResponse.json({ ok: false }, { status: 400 }) }
  }
}
