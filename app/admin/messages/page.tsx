"use client"

import { useMemo, useState } from "react"
import { Facebook, Instagram, Send, Globe, CheckCheck, Archive, Phone, ExternalLink, Trash2 } from "lucide-react"
import { useMessagesStore, useMessages, type Message, type MessageChannel, type MessageStatus } from "@/lib/store/messages"
import { cn } from "@/lib/utils"

const channelIcon: Record<MessageChannel, React.ComponentType<{ size?: number; className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
  telegram: Send,
  site: Globe,
}

const channelColor: Record<MessageChannel, string> = {
  facebook: "text-[#1877F2]",
  instagram: "text-[#E1306C]",
  telegram: "text-[#229ED9]",
  site: "text-foreground/70",
}

const statusLabel: Record<MessageStatus, string> = {
  new: "Нові",
  read: "Прочитані",
  replied: "З відповіддю",
  archived: "Архів",
}

function timeAgo(at: number): string {
  const s = Math.round((Date.now() - at) / 1000)
  if (s < 60) return `${s}с`
  if (s < 3600) return `${Math.round(s / 60)}хв`
  if (s < 86400) return `${Math.round(s / 3600)}г`
  return `${Math.round(s / 86400)}д`
}

export default function AdminMessagesPage() {
  const messages = useMessages()
  const setStatus = useMessagesStore((s) => s.setStatus)
  const remove = useMessagesStore((s) => s.remove)

  const [filterChannel, setFilterChannel] = useState<"all" | MessageChannel>("all")
  const [filterStatus, setFilterStatus] = useState<"all" | MessageStatus>("all")

  const filtered = useMemo(
    () =>
      messages.filter(
        (m) =>
          (filterChannel === "all" || m.channel === filterChannel) &&
          (filterStatus === "all" || m.status === filterStatus)
      ),
    [messages, filterChannel, filterStatus]
  )

  const counts = useMemo(() => {
    const c = { new: 0, read: 0, replied: 0, archived: 0, total: messages.length }
    for (const m of messages) c[m.status]++
    return c
  }, [messages])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight-custom">Повідомлення</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Усі повідомлення з Facebook, Instagram, Telegram і сайту в одному місці. Натискайте «Відкрити діалог» — ви потрапите в той же чат на платформі, де писали.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Нові" value={counts.new} highlight />
        <Stat label="Прочитані" value={counts.read} />
        <Stat label="З відповіддю" value={counts.replied} />
        <Stat label="Архів" value={counts.archived} />
        <Stat label="Всього" value={counts.total} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-full bg-foreground/5 p-1">
          {(["all", "facebook", "instagram", "telegram", "site"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setFilterChannel(c)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                filterChannel === c
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {c === "all" ? "Всі канали" : c === "site" ? "Сайт" : c}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-full bg-foreground/5 p-1">
          {(["all", "new", "read", "replied", "archived"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                filterStatus === s
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s === "all" ? "Усі" : statusLabel[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-foreground/15 p-12 text-center text-sm text-muted-foreground">
            Повідомлень немає
          </div>
        ) : (
          filtered.map((m) => <MessageCard key={m.id} m={m} onStatus={setStatus} onRemove={remove} />)
        )}
      </div>

      <section className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">Як підключити справжню синхронізацію:</strong>{" "}
          Facebook/Instagram — через Meta Graph API + webhook на <code>/api/webhooks/meta</code>. Telegram — через Bot API webhook на <code>/api/telegram</code> (уже налаштовано). Додайте токени в <code>.env.local</code>: <code>META_PAGE_TOKEN</code>, <code>META_VERIFY_TOKEN</code>, <code>TELEGRAM_BOT_TOKEN</code>, <code>TELEGRAM_WEBHOOK_SECRET</code>.
        </p>
      </section>
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={cn("rounded-2xl border border-foreground/10 p-4", highlight && value > 0 ? "bg-accent/10 border-accent/30" : "bg-card")}>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-2xl font-semibold tabular-nums", highlight && value > 0 && "text-accent")}>{value}</div>
    </div>
  )
}

function MessageCard({
  m,
  onStatus,
  onRemove,
}: {
  m: Message
  onStatus: (id: string, s: MessageStatus) => void
  onRemove: (id: string) => void
}) {
  const Icon = channelIcon[m.channel]
  const channelColorClass = channelColor[m.channel]

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-foreground/10 bg-card p-5 md:flex-row md:items-start md:gap-4">
      <div className="flex items-center gap-3 md:flex-col md:items-start md:w-40 md:flex-shrink-0">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-foreground/5", channelColorClass)}>
          <Icon size={18} />
        </div>
        <div>
          <div className="text-sm font-semibold leading-tight">{m.sender}</div>
          <div className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
            {m.channel} · {timeAgo(m.at)}
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap">{m.text}</p>
        {m.phone && (
          <a href={`tel:${m.phone.replace(/\s+/g, "")}`} className="mt-2 inline-flex items-center gap-1.5 text-sm text-accent hover:brightness-110">
            <Phone size={14} strokeWidth={1.75} /> {m.phone}
          </a>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 md:flex-col md:w-44 md:flex-shrink-0">
        {m.threadUrl && (
          <a
            href={m.threadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-xs font-medium text-background hover:bg-foreground/90"
          >
            <ExternalLink size={12} /> Відкрити діалог
          </a>
        )}
        {m.status !== "replied" && (
          <button
            onClick={() => onStatus(m.id, "replied")}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-success/10 px-3 py-2 text-xs font-medium text-success hover:bg-success/20"
          >
            <CheckCheck size={12} /> Позначити відповіданим
          </button>
        )}
        {m.status !== "archived" && (
          <button
            onClick={() => onStatus(m.id, "archived")}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-foreground/5 px-3 py-2 text-xs font-medium text-foreground/70 hover:bg-foreground/10"
          >
            <Archive size={12} /> В архів
          </button>
        )}
        <button
          onClick={() => onRemove(m.id)}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-destructive/80 hover:bg-destructive/10"
        >
          <Trash2 size={12} /> Видалити
        </button>
      </div>
    </div>
  )
}
