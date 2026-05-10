/**
 * Simple in-memory sliding-window rate limiter.
 * For production, replace the Map with Redis/Upstash or Vercel KV.
 *
 * Usage:
 *   const { allowed, remaining, resetAt } = rateLimit(`chat:${ip}`, 10, 60_000)
 *   if (!allowed) return new Response("Too many requests", { status: 429 })
 */

type Entry = { timestamps: number[] }

const buckets = new Map<string, Entry>()

// GC stale buckets every 5 min so memory doesn't grow unbounded
let lastGc = Date.now()
function gc(now: number, windowMs: number) {
  if (now - lastGc < 5 * 60_000) return
  for (const [key, entry] of buckets) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs)
    if (entry.timestamps.length === 0) buckets.delete(key)
  }
  lastGc = now
}

export function rateLimit(
  key: string,
  max: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  gc(now, windowMs)
  const entry = buckets.get(key) || { timestamps: [] }
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs)
  if (entry.timestamps.length >= max) {
    const oldest = entry.timestamps[0]
    return { allowed: false, remaining: 0, resetAt: oldest + windowMs }
  }
  entry.timestamps.push(now)
  buckets.set(key, entry)
  return { allowed: true, remaining: max - entry.timestamps.length, resetAt: now + windowMs }
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for")
  if (fwd) return fwd.split(",")[0].trim()
  const real = req.headers.get("x-real-ip")
  if (real) return real.trim()
  const cf = req.headers.get("cf-connecting-ip")
  if (cf) return cf.trim()
  return "anon"
}
