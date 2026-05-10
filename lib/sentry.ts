/**
 * Lightweight Sentry-сумісний клієнт для error tracking.
 *
 * Чому власний а не @sentry/nextjs?
 * — зберігаємо bundle малим (Sentry SDK ~120KB),
 * — користуємось лише capture exception/message + breadcrumb,
 * — не блокуємо реліз якщо Sentry недоступний (DSN опціональний).
 *
 * Коли треба повна функціональність (perf monitoring, replays):
 *   npm i @sentry/nextjs && npx @sentry/wizard@latest -i nextjs
 * — і замінити цей файл на офіційну ініціалізацію.
 */

type SentryLevel = "fatal" | "error" | "warning" | "info" | "debug"

type Breadcrumb = { ts: number; level?: SentryLevel; category?: string; message: string }

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
const isProduction = process.env.NODE_ENV === "production"

// Парсимо DSN: https://<key>@oXX.ingest.sentry.io/<project>
function parseDsn(d: string | undefined): { url: string; key: string; project: string } | null {
  if (!d) return null
  try {
    const u = new URL(d)
    const project = u.pathname.replace(/^\//, "")
    if (!project) return null
    const key = u.username
    if (!key) return null
    const host = u.host
    return {
      url: `${u.protocol}//${host}/api/${project}/store/?sentry_key=${key}&sentry_version=7`,
      key,
      project,
    }
  } catch {
    return null
  }
}

const parsed = parseDsn(dsn)
const breadcrumbs: Breadcrumb[] = []
const MAX_BREADCRUMBS = 30

export function addBreadcrumb(b: Omit<Breadcrumb, "ts">): void {
  breadcrumbs.push({ ts: Date.now(), ...b })
  if (breadcrumbs.length > MAX_BREADCRUMBS) breadcrumbs.shift()
}

async function send(payload: Record<string, unknown>): Promise<void> {
  if (!parsed || !isProduction) return
  try {
    await fetch(parsed.url, {
      method: "POST",
      keepalive: true,
      body: JSON.stringify(payload),
    })
  } catch {
    /* swallow — телеметрія не критична */
  }
}

export function captureException(err: unknown, context?: Record<string, unknown>): void {
  const e = err instanceof Error ? err : new Error(String(err))
  if (!parsed) {
    if (!isProduction) console.error("[error]", e, context)
    return
  }
  send({
    event_id: crypto.randomUUID().replace(/-/g, ""),
    timestamp: new Date().toISOString(),
    platform: typeof window !== "undefined" ? "javascript" : "node",
    level: "error",
    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_APP_VERSION,
    exception: {
      values: [
        {
          type: e.name,
          value: e.message,
          stacktrace: e.stack ? { frames: parseStack(e.stack) } : undefined,
        },
      ],
    },
    breadcrumbs: { values: breadcrumbs.slice(-15) },
    contexts: context ? { custom: context } : undefined,
  })
}

export function captureMessage(message: string, level: SentryLevel = "info"): void {
  if (!parsed) {
    if (!isProduction) console.log(`[${level}]`, message)
    return
  }
  send({
    event_id: crypto.randomUUID().replace(/-/g, ""),
    timestamp: new Date().toISOString(),
    platform: typeof window !== "undefined" ? "javascript" : "node",
    level,
    environment: process.env.NODE_ENV,
    message,
    breadcrumbs: { values: breadcrumbs.slice(-10) },
  })
}

function parseStack(stack: string): Array<{ filename: string; function?: string; lineno?: number; colno?: number }> {
  return stack
    .split("\n")
    .slice(1, 16)
    .map((line) => {
      // "    at fn (file:line:col)"
      const m = line.match(/at\s+(\S+)\s+\((.+):(\d+):(\d+)\)/) || line.match(/at\s+(.+):(\d+):(\d+)/)
      if (!m) return { filename: line.trim() }
      if (m.length === 5) {
        return { function: m[1], filename: m[2], lineno: Number(m[3]), colno: Number(m[4]) }
      }
      return { filename: m[1], lineno: Number(m[2]), colno: Number(m[3]) }
    })
}

/**
 * Підключити global error handlers у клієнті — викликати в RootLayout.
 * Безпечно викликати кілька разів — handlers додаються через `addEventListener`
 * з прапором `once`-сумісної логіки (idempotent global flag).
 */
let installed = false
export function installClientErrorHandlers(): void {
  if (installed || typeof window === "undefined") return
  installed = true
  window.addEventListener("error", (e) => {
    captureException(e.error || new Error(e.message), { source: "window.onerror" })
  })
  window.addEventListener("unhandledrejection", (e) => {
    captureException(e.reason, { source: "unhandledrejection" })
  })
}
