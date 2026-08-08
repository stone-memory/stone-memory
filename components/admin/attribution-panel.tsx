"use client"

import { Megaphone } from "lucide-react"
import type { Attribution } from "@/lib/attribution"

/**
 * Shows where a lead came from.
 *
 * Renders nothing when there is no attribution — that is the normal state for
 * direct traffic, messenger leads and everyone who arrived before this was
 * shipped, and an empty "unknown" block on most cards would just be noise.
 */

const FIELD_LABELS: Array<[keyof Attribution, string]> = [
  ["utm_campaign", "Кампанія"],
  ["utm_content", "Оголошення"],
  ["utm_term", "Група / ключ"],
  ["landing", "Сторінка входу"],
  ["referrer", "Реферер"],
]

/** Ad platforms we can name; anything else falls back to the raw value. */
const SOURCE_LABELS: Record<string, string> = {
  google: "Google",
  meta: "Meta",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  telegram: "Telegram",
}

function channelLine(a: Attribution): string {
  const source = a.utm_source ? SOURCE_LABELS[a.utm_source.toLowerCase()] || a.utm_source : null
  if (source && a.utm_medium) return `${source} · ${a.utm_medium}`
  if (source) return source
  if (a.referrer) return a.referrer
  return "невідомо"
}

export function AttributionPanel({
  attribution,
  className,
}: {
  attribution?: Attribution | null
  className?: string
}) {
  if (!attribution) return null

  const rows = FIELD_LABELS.filter(([key]) => attribution[key]).map(
    ([key, label]) => [label, attribution[key] as string] as const
  )

  // Click ids are long opaque strings — worth showing that we have one (it is
  // what makes offline conversion import possible) but not worth the width.
  const clickId = attribution.gclid || attribution.fbclid || attribution.ttclid
  const clickIdLabel = attribution.gclid
    ? "Google click id"
    : attribution.fbclid
      ? "Meta click id"
      : attribution.ttclid
        ? "TikTok click id"
        : null

  return (
    <section className={className}>
      <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4 flex items-center gap-2">
        <Megaphone size={14} strokeWidth={2} />
        Джерело
      </h3>

      <p className="font-medium mb-3">{channelLine(attribution)}</p>

      <dl className="space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4">
            <dt className="text-muted-foreground shrink-0">{label}</dt>
            <dd className="text-right break-all">{value}</dd>
          </div>
        ))}
        {clickId && clickIdLabel && (
          <div className="flex items-start justify-between gap-4">
            <dt className="text-muted-foreground shrink-0">{clickIdLabel}</dt>
            <dd className="text-right font-mono text-xs break-all" title={clickId}>
              {clickId.slice(0, 12)}…
            </dd>
          </div>
        )}
        {attribution.first_seen && (
          <div className="flex items-start justify-between gap-4">
            <dt className="text-muted-foreground shrink-0">Перший візит</dt>
            <dd className="text-right tabular-nums">
              {new Date(attribution.first_seen).toLocaleDateString("uk-UA", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </dd>
          </div>
        )}
      </dl>
    </section>
  )
}
