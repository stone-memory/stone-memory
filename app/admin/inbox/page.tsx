"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  Inbox as InboxIcon,
  MessageSquare,
  Phone,
  Mail,
  MessageCircle,
  Send,
  Reply,
  ExternalLink,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { authedFetch } from "@/lib/authed-fetch"
import { COMM_CHANNEL_LABELS, type Communication, type CommChannel } from "@/lib/crm/types"
import { formatRelative, formatDateTime } from "@/lib/admin-format"
import { cn } from "@/lib/utils"

type Comm = Communication & {
  customers?: { id: string; name: string; phone: string }
}

const CHANNEL_ICON: Record<CommChannel, React.ComponentType<{ size?: number; className?: string }>> = {
  site_chat: MessageCircle,
  telegram: Send,
  whatsapp: MessageCircle,
  instagram: MessageCircle,
  facebook: MessageCircle,
  viber: MessageCircle,
  email: Mail,
  sms: MessageCircle,
  phone: Phone,
  manual: MessageSquare,
}

const CHANNEL_COLOR: Record<CommChannel, string> = {
  site_chat: "text-foreground/70",
  telegram: "text-[#229ED9]",
  whatsapp: "text-[#25D366]",
  instagram: "text-[#E1306C]",
  facebook: "text-[#1877F2]",
  viber: "text-[#7360F2]",
  email: "text-amber-600",
  sms: "text-purple-600",
  phone: "text-foreground/70",
  manual: "text-foreground/50",
}

export default function InboxPage() {
  const searchParams = useSearchParams()
  // Inbox accepts ?thread=<thread_key> query param so other admin pages
  // can deep-link to a specific conversation. Used by the analytics
  // "Останні чат-сесії" cards: they pass thread=site_chat:<session_id>
  // and we open that thread on mount.
  const initialThread = searchParams?.get("thread") || null

  const [items, setItems] = useState<Comm[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread" | CommChannel>("all")
  const [activeThread, setActiveThread] = useState<string | null>(initialThread)

  // If the URL changes while the page is mounted (e.g. user clicks a
  // chat card, navigates back, clicks another), keep activeThread in
  // sync. Without this useEffect activeThread would be locked to the
  // first param read.
  useEffect(() => {
    if (initialThread && initialThread !== activeThread) {
      setActiveThread(initialThread)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialThread])

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: "500" })
      if (filter === "unread") params.set("unread", "true")
      else if (filter !== "all") params.set("channel", filter)
      const r = await authedFetch(`/api/crm/communications?${params}`, { cache: "no-store" })
      const j = await r.json()
      if (r.ok) setItems(j.communications || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 30_000)  // polling кожні 30с — потім замінити на Realtime
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const markRead = async (ids: number[]) => {
    if (!ids.length) return
    // Optimistically mark locally so the just-opened conversation stays
    // visible — on the "unread" filter a full reload would instantly drop
    // it (the "повідомлення зникає після відкриття" issue).
    const now = new Date().toISOString()
    setItems((prev) => prev.map((m) => (ids.includes(m.id) ? { ...m, read_at: m.read_at || now } : m)))
    await authedFetch("/api/crm/communications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
    if (filter !== "unread") load()
  }

  // Групуємо повідомлення в conversations за thread_key (або customer_id+channel)
  const conversations = useMemo(() => {
    const map = new Map<
      string,
      {
        key: string
        customer?: Comm["customers"]
        channel: CommChannel
        lastMsg: Comm
        unreadCount: number
        messages: Comm[]
      }
    >()
    for (const m of items) {
      const key = m.thread_key || (m.customer_id ? `customer:${m.customer_id}:${m.channel}` : `orphan:${m.id}`)
      let g = map.get(key)
      if (!g) {
        g = { key, customer: m.customers, channel: m.channel, lastMsg: m, unreadCount: 0, messages: [] }
        map.set(key, g)
      }
      g.messages.push(m)
      if (new Date(m.created_at).getTime() > new Date(g.lastMsg.created_at).getTime()) g.lastMsg = m
      if (!m.read_at && m.direction === "inbound") g.unreadCount++
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastMsg.created_at).getTime() - new Date(a.lastMsg.created_at).getTime()
    )
  }, [items])

  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0)
  const active = conversations.find((c) => c.key === activeThread)

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight-custom">Inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Усі повідомлення з усіх каналів. {totalUnread > 0 && <span className="text-amber-600">Непрочитано: {totalUnread}</span>}
          </p>
        </div>
        {totalUnread > 0 && (
          <button
            onClick={() => markRead(items.filter((m) => !m.read_at && m.direction === "inbound").map((m) => m.id))}
            className="rounded-full border border-foreground/15 px-3 py-1.5 text-xs hover:bg-foreground/5"
          >
            Позначити все прочитаним
          </button>
        )}
      </header>

      {/* Filter chips — compute unread badge per channel from the
         full message list so the operator can see at a glance which
         channels need attention. The list is already loaded for the
         current filter, but we want unread counts ACROSS channels.
         For now we count from `items` which, when filter="all", has
         everything; on a narrower filter, badges only cover what's
         currently fetched. Good enough for the visible signal. */}
      <div className="flex flex-wrap gap-1 rounded-full bg-foreground/5 p-1 w-fit">
        {(
          [
            ["all", "Усе"],
            ["unread", "Непрочитані"],
            ["site_chat", "Сайт"],
            ["telegram", "Telegram"],
            ["whatsapp", "WhatsApp"],
            ["instagram", "Instagram"],
            ["viber", "Viber"],
            ["email", "Email"],
            ["sms", "SMS"],
            ["phone", "Дзвінки"],
          ] as const
        ).map(([key, label]) => {
          const unread = items.filter((m) => {
            if (m.direction !== "inbound" || m.read_at) return false
            if (key === "all" || key === "unread") return true
            return m.channel === key
          }).length
          return (
            <button
              key={key}
              onClick={() => { setFilter(key as typeof filter); setActiveThread(null) }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                filter === key ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{label}</span>
              {unread > 0 && (
                <span
                  className={cn(
                    "inline-flex min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums",
                    filter === key ? "bg-accent text-accent-foreground" : "bg-accent/90 text-accent-foreground"
                  )}
                >
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 min-h-[60vh]">
        {/* Conversations list */}
        <aside className="rounded-2xl border border-foreground/10 bg-card overflow-hidden flex flex-col">
          {loading && conversations.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">Завантаження…</div>
          )}
          {!loading && conversations.length === 0 && (
            <div className="p-12 text-center text-sm text-muted-foreground">
              <InboxIcon size={32} className="mx-auto mb-2 text-muted-foreground/50" />
              Поки немає повідомлень.
            </div>
          )}
          <div className="overflow-y-auto max-h-[70vh] divide-y divide-foreground/5">
            {conversations.map((c) => {
              const Icon = CHANNEL_ICON[c.channel]
              const isActive = c.key === activeThread
              return (
                <button
                  key={c.key}
                  onClick={() => {
                    setActiveThread(c.key)
                    if (c.unreadCount > 0) {
                      markRead(c.messages.filter((m) => !m.read_at && m.direction === "inbound").map((m) => m.id))
                    }
                  }}
                  className={cn(
                    "w-full text-left p-3 hover:bg-foreground/[0.02] transition-colors",
                    isActive && "bg-accent/5",
                    c.unreadCount > 0 && !isActive && "bg-accent/[0.03]"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className={cn("mt-0.5 shrink-0", CHANNEL_COLOR[c.channel])}>
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm truncate">{c.customer?.name || "Невідомий"}</span>
                        {c.unreadCount > 0 && (
                          <span className="ml-auto rounded-full bg-accent text-accent-foreground px-1.5 text-[10px] font-semibold">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
                        <span>{COMM_CHANNEL_LABELS[c.channel]}</span>
                        <span>·</span>
                        <span>{formatRelative(c.lastMsg.created_at)}</span>
                      </div>
                      <p className="text-xs text-foreground/70 line-clamp-2 break-words [overflow-wrap:anywhere]">
                        {c.lastMsg.direction === "outbound" && "→ "}
                        {c.lastMsg.body || "(без тексту)"}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        {/* Active conversation */}
        <section className="rounded-2xl border border-foreground/10 bg-card flex flex-col overflow-hidden">
          {!active ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground p-8 text-center">
              Виберіть розмову зліва ←
            </div>
          ) : (
            <ConversationView conversation={active} onSent={load} />
          )}
        </section>
      </div>
    </div>
  )
}

function ConversationView({
  conversation,
  onSent,
}: {
  conversation: { key: string; customer?: Comm["customers"]; channel: CommChannel; messages: Comm[] }
  onSent: () => void
}) {
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  // Reply through the channel the customer wrote from by default,
  // but let the operator pick a different one. Useful when the
  // inbound was via SMS but you want to reply by email, etc.
  const [replyChannel, setReplyChannel] = useState<CommChannel>(conversation.channel)
  // If conversation prop swaps (user clicks another thread), reset
  // the channel back to that thread's inbound channel.
  useEffect(() => {
    setReplyChannel(conversation.channel)
  }, [conversation.key, conversation.channel])

  const sorted = [...conversation.messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  const send = async () => {
    if (!draft.trim() || !conversation.customer) return
    setSending(true)
    setError(null)
    setSuccess(false)
    try {
      const r = await authedFetch("/api/crm/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: conversation.customer.id,
          channel: replyChannel,
          body: draft,
          subject: replyChannel === "email" ? `Re: ${sorted[0]?.subject || "питання"}` : undefined,
        }),
      })
      const j = await r.json()
      if (!r.ok || !j.ok) {
        setError(j.error || "Не вдалось надіслати")
        return
      }
      setDraft("")
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
      onSent()
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <header className="flex items-center justify-between gap-3 px-5 py-3 border-b border-foreground/5">
        <div>
          <div className="font-semibold">{conversation.customer?.name || "Невідомий"}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5 flex-wrap">
            <span>{COMM_CHANNEL_LABELS[conversation.channel]}</span>
            {conversation.customer?.phone && conversation.customer.phone !== "—" && (
              <>
                <span>·</span>
                <a href={`tel:${conversation.customer.phone.replace(/\s+/g, "")}`} className="hover:text-foreground">
                  <Phone size={11} className="inline mr-1" />{conversation.customer.phone}
                </a>
              </>
            )}
          </div>
        </div>
        {conversation.customer && (
          <Link
            href={`/admin/customers/${conversation.customer.id}`}
            className="rounded-full border border-foreground/15 px-3 py-1 text-xs hover:bg-foreground/5 inline-flex items-center gap-1"
          >
            Картка <ExternalLink size={11} />
          </Link>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {sorted.map((m) => (
          <div key={m.id} className={cn("flex", m.direction === "outbound" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-soft",
                m.direction === "outbound"
                  ? "rounded-br-md bg-foreground text-background"
                  : "rounded-bl-md bg-foreground/5"
              )}
            >
              {m.subject && m.channel === "email" && (
                <div className={cn("text-xs font-semibold mb-1 pb-1 border-b", m.direction === "outbound" ? "border-background/20" : "border-foreground/10")}>
                  {m.subject}
                </div>
              )}
              <div className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] leading-relaxed">{m.body || "—"}</div>
              <div className={cn("mt-1.5 text-[10px]", m.direction === "outbound" ? "text-background/60" : "text-muted-foreground")}>
                {formatDateTime(m.created_at)}
                {m.direction === "outbound" ? " · вихідне" : " · вхідне"}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-foreground/5 p-4">
        {error && (
          <div className="mb-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive flex items-center gap-2">
            <AlertCircle size={14} /> {error}
          </div>
        )}
        {success && (
          <div className="mb-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
            ✓ Надіслано через {COMM_CHANNEL_LABELS[replyChannel]}
          </div>
        )}

        {/* Channel picker — defaults to the thread's inbound channel.
           Operators can override per-message (e.g. customer wrote via
           SMS but the operator wants a longer reply over email). */}
        <ReplyChannelPicker
          current={replyChannel}
          inboundChannel={conversation.channel}
          customer={conversation.customer ?? null}
          onPick={setReplyChannel}
        />

        <div className="mt-2 flex items-end gap-2 rounded-2xl bg-foreground/[0.04] p-2 focus-within:ring-2 focus-within:ring-foreground/10">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder={`Відповідь у ${COMM_CHANNEL_LABELS[replyChannel]}…`}
            rows={2}
            className="flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            style={{ maxHeight: 200 }}
          />
          <Button onClick={send} disabled={!draft.trim() || sending} size="sm" className="rounded-full gap-1.5">
            <Reply size={14} />
            {sending ? "..." : "Надіслати"}
          </Button>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Enter — надіслати, Shift+Enter — новий рядок
        </p>
      </div>
    </>
  )
}

// ----------------------------------------------------------------
// Channel picker for the reply form. Defaults to inboundChannel
// (the channel the customer wrote from). Operators can switch.
//
// Filters the chip list to channels the customer has an identifier
// for — no point offering Instagram if we don't have their PSID.
// ----------------------------------------------------------------
function ReplyChannelPicker({
  current,
  inboundChannel,
  customer,
  onPick,
}: {
  current: CommChannel
  inboundChannel: CommChannel
  customer: { id: string; name: string; phone: string; email?: string | null } | null
  onPick: (c: CommChannel) => void
}) {
  // Compute reachable channels client-side from what we already have
  // on the customer record. site_chat / phone / manual are always
  // available; channel-specific identifiers are best-effort.
  const reachable: CommChannel[] = ["site_chat"]
  if (customer?.email) reachable.push("email")
  if (customer?.phone && customer.phone !== "—") {
    reachable.push("whatsapp")
    reachable.push("viber")
    reachable.push("sms")
  }
  // The inbound channel is always reachable — by definition we have an
  // identifier (we just received a message on it).
  if (!reachable.includes(inboundChannel)) reachable.push(inboundChannel)
  // Telegram/Instagram identifiers live in customers.channels JSON
  // which we don't pull here. Include them only if the inbound was
  // that channel (otherwise they'd 400 on send).
  if (inboundChannel === "telegram" && !reachable.includes("telegram")) reachable.push("telegram")
  if (inboundChannel === "instagram" && !reachable.includes("instagram")) reachable.push("instagram")

  // Stable display order
  const order: CommChannel[] = ["telegram", "whatsapp", "instagram", "viber", "email", "sms", "site_chat"]
  const visible = order.filter((c) => reachable.includes(c))

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] text-muted-foreground mr-1">Відповісти через:</span>
      {visible.map((c) => {
        const Icon = CHANNEL_ICON[c]
        const isCurrent = c === current
        const isInbound = c === inboundChannel
        return (
          <button
            key={c}
            type="button"
            onClick={() => onPick(c)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors",
              isCurrent
                ? "border-foreground bg-foreground text-background"
                : "border-foreground/15 bg-background text-foreground/70 hover:border-foreground/30"
            )}
            title={isInbound ? "Канал, з якого писав клієнт (за замовчуванням)" : `Відповісти у ${COMM_CHANNEL_LABELS[c]}`}
          >
            <Icon size={11} className={isCurrent ? "" : CHANNEL_COLOR[c]} />
            <span>{COMM_CHANNEL_LABELS[c]}</span>
            {isInbound && (
              <span className={cn("text-[9px]", isCurrent ? "opacity-70" : "text-muted-foreground")}>
                ←
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
