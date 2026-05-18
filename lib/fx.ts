import "server-only"

// Static fallback rates (UAH per 1 unit of each currency).
// Used when the NBU API is unreachable.
const FALLBACK: Record<string, number> = {
  UAH: 1,
  EUR: 45,
  PLN: 10.5,
  USD: 41.7,
  GBP: 53,
}

let _cache: { rates: Record<string, number>; expires: number } | null = null

/**
 * Fetches exchange rates from the NBU (National Bank of Ukraine) public API.
 * Returns a map of currency code → UAH per 1 unit (e.g. EUR: 44.5 means €1 = 44.5 ₴).
 * Caches the result in-process for 24 h; falls back to static rates on failure.
 */
export async function fetchNBURates(): Promise<Record<string, number>> {
  if (_cache && _cache.expires > Date.now()) return _cache.rates
  try {
    const res = await fetch("https://bank.gov.ua/NBU_Exchange/exchange_site?json", {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) throw new Error(`NBU HTTP ${res.status}`)
    const data: { cc: string; rate: number }[] = await res.json()
    const rates: Record<string, number> = { UAH: 1 }
    for (const row of data) {
      if (row.cc && typeof row.rate === "number" && row.rate > 0) {
        rates[row.cc] = row.rate
      }
    }
    _cache = { rates, expires: Date.now() + 24 * 3600_000 }
    return rates
  } catch {
    // Retry after 1 h so a transient outage self-heals quickly.
    _cache = { rates: FALLBACK, expires: Date.now() + 3600_000 }
    return FALLBACK
  }
}
