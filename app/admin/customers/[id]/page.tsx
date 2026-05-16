"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Phone, Mail, MapPin, MessageSquare, FileText, CreditCard, Bell, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchCustomerOverview } from "@/lib/crm/store"
import { formatUAH, formatDateTime, formatRelative } from "@/lib/admin-format"
import {
  COMM_CHANNEL_LABELS,
  DEAL_STATUS_LABELS_UK,
  DOCUMENT_KIND_LABELS_UK,
  PAYMENT_KIND_LABELS_UK,
  PAYMENT_METHOD_LABELS_UK,
  REMINDER_KIND_LABELS_UK,
} from "@/lib/crm/types"
import type {
  Customer,
  Deal,
  DealEvent,
  Reminder,
  Communication,
  Document,
  Payment,
} from "@/lib/crm/types"
import { ActivityTimeline } from "@/components/admin/activity-timeline"

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [data, setData] = useState<{
    customer: Customer
    deals: Deal[]
    reminders: Reminder[]
    communications: Communication[]
    documents: Document[]
    payments: Payment[]
    dealEvents: DealEvent[]
    totalLifetimeValue: number
    openDealsCount: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = () => {
    fetchCustomerOverview(id).then((r) => {
      setData(r)
      setLoading(false)
    })
  }

  useEffect(() => {
    refresh()
  }, [id])

  if (loading) return <div className="text-sm text-muted-foreground">Завантаження…</div>
  if (!data) return <div className="text-sm text-destructive">Клієнта не знайдено</div>

  const c = data.customer

  return (
    <div className="space-y-6">
      <Link href="/admin/customers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> До списку клієнтів
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-foreground/10 bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground/5 text-2xl font-semibold">
              {c.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight-custom">{c.name}</h1>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <a href={`tel:${c.phone.replace(/\s+/g, "")}`} className="inline-flex items-center gap-1 hover:text-foreground">
                  <Phone size={13} /> {c.phone}
                </a>
                {c.email && (
                  <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 hover:text-foreground">
                    <Mail size={13} /> {c.email}
                  </a>
                )}
                {c.city && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={13} /> {c.city}{c.country ? `, ${c.country}` : ""}
                  </span>
                )}
                <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-xs">{c.locale.toUpperCase()}</span>
                {c.do_not_contact && (
                  <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">Не контактувати</span>
                )}
              </div>
              {c.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.tags.map((t) => (
                    <span key={t} className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Stat label="Угод" value={c.deal_count} />
            <Stat label="Активних" value={data.openDealsCount} highlight />
            <Stat label="LTV" value={formatUAH(data.totalLifetimeValue)} />
          </div>
        </div>
      </div>

      {/* Notes inline editing */}
      <NotesEditor customer={c} onSaved={refresh} />

      {/* Unified activity timeline — chronological feed of every interaction
         (incoming/outgoing messages across all channels, status changes,
         payments, document creations, fired reminders, deal milestones). */}
      <Section
        title="Стрічка активності"
        icon={<Activity size={16} />}
        count={
          data.communications.length +
          data.payments.length +
          data.documents.length +
          data.dealEvents.length
        }
      >
        <ActivityTimeline
          sources={{
            communications: data.communications,
            payments: data.payments,
            documents: data.documents,
            dealEvents: data.dealEvents,
            reminders: data.reminders,
            deals: data.deals,
          }}
          limit={40}
          emptyText="Поки немає активності. Як тільки клієнт напише або з'явиться угода — все з'явиться тут."
        />
      </Section>

      {/* Deals */}
      <Section title="Угоди" icon={<FileText size={16} />} count={data.deals.length}>
        {data.deals.length === 0 ? (
          <Empty text="Угод поки немає. Створи нову вище →" />
        ) : (
          <div className="divide-y divide-foreground/5">
            {data.deals.map((d) => (
              <Link key={d.id} href={`/admin/deals/${d.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-foreground/[0.02]">
                <span className="font-mono text-sm font-medium tabular-nums">{d.reference}</span>
                <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-xs">{DEAL_STATUS_LABELS_UK[d.status]}</span>
                <span className="ml-auto text-sm font-medium tabular-nums">{formatUAH(Number(d.amount_eur))}</span>
                <span className="text-xs text-muted-foreground">{formatRelative(d.created_at)}</span>
              </Link>
            ))}
          </div>
        )}
      </Section>

      {/* Reminders */}
      <Section title="Нагадування" icon={<Bell size={16} />} count={data.reminders.length}>
        {data.reminders.length === 0 ? (
          <Empty text="Активних нагадувань немає." />
        ) : (
          <div className="divide-y divide-foreground/5">
            {data.reminders.map((r) => (
              <div key={r.id} className="px-4 py-3 text-sm flex items-center gap-3">
                <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-xs">{REMINDER_KIND_LABELS_UK[r.kind]}</span>
                <span className="flex-1">{r.title}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{formatDateTime(r.due_at)}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Communications */}
      <Section title="Комунікація" icon={<MessageSquare size={16} />} count={data.communications.length}>
        {data.communications.length === 0 ? (
          <Empty text="Поки немає переписки." />
        ) : (
          <div className="divide-y divide-foreground/5">
            {data.communications.slice(0, 30).map((m) => (
              <div key={m.id} className="px-4 py-3 text-sm">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <span className="rounded-full bg-foreground/5 px-2 py-0.5">{COMM_CHANNEL_LABELS[m.channel]}</span>
                  <span>{m.direction === "inbound" ? "← вхідне" : "→ вихідне"}</span>
                  <span className="ml-auto">{formatRelative(m.created_at)}</span>
                </div>
                {m.subject && <div className="font-medium mb-0.5">{m.subject}</div>}
                <div className="text-foreground/80 whitespace-pre-wrap">{m.body}</div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Documents */}
      <Section title="Документи" icon={<FileText size={16} />} count={data.documents.length}>
        {data.documents.length === 0 ? (
          <Empty text="Документів ще не створено." />
        ) : (
          <div className="divide-y divide-foreground/5">
            {data.documents.map((d) => (
              <a key={d.id} href={d.public_url || "#"} target="_blank" rel="noreferrer"
                 className="flex items-center gap-4 px-4 py-3 text-sm hover:bg-foreground/[0.02]">
                <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-xs">{DOCUMENT_KIND_LABELS_UK[d.kind]}</span>
                <span className="font-mono">{d.number}</span>
                <span className="ml-auto text-xs text-muted-foreground">v{d.version} · {formatRelative(d.created_at)}</span>
              </a>
            ))}
          </div>
        )}
      </Section>

      {/* Payments */}
      <Section title="Платежі" icon={<CreditCard size={16} />} count={data.payments.length}>
        {data.payments.length === 0 ? (
          <Empty text="Платежів немає." />
        ) : (
          <div className="divide-y divide-foreground/5">
            {data.payments.map((p) => (
              <div key={p.id} className="px-4 py-3 text-sm flex items-center gap-3">
                <span className={`rounded-full px-2 py-0.5 text-xs ${p.kind === "refund" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                  {PAYMENT_KIND_LABELS_UK[p.kind]}
                </span>
                <span className="text-muted-foreground">{PAYMENT_METHOD_LABELS_UK[p.method]}</span>
                {p.reference && <span className="font-mono text-xs text-muted-foreground">{p.reference}</span>}
                <span className="ml-auto font-medium tabular-nums">{formatUAH(Number(p.amount_eur))}</span>
                <span className="text-xs text-muted-foreground">{formatDateTime(p.paid_at)}</span>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 text-right ${highlight ? "border-accent/30 bg-accent/5" : "border-foreground/10"}`}>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  )
}

function Section({ title, icon, count, children }: { title: string; icon: React.ReactNode; count: number; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-foreground/10 bg-card overflow-hidden">
      <header className="flex items-center gap-2 px-4 py-3 border-b border-foreground/5 bg-foreground/[0.02]">
        {icon}
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">{count}</span>
      </header>
      {children}
    </section>
  )
}

function Empty({ text }: { text: string }) {
  return <div className="px-4 py-8 text-center text-sm text-muted-foreground">{text}</div>
}

function NotesEditor({ customer, onSaved }: { customer: Customer; onSaved: () => void }) {
  const [notes, setNotes] = useState(customer.notes || "")
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      const { authedFetch } = await import("@/lib/authed-fetch")
      await authedFetch(`/api/crm/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      })
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Section title="Нотатки про клієнта" icon={<MessageSquare size={16} />} count={notes.length}>
      <div className="p-4 space-y-2">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Особисті подробиці, історія, побажання…"
          className="w-full rounded-xl border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
        />
        <Button onClick={save} disabled={saving || notes === (customer.notes || "")} size="sm" className="rounded-xl">
          {saving ? "Зберігаю…" : "Зберегти"}
        </Button>
      </div>
    </Section>
  )
}
