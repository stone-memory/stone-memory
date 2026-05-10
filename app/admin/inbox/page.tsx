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
    await authedFetch("/api/crm/communications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
    load()
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

      <div className="flex flex-wrap gap-1 rounded-full bg-foreground/5 p-1 w-fit">
        {(
          [
            ["all", "Усе"],
            ["unread", "Непрочитані"],
            ["site_chat", "Сайт"],
            ["telegram", "Telegram"],
            ["whatsapp", "WhatsApp"],
            ["instagram", "Instagram"],
            ["email", "Email"],
            ["sms", "SMS"],
            ["phone", "Дзвінки"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setFilter(key as typeof filter); setActiveThread(null) }}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              filter === key ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
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
                      <p className="text-xs text-foreground/70 line-clamp-2">
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
          channel: conversation.channel,
          body: draft,
          subject: conversation.channel === "email" ? `Re: ${sorted[0]?.subject || "питання"}` : undefined,
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
              <div className="whitespace-pre-wrap leading-relaxed">{m.body || "—"}</div>
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
            ✓ Надіслано через {COMM_CHANNEL_LABELS[conversation.channel]}
          </div>
        )}
        <div className="flex items-end gap-2 rounded-2xl bg-foreground/[0.04] p-2 focus-within:ring-2 focus-within:ring-foreground/10">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder={`Відповідь у ${COMM_CHANNEL_LABELS[conversation.channel]}…`}
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
