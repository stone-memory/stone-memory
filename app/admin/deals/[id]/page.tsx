"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, CreditCard, Bell, Phone, Mail, MessageSquare, Plus, Download, Hammer, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authedFetch } from "@/lib/authed-fetch"
import { fetchDealOverview } from "@/lib/crm/store"
import { formatUAH, formatDateTime, formatRelative, eurHint } from "@/lib/admin-format"
import {
  DEAL_STATUS_LABELS_UK,
  PAYMENT_KIND_LABELS_UK,
  PAYMENT_METHOD_LABELS_UK,
  DOCUMENT_KIND_LABELS_UK,
  REMINDER_KIND_LABELS_UK,
  COMM_CHANNEL_LABELS,
  availableTransitions,
  lostReasonLabel,
  type DealStatus,
  type LostReason,
  type PaymentKind,
  type PaymentMethod,
  type DocumentKind,
} from "@/lib/crm/types"
import { LostReasonModal } from "@/components/admin/lost-reason-modal"

type Overview = NonNullable<Awaited<ReturnType<typeof fetchDealOverview>>>

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [data, setData] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    const r = await fetchDealOverview(id)
    setData(r)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [id])

  // When the user clicks "Скасовано" or "Втрачено" we open a modal first to
  // capture the reason. All other status transitions go through immediately.
  const [lostModal, setLostModal] = useState<null | "cancelled" | "lost">(null)
  const [savingClose, setSavingClose] = useState(false)

  const patchDeal = async (body: Record<string, unknown>): Promise<boolean> => {
    setError(null)
    const r = await authedFetch(`/api/crm/deals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const j = await r.json()
    if (!r.ok) {
      setError(j.error || "помилка")
      return false
    }
    return true
  }

  const changeStatus = async (next: DealStatus) => {
    if (next === "cancelled" || next === "lost") {
      setLostModal(next)
      return
    }
    if (await patchDeal({ status: next })) refresh()
  }

  const confirmClose = async (payload: { lost_reason: LostReason; lost_reason_note: string | null }) => {
    if (!lostModal) return
    setSavingClose(true)
    try {
      const ok = await patchDeal({
        status: lostModal,
        lost_reason: payload.lost_reason,
        lost_reason_note: payload.lost_reason_note,
      })
      if (ok) {
        setLostModal(null)
        refresh()
      }
    } finally {
      setSavingClose(false)
    }
  }

  if (loading) return <div className="text-sm text-muted-foreground">Завантаження…</div>
  if (!data) return <div className="text-sm text-destructive">Угоду не знайдено</div>

  const d = data.deal
  const customer = d.customers
  const transitions = availableTransitions(d.status)

  return (
    <div className="space-y-6">
      <Link href="/admin/deals" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> До канбану угод
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-foreground/10 bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="font-mono text-sm text-muted-foreground">{d.reference}</div>
            <h1 className="text-2xl font-semibold tracking-tight-custom mt-1">
              {customer?.name || "—"}
            </h1>
            {customer && (
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <a href={`tel:${customer.phone.replace(/\s+/g, "")}`} className="inline-flex items-center gap-1 hover:text-foreground">
                  <Phone size={13} /> {customer.phone}
                </a>
                {customer.email && (
                  <a href={`mailto:${customer.email}`} className="inline-flex items-center gap-1 hover:text-foreground">
                    <Mail size={13} /> {customer.email}
                  </a>
                )}
                <Link href={`/admin/customers/${customer.id}`} className="text-accent hover:underline">→ картка клієнта</Link>
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3 min-w-[300px]">
            <Stat label="Сума" value={formatUAH(Number(d.amount_eur))} hint={eurHint(Number(d.amount_eur))} />
            <Stat label="Сплачено" value={formatUAH(Number(d.paid_eur))} hint={eurHint(Number(d.paid_eur))} />
            <Stat label="Залишок" value={formatUAH(Number(d.balance_eur))} hint={eurHint(Number(d.balance_eur))} highlight={Number(d.balance_eur) > 0} />
          </div>
        </div>

        {/* State machine controls */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-muted-foreground mr-1">Статус:</span>
          <span className="rounded-full bg-foreground text-background px-3 py-1 text-sm font-medium">
            {DEAL_STATUS_LABELS_UK[d.status]}
          </span>
          <span className="text-muted-foreground">→</span>
          {transitions.length === 0 && <span className="text-xs text-muted-foreground italic">Кінцевий стан</span>}
          {transitions.map((t) => (
            <button
              key={t}
              onClick={() => changeStatus(t)}
              className="rounded-full border border-foreground/15 bg-background px-3 py-1 text-xs font-medium hover:border-foreground hover:-translate-y-px transition-all"
            >
              {DEAL_STATUS_LABELS_UK[t]}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
        )}

        {/* Closed-reason badge — shows up once a deal has been moved to
           cancelled/lost. Gives at-a-glance context on why the deal didn't go
           through, plus any free-text elaboration the user added. */}
        {(d.status === "cancelled" || d.status === "lost") && d.lost_reason && (
          <div className="mt-4 rounded-xl border border-foreground/10 bg-foreground/[0.02] px-4 py-3">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Причина {d.status === "lost" ? "втрати" : "скасування"}
            </div>
            <div className="mt-1 text-sm font-medium">{lostReasonLabel(d.lost_reason)}</div>
            {d.lost_reason_note && (
              <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{d.lost_reason_note}</p>
            )}
          </div>
        )}

        {d.description && <p className="mt-4 text-sm text-foreground/85">{d.description}</p>}
      </div>

      <LostReasonModal
        open={lostModal !== null}
        targetStatus={lostModal ?? "cancelled"}
        busy={savingClose}
        onCancel={() => setLostModal(null)}
        onConfirm={confirmClose}
      />

      {/* Items */}
      <Section title="Позиції угоди" icon={<FileText size={16} />} count={data.items.length}>
        {data.items.length === 0 ? (
          <Empty text="Позицій ще не додано." />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left">Назва</th>
                <th className="px-4 py-2 text-right">К-сть</th>
                <th className="px-4 py-2 text-right">Ціна</th>
                <th className="px-4 py-2 text-right">Сума</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {data.items.map((it) => (
                <tr key={it.id}>
                  <td className="px-4 py-2">{it.title}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{it.qty}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{formatUAH(Number(it.unit_price_eur))}</td>
                  <td className="px-4 py-2 text-right tabular-nums font-medium">{formatUAH(Number(it.total_eur))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      {/* Documents — generation */}
      <DocumentsBlock dealId={id} documents={data.documents} onChanged={refresh} />

      {/* Production stages */}
      <ProductionStagesBlock dealId={id} stages={data.productionStages} onChanged={refresh} />

      {/* Payments */}
      <PaymentsBlock dealId={id} customerId={d.customer_id} payments={data.payments} onChanged={refresh} />

      {/* Reminders */}
      <RemindersBlock dealId={id} customerId={d.customer_id} reminders={data.reminders} onChanged={refresh} />

      {/* Communications */}
      <Section title="Комунікація" icon={<MessageSquare size={16} />} count={data.communications.length}>
        {data.communications.length === 0 ? (
          <Empty text="Поки немає переписки по цій угоді." />
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

      {/* Timeline */}
      <Section title="Історія угоди" icon={<MessageSquare size={16} />} count={data.events.length}>
        <div className="divide-y divide-foreground/5">
          {data.events.map((e) => (
            <div key={e.id} className="px-4 py-2 text-sm flex items-center gap-3">
              <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] uppercase tracking-wide">{e.kind}</span>
              <span className="flex-1 text-foreground/85">
                {e.kind === "status_change" && e.from_status && e.to_status
                  ? `${DEAL_STATUS_LABELS_UK[e.from_status]} → ${DEAL_STATUS_LABELS_UK[e.to_status]}`
                  : e.message || "—"}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">{formatDateTime(e.created_at)}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

function Stat({ label, value, hint, highlight }: { label: string; value: string; hint?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 text-right ${highlight ? "border-amber-500/30 bg-amber-500/5" : "border-foreground/10"}`}>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
      {hint && <div className="text-[10px] text-muted-foreground">{hint}</div>}
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

// ----- Documents block -----
function DocumentsBlock({ dealId, documents, onChanged }: { dealId: string; documents: Overview["documents"]; onChanged: () => void }) {
  const [busy, setBusy] = useState<DocumentKind | null>(null)
  const generate = async (kind: DocumentKind) => {
    setBusy(kind)
    try {
      const r = await authedFetch("/api/crm/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deal_id: dealId, kind }),
      })
      if (r.ok) onChanged()
    } finally {
      setBusy(null)
    }
  }
  return (
    <Section title="Документи" icon={<FileText size={16} />} count={documents.length}>
      <div className="px-4 py-3 flex flex-wrap gap-2 border-b border-foreground/5">
        {(["quote", "contract", "invoice"] as const).map((kind) => (
          <Button
            key={kind}
            size="sm"
            variant="outline"
            onClick={() => generate(kind)}
            disabled={busy !== null}
            className="rounded-full text-xs gap-1.5"
          >
            <Plus size={12} /> {DOCUMENT_KIND_LABELS_UK[kind]}
          </Button>
        ))}
      </div>
      {documents.length === 0 ? (
        <Empty text="Поки немає документів. Згенеруй вище." />
      ) : (
        <div className="divide-y divide-foreground/5">
          {documents.map((d) => (
            <a
              key={d.id}
              href={d.public_url || "#"}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-foreground/[0.02]"
            >
              <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-xs">{DOCUMENT_KIND_LABELS_UK[d.kind]}</span>
              <span className="font-mono">{d.number}</span>
              <span className="text-xs text-muted-foreground">v{d.version}</span>
              <span className="ml-auto text-xs text-muted-foreground">{formatRelative(d.created_at)}</span>
              <Download size={14} className="text-muted-foreground" />
            </a>
          ))}
        </div>
      )}
    </Section>
  )
}

// ----- Production stages block -----
const PROD_STAGE_KIND_LABELS: Record<string, string> = {
  raw_material: "Сировина",
  cutting: "Розпил",
  grinding: "Шліфування",
  polishing: "Полірування",
  engraving: "Гравіювання",
  sealing: "Герметизація",
  qc: "Контроль якості",
  packaging: "Пакування",
  transport: "Транспорт",
  foundation: "Фундамент",
  installation: "Монтаж",
  cleanup: "Прибирання",
}
const PROD_STAGE_KINDS = Object.keys(PROD_STAGE_KIND_LABELS)
const PROD_STAGE_STATUSES: { v: string; label: string; cls: string }[] = [
  { v: "pending", label: "Очікує", cls: "bg-foreground/10 text-muted-foreground" },
  { v: "in_progress", label: "В роботі", cls: "bg-amber-500/15 text-amber-700" },
  { v: "done", label: "Готово", cls: "bg-success/15 text-success" },
  { v: "failed", label: "Збій", cls: "bg-red-500/15 text-red-600" },
]

function ProductionStagesBlock({
  dealId,
  stages,
  onChanged,
}: {
  dealId: string
  stages: Overview["productionStages"]
  onChanged: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [addKind, setAddKind] = useState(PROD_STAGE_KINDS[0])

  const seed = async () => {
    setBusy(true)
    try {
      const r = await authedFetch("/api/crm/production-stages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deal_id: dealId, seed: true }),
      })
      if (r.ok) onChanged()
    } finally {
      setBusy(false)
    }
  }
  const addOne = async () => {
    setBusy(true)
    try {
      const r = await authedFetch("/api/crm/production-stages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deal_id: dealId, kind: addKind }),
      })
      if (r.ok) onChanged()
    } finally {
      setBusy(false)
    }
  }
  const setStatus = async (id: string, status: string) => {
    setBusy(true)
    try {
      const r = await authedFetch(`/api/crm/production-stages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (r.ok) onChanged()
    } finally {
      setBusy(false)
    }
  }
  const remove = async (id: string) => {
    setBusy(true)
    try {
      const r = await authedFetch(`/api/crm/production-stages/${id}`, { method: "DELETE" })
      if (r.ok) onChanged()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Section title="Виробництво" icon={<Hammer size={16} />} count={stages.length}>
      <div className="px-4 py-3 flex flex-wrap items-center gap-2 border-b border-foreground/5">
        {stages.length === 0 && (
          <Button size="sm" variant="outline" onClick={seed} disabled={busy} className="rounded-full text-xs gap-1.5">
            <Plus size={12} /> Стандартний цикл
          </Button>
        )}
        <select
          value={addKind}
          onChange={(e) => setAddKind(e.target.value)}
          disabled={busy}
          className="h-8 rounded-full bg-foreground/5 px-3 text-xs"
        >
          {PROD_STAGE_KINDS.map((k) => (
            <option key={k} value={k}>{PROD_STAGE_KIND_LABELS[k]}</option>
          ))}
        </select>
        <Button size="sm" variant="outline" onClick={addOne} disabled={busy} className="rounded-full text-xs gap-1.5">
          <Plus size={12} /> Додати етап
        </Button>
      </div>
      {stages.length === 0 ? (
        <Empty text="Етапів виробництва ще немає. Додай стандартний цикл або окремий етап." />
      ) : (
        <div className="divide-y divide-foreground/5">
          {stages.map((s) => {
            const st = PROD_STAGE_STATUSES.find((x) => x.v === s.status) || PROD_STAGE_STATUSES[0]
            return (
              <div key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                <span className="font-medium min-w-[120px]">
                  {PROD_STAGE_KIND_LABELS[s.kind] || s.kind}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${st.cls}`}>{st.label}</span>
                <select
                  value={s.status}
                  onChange={(e) => setStatus(s.id, e.target.value)}
                  disabled={busy}
                  className="h-7 rounded-lg bg-foreground/5 px-2 text-xs"
                >
                  {PROD_STAGE_STATUSES.map((x) => (
                    <option key={x.v} value={x.v}>{x.label}</option>
                  ))}
                </select>
                <span className="text-xs text-muted-foreground">
                  {s.completed_at
                    ? `завершено ${formatRelative(s.completed_at)}`
                    : s.started_at
                      ? `почато ${formatRelative(s.started_at)}`
                      : s.due_at
                        ? `до ${formatDateTime(s.due_at)}`
                        : ""}
                </span>
                <button
                  type="button"
                  onClick={() => remove(s.id)}
                  disabled={busy}
                  className="ml-auto text-muted-foreground hover:text-red-600"
                  aria-label="Видалити етап"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </Section>
  )
}

// ----- Payments block -----
function PaymentsBlock({
  dealId,
  customerId,
  payments,
  onChanged,
}: {
  dealId: string
  customerId: string
  payments: Overview["payments"]
  onChanged: () => void
}) {
  const [showAdd, setShowAdd] = useState(false)
  return (
    <Section title="Платежі" icon={<CreditCard size={16} />} count={payments.length}>
      <div className="px-4 py-3 border-b border-foreground/5">
        <Button onClick={() => setShowAdd(true)} size="sm" className="rounded-full text-xs gap-1.5">
          <Plus size={12} /> Платіж
        </Button>
      </div>
      {payments.length === 0 ? (
        <Empty text="Платежів ще немає." />
      ) : (
        <div className="divide-y divide-foreground/5">
          {payments.map((p) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <span className={`rounded-full px-2 py-0.5 text-xs ${p.kind === "refund" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                {PAYMENT_KIND_LABELS_UK[p.kind]}
              </span>
              <span className="text-muted-foreground text-xs">{PAYMENT_METHOD_LABELS_UK[p.method]}</span>
              {p.reference && <span className="font-mono text-xs text-muted-foreground">{p.reference}</span>}
              <span className="ml-auto font-medium tabular-nums">{formatUAH(Number(p.amount_eur))}</span>
              <span className="text-xs text-muted-foreground">{formatDateTime(p.paid_at)}</span>
            </div>
          ))}
        </div>
      )}
      {showAdd && <AddPaymentDialog dealId={dealId} customerId={customerId} onClose={() => { setShowAdd(false); onChanged() }} />}
    </Section>
  )
}

function AddPaymentDialog({ dealId, customerId, onClose }: { dealId: string; customerId: string; onClose: () => void }) {
  const [kind, setKind] = useState<PaymentKind>("deposit")
  const [method, setMethod] = useState<PaymentMethod>("bank_transfer")
  const [amount, setAmount] = useState("")
  const [ref, setRef] = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!amount) return
    setBusy(true)
    try {
      await authedFetch("/api/crm/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deal_id: dealId,
          customer_id: customerId,
          kind,
          method,
          amount_eur: Number(amount),
          reference: ref || undefined,
        }),
      })
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-foreground/10 bg-card p-6 shadow-hover" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">Реєстрація платежу</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">Тип</label>
            <select value={kind} onChange={(e) => setKind(e.target.value as PaymentKind)} className="h-10 w-full rounded-xl border border-foreground/10 bg-background px-3 text-sm">
              {(Object.keys(PAYMENT_KIND_LABELS_UK) as PaymentKind[]).map((k) => (
                <option key={k} value={k}>{PAYMENT_KIND_LABELS_UK[k]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">Метод</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} className="h-10 w-full rounded-xl border border-foreground/10 bg-background px-3 text-sm">
              {(Object.keys(PAYMENT_METHOD_LABELS_UK) as PaymentMethod[]).map((m) => (
                <option key={m} value={m}>{PAYMENT_METHOD_LABELS_UK[m]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">Сума, EUR *</label>
            <Input type="text" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">Референс (номер чеку)</label>
            <Input value={ref} onChange={(e) => setRef(e.target.value)} />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl">Скасувати</Button>
          <Button onClick={submit} disabled={!amount || busy} className="rounded-xl">
            {busy ? "..." : "Зареєструвати"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ----- Reminders block -----
function RemindersBlock({
  dealId,
  customerId,
  reminders,
  onChanged,
}: {
  dealId: string
  customerId: string
  reminders: Overview["reminders"]
  onChanged: () => void
}) {
  const [showAdd, setShowAdd] = useState(false)
  return (
    <Section title="Нагадування" icon={<Bell size={16} />} count={reminders.length}>
      <div className="px-4 py-3 border-b border-foreground/5">
        <Button onClick={() => setShowAdd(true)} size="sm" className="rounded-full text-xs gap-1.5">
          <Plus size={12} /> Нагадати
        </Button>
      </div>
      {reminders.length === 0 ? (
        <Empty text="Активних нагадувань немає." />
      ) : (
        <div className="divide-y divide-foreground/5">
          {reminders.map((r) => (
            <div key={r.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-xs">{REMINDER_KIND_LABELS_UK[r.kind]}</span>
              <span className="flex-1">{r.title}</span>
              <span className="text-xs text-muted-foreground">{formatDateTime(r.due_at)}</span>
            </div>
          ))}
        </div>
      )}
      {showAdd && <AddReminderDialog dealId={dealId} customerId={customerId} onClose={() => { setShowAdd(false); onChanged() }} />}
    </Section>
  )
}

function AddReminderDialog({ dealId, customerId, onClose }: { dealId: string; customerId: string; onClose: () => void }) {
  const [title, setTitle] = useState("")
  const [when, setWhen] = useState<"1h" | "tomorrow" | "3d" | "1w" | "custom">("tomorrow")
  const [customDate, setCustomDate] = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!title) return
    let dueAt: Date
    const now = new Date()
    if (when === "1h") dueAt = new Date(now.getTime() + 3600_000)
    else if (when === "tomorrow") {
      dueAt = new Date(now); dueAt.setDate(dueAt.getDate() + 1); dueAt.setHours(9, 0, 0, 0)
    }
    else if (when === "3d") {
      dueAt = new Date(now); dueAt.setDate(dueAt.getDate() + 3); dueAt.setHours(9, 0, 0, 0)
    }
    else if (when === "1w") {
      dueAt = new Date(now); dueAt.setDate(dueAt.getDate() + 7); dueAt.setHours(9, 0, 0, 0)
    }
    else { dueAt = new Date(customDate) }

    setBusy(true)
    try {
      await authedFetch("/api/crm/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deal_id: dealId, customer_id: customerId, title, due_at: dueAt.toISOString() }),
      })
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-foreground/10 bg-card p-6 shadow-hover" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">Нове нагадування</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">Що нагадати *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Передзвонити клієнту" autoFocus />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">Коли</label>
            <div className="flex flex-wrap gap-1">
              {(
                [
                  ["1h", "Через 1 год"],
                  ["tomorrow", "Завтра 9:00"],
                  ["3d", "Через 3 дні"],
                  ["1w", "Через тиждень"],
                  ["custom", "Інше…"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setWhen(key)}
                  className={`rounded-full border px-3 py-1 text-xs ${when === key ? "bg-foreground text-background border-foreground" : "border-foreground/15"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {when === "custom" && (
              <Input type="datetime-local" value={customDate} onChange={(e) => setCustomDate(e.target.value)} className="mt-2" />
            )}
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl">Скасувати</Button>
          <Button onClick={submit} disabled={!title || busy} className="rounded-xl">
            {busy ? "..." : "Створити"}
          </Button>
        </div>
      </div>
    </div>
  )
}
