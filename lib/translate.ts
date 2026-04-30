/**
 * Auto-translation between site locales (uk/pl/en/de/lt).
 *
 * Provider is picked at runtime based on env vars:
 *   DEEPL_API_KEY      → DeepL (highest quality for European languages)
 *   GOOGLE_TRANSLATE_API_KEY → Google Cloud Translate
 *   neither           → local mock (copies source text, tags with [LOCALE])
 *
 * The public API is framework-agnostic; client code calls /api/translate.
 */

import type { Locale } from "@/lib/types"

export type TranslateRequest = {
  text: string
  source: Locale
  targets: Locale[]
}

export type TranslateResult = Partial<Record<Locale, string>>

// DeepL uses 2-letter codes with some quirks (EN-GB/US, PT-BR etc). For us:
const deeplTarget: Record<Locale, string> = {
  uk: "UK",
  pl: "PL",
  en: "EN-GB",
  de: "DE",
  lt: "LT",
}
const deeplSource: Record<Locale, string> = {
  uk: "UK",
  pl: "PL",
  en: "EN",
  de: "DE",
  lt: "LT",
}

async function translateDeepl(text: string, source: Locale, target: Locale): Promise<string | null> {
  const key = process.env.DEEPL_API_KEY
  if (!key) return null
  const endpoint = key.endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate"
  try {
    const r = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: [text],
        source_lang: deeplSource[source],
        target_lang: deeplTarget[target],
        preserve_formatting: true,
      }),
    })
    if (!r.ok) return null
    const data = (await r.json()) as { translations?: Array<{ text?: string }> }
    return data.translations?.[0]?.text || null
  } catch {
    return null
  }
}

async function translateGoogle(text: string, source: Locale, target: Locale): Promise<string | null> {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY
  if (!key) return null
  try {
    const r = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text,
          source,
          target,
          format: "text",
        }),
      }
    )
    if (!r.ok) return null
    const data = (await r.json()) as { data?: { translations?: Array<{ translatedText?: string }> } }
    return data.data?.translations?.[0]?.translatedText || null
  } catch {
    return null
  }
}

function translateMock(text: string, source: Locale, target: Locale): string {
  if (target === source || !text) return text
  // Mock — prefix with locale so admin can see fields were filled but remembers to review.
  return `[${target.toUpperCase()}] ${text}`
}

export async function translateTo(
  text: string,
  source: Locale,
  target: Locale
): Promise<{ text: string; provider: "deepl" | "google" | "mock" }> {
  if (!text.trim() || target === source) return { text, provider: "mock" }
  const deepl = await translateDeepl(text, source, target)
  if (deepl) return { text: deepl, provider: "deepl" }
  const google = await translateGoogle(text, source, target)
  if (google) return { text: google, provider: "google" }
  return { text: translateMock(text, source, target), provider: "mock" }
}

export async function translateAll(req: TranslateRequest): Promise<{
  result: TranslateResult
  provider: "deepl" | "google" | "mock"
}> {
  const result: TranslateResult = { [req.source]: req.text }
  let usedProvider: "deepl" | "google" | "mock" = "mock"
  const pending = req.targets
    .filter((t) => t !== req.source)
    .map(async (target) => {
      const { text, provider } = await translateTo(req.text, req.source, target)
      result[target] = text
      if (provider !== "mock") usedProvider = provider
    })
  await Promise.all(pending)
  return { result, provider: usedProvider }
}

export const ALL_LOCALES: Locale[] = ["uk", "pl", "en", "de", "lt"]
