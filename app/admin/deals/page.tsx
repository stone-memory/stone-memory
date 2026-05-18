"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Plus, AlertTriangle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useDealsStore, useCustomersStore } from "@/lib/crm/store"
import {
  DEAL_STATUS_TO_LANE,
  DEAL_LANE_LABELS_UK,
  DEAL_STATUS_LABELS_UK,
  availableTransitions,
  computeDealSLA,
  formatSLABadge,
  type DealLane,
  type DealStatus,
} from "@/lib/crm/types"
import { formatUAHDirect, formatRelative } from "@/lib/admin-format"
import { cn } from "@/lib/utils"

// "На паузі" is an exceptional state — always shown when occupied, hidden when empty.
const LANES: DealLane[] = ["lead", "discovery", "agreement", "production", "fulfillment", "paused", "closed"]
const ALWAYS_SHOW_LANES = new Set<DealLane>(["lead", "discovery", "agreement", "production", "fulfillment", "closed"])

const LANE_COLOR: Record<DealLane, string> = {
  lead: "bg-blue-500/10 border-blue-500/30",
  discovery: "bg-amber-500/10 border-amber-500/30",
  agreement: "bg-purple-500/10 border-purple-500/30",
  production: "bg-orange-500/10 border-orange-500/30",
  fulfillment: "bg-success/10 border-success/30",
  closed: "bg-foreground/5 border-foreground/15",
  paused: "bg-amber-500/10 border-amber-500/30",
}

const CLOSED_STATUSES = new Set<DealStatus>(["completed", "cancelled", "lost"])

export default function DealsKanbanPage() {
  const items = useDealsStore((s) => s.items)
  const loading = useDealsStore((s) => s.loading)
  const load = useDealsStore((s) => s.load)
  const setStatus = useDealsStore((s) => s.setStatus)
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    if (!search) return items
    const q = search.toLowerCase()
    return items.filter(
      (d) =>
        d.reference?.toLowerCase().includes(q) ||
        d.customers?.name?.toLowerCase().includes(q) ||
        d.customers?.phone?.toLowerCase().includes(q)
    )
  }, [items, search])

  const byLane = useMemo(() => {
    const map: Record<DealLane, typeof items> = {
      lead: [], discovery: [], agreement: [], production: [],
      fulfillment: [], closed: [], paused: [],
    }
    for (const d of filtered) {
      const lane = DEAL_STATUS_TO_LANE[d.status]
      map[lane].push(d)
    }
    return map
  }, [filtered])

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight-custom">Угоди</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Канбан з усіма угодами. Натисни на статус щоб перевести угоду далі.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="rounded-xl gap-2">
          <Plus size={16} /> Нова угода
        </Button>
      </header>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Номер, клієнт, телефон…" className="pl-9" />
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive flex items-center gap-2">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* Канбан */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {LANES.filter((lane) => ALWAYS_SHOW_LANES.has(lane) || byLane[lane].length > 0).map((lane) => {
          const dealsInLane = byLane[lane]
          return (
            <div key={lane} className={cn("rounded-2xl border bg-card", LANE_COLOR[lane])}>
              <div className="px-3 py-2 border-b border-foreground/5 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wide">{DEAL_LANE_LABELS_UK[lane]}</h2>
                <span className="text-xs text-muted-foreground tabular-nums">{dealsInLane.length}</span>
              </div>
              <div className="space-y-2 p-2 max-h-[70vh] overflow-y-auto">
                {dealsInLane.length === 0 && (
                  <div className="rounded-xl border border-dashed border-foreground/15 p-4 text-center text-xs text-muted-foreground">
                    —
                  </div>
                )}
                {dealsInLane.map((d) => (
                  <DealCard
                    key={d.id}
                    deal={d}
                    onStatusChange={async (next) => {
                      setError(null)
                      const r = await setStatus(d.id, next)
                      if (!r.ok) setError(r.error || "Не вдалось змінити статус")
                    }}
                    onReopen={CLOSED_STATUSES.has(d.status) ? async () => {
                      setError(null)
                      const r = await setStatus(d.id, "new")
                      if (!r.ok) setError(r.error || "Не вдалось відновити угоду")
                    } : undefined}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {showCreate && (
        <CreateDealDialog onClose={() => setShowCreate(false)} />
      )}
    </div>
  )
}

type DealRow = {
  id: string
  reference: string | null
  status: DealStatus
  amount_eur: number | string
  created_at: string
  description?: string | null
  customers?: { id: string; name: string; phone: string } | null
  /** Populated by GET /api/crm/deals — used to compute SLA badge. */
  last_inbound_at?: string | null
  last_outbound_at?: string | null
}

function DealCard({
  deal,
  onStatusChange,
  onReopen,
}: {
  deal: DealRow
  onStatusChange: (next: DealStatus) => void
  onReopen?: () => void
}) {
  const [showTransitions, setShowTransitions] = useState(false)
  // Exclude "new" from normal transition buttons — reopen has its own dedicated button
  const transitions = availableTransitions(deal.status).filter((s) => s !== "new")
  const sla = computeDealSLA(deal)
  const isClosed = CLOSED_STATUSES.has(deal.status)

  const statusColor = deal.status === "completed"
    ? "border-success/40 text-success bg-success/5"
    : deal.status === "cancelled" || deal.status === "lost"
      ? "border-destructive/30 text-destructive bg-destructive/5"
      : "border-foreground/15"

  return (
    <div className={cn(
      "rounded-xl border bg-background p-3 text-sm shadow-soft hover:shadow-hover transition-shadow",
      isClosed ? "opacity-75" : "border-foreground/10"
    )}>
      <div className="flex items-start justify-between gap-2">
        <Link href={`/admin/deals/${deal.id}`} className="font-mono text-xs font-medium hover:text-accent">
          {deal.reference}
        </Link>
        <span className="text-[10px] text-muted-foreground tabular-nums">{formatRelative(deal.created_at)}</span>
      </div>
      {deal.customers && (
        <Link
          href={`/admin/customers/${deal.customers.id}`}
          className="block mt-1 text-[13px] font-medium hover:text-accent truncate"
        >
          {deal.customers.name}
        </Link>
      )}
      {sla && sla.status !== "ok" && (
        <span
          className={cn(
            "mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
            sla.status === "overdue"
              ? "bg-destructive/10 text-destructive"
              : sla.status === "warning"
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                : "bg-blue-500/10 text-blue-700 dark:text-blue-300"
          )}
          title={
            deal.last_inbound_at
              ? `Останнє вхідне: ${new Date(deal.last_inbound_at).toLocaleString("uk-UA")}`
              : undefined
          }
        >
          ⏱ {formatSLABadge(sla)}
        </span>
      )}
      {deal.description && (
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{deal.description}</p>
      )}
      <div className="mt-2 flex items-center gap-2 text-xs">
        {!isClosed ? (
          <button
            onClick={() => setShowTransitions((v) => !v)}
            className="rounded-full border border-foreground/15 px-2 py-0.5 hover:bg-foreground/5"
          >
            {DEAL_STATUS_LABELS_UK[deal.status]}
          </button>
        ) : (
          <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", statusColor)}>
            {DEAL_STATUS_LABELS_UK[deal.status]}
          </span>
        )}
        {Number(deal.amount_eur) > 0 && (
          <span className="ml-auto font-medium tabular-nums">{formatUAHDirect(Number(deal.amount_eur))}</span>
        )}
      </div>
      {showTransitions && transitions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {transitions.map((t) => (
            <button
              key={t}
              onClick={() => {
                setShowTransitions(false)
                onStatusChange(t)
              }}
              className="rounded-full bg-foreground px-2 py-0.5 text-[11px] text-background hover:-translate-y-px transition-transform"
            >
              → {DEAL_STATUS_LABELS_UK[t]}
            </button>
          ))}
        </div>
      )}
      {isClosed && onReopen && (
        <button
          onClick={onReopen}
          className="mt-2 w-full rounded-lg border border-foreground/15 py-1 text-[11px] text-muted-foreground hover:border-accent hover:text-accent transition-colors"
        >
          ↩ Відновити угоду
        </button>
      )}
    </div>
  )
}

function CreateDealDialog({ onClose }: { onClose: () => void }) {
  const create = useDealsStore((s) => s.create)
  const allCustomers = useCustomersStore((s) => s.items)
  const customersLoading = useCustomersStore((s) => s.loading)
  const loadCustomers = useCustomersStore((s) => s.load)
  const [customerSearch, setCustomerSearch] = useState("")
  const [customerId, setCustomerId] = useState("")
  const [customerLabel, setCustomerLabel] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [category, setCategory] = useState<"memorial" | "home">("memorial")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return allCustomers
    const q = customerSearch.toLowerCase()
    return allCustomers.filter(
      (c) => c.name?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q)
    )
  }, [allCustomers, customerSearch])

  const selectCustomer = (c: { id: string; name: string; phone: string }) => {
    setCustomerId(c.id)
    setCustomerLabel(`${c.name} · ${c.phone}`)
    setCustomerSearch("")
    setDropdownOpen(false)
  }

  const submit = async () => {
    if (!customerId) return
    setBusy(true)
    setErrorMsg(null)
    try {
      const d = await create({
        customer_id: customerId,
        category,
        description: description || undefined,
        amount_eur: amount ? Number(amount) : 0,
      })
      if (d) {
        onClose()
      } else {
        setErrorMsg("Не вдалось створити угоду. Перевірте зʼєднання або спробуйте ще раз.")
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-foreground/10 bg-card p-6 shadow-hover" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">Нова угода</h2>
        <div className="space-y-3">
          <div ref={dropdownRef}>
            <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">Клієнт *</label>
            {customerId ? (
              <div className="flex items-center justify-between h-10 rounded-xl border border-foreground/10 bg-background px-3 text-sm">
                <span className="truncate">{customerLabel}</span>
                <button
                  type="button"
                  onClick={() => { setCustomerId(""); setCustomerLabel("") }}
                  className="ml-2 shrink-0 text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => { setCustomerSearch(e.target.value); setDropdownOpen(true) }}
                  onFocus={() => setDropdownOpen(true)}
                  placeholder="Пошук за іменем або телефоном…"
                  className="h-10 w-full rounded-xl border border-foreground/10 bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-foreground/10"
                />
                {dropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full rounded-xl border border-foreground/10 bg-card shadow-hover max-h-48 overflow-y-auto">
                    {filteredCustomers.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        {customersLoading
                          ? "Завантаження клієнтів…"
                          : allCustomers.length === 0
                            ? "Клієнтів ще немає — спочатку додайте клієнта у /admin/customers"
                            : "Нікого не знайдено"}
                      </div>
                    ) : (
                      filteredCustomers.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onMouseDown={(e) => { e.preventDefault(); selectCustomer(c) }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-foreground/5 transition-colors"
                        >
                          <span className="font-medium">{c.name}</span>
                          <span className="ml-2 text-muted-foreground">{c.phone}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">Категорія</label>
            <div className="flex gap-1 rounded-full bg-foreground/5 p-1 w-fit">
              {(["memorial", "home"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium",
                    category === c ? "bg-card shadow-soft" : "text-muted-foreground"
                  )}
                >
                  {c === "memorial" ? "Памʼятники" : "Дім і сад"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">Опис</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Що саме потрібно: памʼятник з габро 80×50, лазерний портрет…"
              className="w-full rounded-xl border border-foreground/10 bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">Сума, ₴</label>
            <Input type="text" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} placeholder="0" />
          </div>
        </div>
        {errorMsg && (
          <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorMsg}</p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl">Скасувати</Button>
          <Button onClick={submit} disabled={!customerId || busy} className="rounded-xl" title={!customerId ? "Спочатку оберіть клієнта" : undefined}>
            {busy ? "Створюю…" : "Створити"}
          </Button>
        </div>
      </div>
    </div>
  )
}
