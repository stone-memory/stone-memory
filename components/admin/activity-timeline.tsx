"use client"

import Link from "next/link"
import {
  MessageSquare,
  CreditCard,
  FileText,
  Bell,
  ArrowRightLeft,
  Sparkles,
  Mail,
  Phone,
  Send,
} from "lucide-react"
import {
  COMM_CHANNEL_LABELS,
  DEAL_STATUS_LABELS_UK,
  DOCUMENT_KIND_LABELS_UK,
  PAYMENT_KIND_LABELS_UK,
} from "@/lib/crm/types"
import type {
  Communication,
  Deal,
  DealEvent,
  Document,
  Payment,
  Reminder,
} from "@/lib/crm/types"
import { formatRelative, formatUAH } from "@/lib/admin-format"

/**
 * Unified chronological activity feed across communications, status
 * changes, payments, documents, reminders, and deal creation. Rendered
 * at the top of customer / deal detail pages.
 *
 * This component never fetches — all data comes from the page's existing
 * customer-overview API call. It just merges and sorts.
 */

type TimelineEntry = {
  id: string
  ts: string                          // ISO date for sorting
  icon: React.ReactNode
  iconClass: string                   // Tailwind classes for icon container
  label: string                       // Short title
  detail?: string                     // Optional preview text (1-2 lines)
  meta?: string                       // Right-aligned secondary text
  link?: string                       // Optional click-through (deal page, doc URL)
}

type Sources = {
  communications?: Communication[]
  payments?: Payment[]
  documents?: Document[]
  dealEvents?: DealEvent[]
  reminders?: Reminder[]
  /** Used to link status events back to their deal, and to derive
   *  "deal created" entries. Pass the same deals array the page already has. */
  deals?: Deal[]
}

function commIcon(channel: Communication["channel"]) {
  switch (channel) {
    case "email":
      return <Mail size={14} />
    case "sms":
    case "phone":
      return <Phone size={14} />
    default:
      return <MessageSquare size={14} />
  }
}

function buildEntries(sources: Sources): TimelineEntry[] {
  const out: TimelineEntry[] = []
  const dealById = new Map((sources.deals || []).map((d) => [d.id, d]))
  const dealLink = (dealId: string | null | undefined) =>
    dealId ? `/admin/deals/${dealId}` : undefined

  for (const c of sources.communications || []) {
    const channelLabel = COMM_CHANNEL_LABELS[c.channel] || c.channel
    const dirArrow = c.direction === "inbound" ? "←" : "→"
    out.push({
      id: `comm-${c.id}`,
      ts: c.created_at,
      icon: commIcon(c.channel),
      iconClass:
        c.direction === "inbound"
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
      label: `${dirArrow} ${channelLabel}${c.subject ? ` · ${c.subject}` : ""}`,
      detail: c.body || undefined,
      link: dealLink(c.deal_id),
    })
  }

  for (const p of sources.payments || []) {
    const isRefund = p.kind === "refund"
    out.push({
      id: `pay-${p.id}`,
      ts: p.paid_at,
      icon: <CreditCard size={14} />,
      iconClass: isRefund
        ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
        : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
      label: `${isRefund ? "Повернення" : PAYMENT_KIND_LABELS_UK[p.kind]} · ${formatUAH(Number(p.amount_eur))}`,
      detail: p.notes || undefined,
      meta: p.reference || undefined,
      link: dealLink(p.deal_id),
    })
  }

  for (const d of sources.documents || []) {
    out.push({
      id: `doc-${d.id}`,
      ts: d.created_at,
      icon: <FileText size={14} />,
      iconClass:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
      label: `${DOCUMENT_KIND_LABELS_UK[d.kind]}${d.number ? ` · ${d.number}` : ""}`,
      detail: d.title || undefined,
      meta: d.signed_at ? "✓ підписано" : undefined,
      link: d.public_url || dealLink(d.deal_id),
    })
  }

  for (const e of sources.dealEvents || []) {
    const deal = dealById.get(e.deal_id)
    const ref = deal?.reference ? ` · ${deal.reference}` : ""
    if (e.kind === "status_change") {
      const from = e.from_status ? DEAL_STATUS_LABELS_UK[e.from_status] : "—"
      const to = e.to_status ? DEAL_STATUS_LABELS_UK[e.to_status] : "—"
      out.push({
        id: `evt-${e.id}`,
        ts: e.created_at,
        icon: <ArrowRightLeft size={14} />,
        iconClass:
          "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
        label: `Статус: ${from} → ${to}${ref}`,
        detail: e.message || undefined,
        link: dealLink(e.deal_id),
      })
    } else if (e.kind === "note") {
      out.push({
        id: `evt-${e.id}`,
        ts: e.created_at,
        icon: <Sparkles size={14} />,
        iconClass:
          "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300",
        label: `Нотатка${ref}`,
        detail: e.message || undefined,
        link: dealLink(e.deal_id),
      })
    }
    // Other deal_event kinds (call, sms, email, document, payment, reminder_set)
    // are skipped here because their authoritative records already render via
    // communications / documents / payments sources above. Including them
    // would duplicate rows.
  }

  for (const r of sources.reminders || []) {
    if (r.status !== "sent" && r.status !== "snoozed") continue
    const ts = r.notified_at || r.completed_at
    if (!ts) continue
    out.push({
      id: `rem-${r.id}`,
      ts,
      icon: <Bell size={14} />,
      iconClass:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
      label: `Нагадування: ${r.title}`,
      detail: r.description || undefined,
      meta: r.status === "sent" ? "надіслано" : "відкладено",
      link: dealLink(r.deal_id),
    })
  }

  // Deal creation milestone — one entry per deal, useful as an "anchor"
  // when scrolling far back. Skip when the customer has many (>5) deals
  // to keep the timeline focused on flow events.
  const deals = sources.deals || []
  if (deals.length <= 5) {
    for (const d of deals) {
      out.push({
        id: `deal-created-${d.id}`,
        ts: d.created_at,
        icon: <Send size={14} />,
        iconClass:
          "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
        label: `Угода створена · ${d.reference}`,
        detail: d.description || undefined,
        meta: formatUAH(Number(d.amount_eur)),
        link: dealLink(d.id),
      })
    }
  }

  out.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
  return out
}

export function ActivityTimeline({
  sources,
  limit = 40,
  emptyText = "Поки немає активності.",
}: {
  sources: Sources
  /** Max entries to render. Older ones collapse behind a "Показати більше" toggle. */
  limit?: number
  emptyText?: string
}) {
  const all = buildEntries(sources)

  if (all.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    )
  }

  const visible = all.slice(0, limit)
  const hidden = Math.max(0, all.length - limit)

  return (
    <div className="relative">
      {/* Vertical rail */}
      <div className="absolute left-[19px] top-2 bottom-2 w-px bg-foreground/10" />
      <ol className="space-y-4 py-2">
        {visible.map((e) => (
          <li key={e.id} className="relative pl-12 pr-4">
            <span
              className={`absolute left-2 top-0 inline-flex h-9 w-9 items-center justify-center rounded-full ring-4 ring-card ${e.iconClass}`}
            >
              {e.icon}
            </span>
            <Row entry={e} />
          </li>
        ))}
      </ol>
      {hidden > 0 && (
        <div className="px-4 pt-2 text-xs text-muted-foreground">
          …та ще {hidden} подій раніше
        </div>
      )}
    </div>
  )
}

function Row({ entry }: { entry: TimelineEntry }) {
  const inner = (
    <div className="space-y-1">
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-medium leading-tight">{entry.label}</span>
        {entry.meta && (
          <span className="ml-auto text-[11px] text-muted-foreground">{entry.meta}</span>
        )}
      </div>
      {entry.detail && (
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {entry.detail}
        </p>
      )}
      <div className="text-[11px] text-muted-foreground">
        {formatRelative(entry.ts)}
      </div>
    </div>
  )
  if (entry.link) {
    return (
      <Link
        href={entry.link}
        className="block rounded-xl px-3 py-2 transition-colors hover:bg-foreground/[0.03]"
      >
        {inner}
      </Link>
    )
  }
  return <div className="px-3 py-2">{inner}</div>
}
