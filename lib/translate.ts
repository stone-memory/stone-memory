/**
 * Auto-translation between site locales (uk/pl/en/de/lt).
 *
 * Provider chain (first that succeeds wins):
 *   1. DeepL          (DEEPL_API_KEY)            — найкраща якість для UK/PL/DE
 *   2. Google         (GOOGLE_TRANSLATE_API_KEY) — резервний
 *   3. MyMemory       (без ключа, public API)     — безкоштовний fallback
 *   4. Mock           — копіює з префіксом [LOCALE]
 *
 * Provider chain дозволяє admin отримати реальний переклад навіть без
 * власних API-ключів — MyMemory.translated.net надає 5000 слів/день безкоштовно.
 */

import type { Locale } from "@/lib/types"

export type TranslateRequest = {
  text: string
  source: Locale
  targets: Locale[]
}

export type TranslateResult = Partial<Record<Locale, string>>
export type TranslateProvider = "deepl" | "google" | "mymemory" | "mock"

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

// MyMemory — безкоштовний public API. 5000 слів/день per IP. Якість гірша
// за DeepL, але краща за mock. Підтримує всі наші пари мов.
async function translateMyMemory(text: string, source: Locale, target: Locale): Promise<string | null> {
  // MyMemory очікує IETF lang tags
  const map: Record<Locale, string> = { uk: "uk", pl: "pl", en: "en-GB", de: "de", lt: "lt" }
  const langPair = `${map[source]}|${map[target]}`
  const email = process.env.MYMEMORY_EMAIL // опціонально — піднімає квоту до 50 000 слів/день
  const params = new URLSearchParams({ q: text, langpair: langPair })
  if (email) params.set("de", email)
  try {
    const r = await fetch(`https://api.mymemory.translated.net/get?${params.toString()}`, {
      // MyMemory часом повільний — обмежуємо чеканням
      signal: AbortSignal.timeout(8000),
    })
    if (!r.ok) return null
    const data = (await r.json()) as {
      responseStatus?: number | string
      responseData?: { translatedText?: string; match?: number }
    }
    const status = Number(data.responseStatus)
    if (status !== 200) return null
    const out = data.responseData?.translatedText
    if (!out) return null
    // MyMemory іноді повертає весь текст у CAPS або з додатком "(MISSING SOURCE)"
    if (/MYMEMORY WARNING/i.test(out)) return null
    return out
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
): Promise<{ text: string; provider: TranslateProvider }> {
  if (!text.trim() || target === source) return { text, provider: "mock" }
  const deepl = await translateDeepl(text, source, target)
  if (deepl) return { text: deepl, provider: "deepl" }
  const google = await translateGoogle(text, source, target)
  if (google) return { text: google, provider: "google" }
  const mm = await translateMyMemory(text, source, target)
  if (mm) return { text: mm, provider: "mymemory" }
  return { text: translateMock(text, source, target), provider: "mock" }
}

export async function translateAll(req: TranslateRequest): Promise<{
  result: TranslateResult
  provider: TranslateProvider
}> {
  const result: TranslateResult = { [req.source]: req.text }
  // Найкращий провайдер який спрацював на хоча б одній парі — той і повертаємо.
  // Пріоритет: deepl > google > mymemory > mock.
  const priority: Record<TranslateProvider, number> = { deepl: 4, google: 3, mymemory: 2, mock: 1 }
  let best: TranslateProvider = "mock"
  const pending = req.targets
    .filter((t) => t !== req.source)
    .map(async (target) => {
      const { text, provider } = await translateTo(req.text, req.source, target)
      result[target] = text
      if (priority[provider] > priority[best]) best = provider
    })
  await Promise.all(pending)
  return { result, provider: best }
}

export const ALL_LOCALES: Locale[] = ["uk", "pl", "en", "de", "lt"]
