"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, X, Plus, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authedFetch } from "@/lib/authed-fetch"
import { formatUAHDirect, formatDateTime } from "@/lib/admin-format"
import {
  PAYMENT_KIND_LABELS_UK,
  PAYMENT_METHOD_LABELS_UK,
  type PaymentKind,
  type PaymentMethod,
} from "@/lib/crm/types"
import { cn } from "@/lib/utils"

/**
 * Модалка «Фінанси угоди».
 *
 * Два різні за природою поля в одному місці:
 *   - Сума угоди — редагується напряму (PATCH amount_eur). Ціна виробу
 *     залежить від розмірів і уточнюється після заміру.
 *   - Сплачено / аванс — НЕ редагуються як число: їх рахує тригер БД із
 *     таблиці платежів. Тому тут вноситься платіж (аванс, частковий,
 *     залишок…), а суми оновлюються самі.
 *
 * Батько володіє даними: збереження суми йде через onSaveAmount, після
 * внесення платежу викликається onChanged, щоб перечитати угоду.
 */

export type FinancePayment = {
  id: string
  kind: PaymentKind
  method: PaymentMethod
  amount_eur: number | string
  reference?: string | null
  paid_at: string
}

// Лише аванс і повернення: «частковий / залишок / додатково» робили те саме,
// що й аванс, і лише плутали. Сума угоди змінюється окремим полем вище.
const KINDS: PaymentKind[] = ["deposit", "refund"]
const METHODS: PaymentMethod[] = ["cash", "card", "bank_transfer", "iban", "crypto", "other"]

const onlyNumber = (value: string) => value.replace(/[^\d.]/g, "")

export function paidFromPayments(payments: FinancePayment[]): number {
  // Так само, як тригер у БД: усе, крім повернень.
  return payments.reduce((sum, p) => (p.kind === "refund" ? sum : sum + Number(p.amount_eur || 0)), 0)
}

export function DealFinanceModal({
  open,
  reference,
  dealId,
  customerId,
  amount,
  payments,
  onSaveAmount,
  onChanged,
  onClose,
}: {
  open: boolean
  reference: string | null
  dealId: string
  customerId: string
  amount: number
  payments: FinancePayment[]
  /** Повертає true, якщо суму збережено. */
  onSaveAmount: (next: number) => Promise<boolean>
  /** Після успішного внесення платежу — перечитати угоду. */
  onChanged: () => void | Promise<void>
  onClose: () => void
}) {
  const [draftAmount, setDraftAmount] = useState(String(amount || ""))
  const [savingAmount, setSavingAmount] = useState(false)
  const [amountSaved, setAmountSaved] = useState(false)

  const [kind, setKind] = useState<PaymentKind>(payments.length ? "balance" : "deposit")
  const [method, setMethod] = useState<PaymentMethod>("bank_transfer")
  const [payAmount, setPayAmount] = useState("")
  const [ref, setRef] = useState("")
  const [savingPayment, setSavingPayment] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Коли модалку відкривають заново або угода перечиталась — синхронізуємо чернетку суми.
  useEffect(() => {
    if (open) {
      setDraftAmount(String(amount || ""))
      setAmountSaved(false)
      setError(null)
    }
  }, [open, amount])

  const paid = useMemo(() => paidFromPayments(payments), [payments])
  const liveAmount = Number(draftAmount) || 0
  const remaining = Math.max(liveAmount - paid, 0)
  const amountDirty = draftAmount !== "" && Number(draftAmount) !== amount

  if (!open) return null

  const saveAmount = async () => {
    const next = Number(draftAmount)
    if (draftAmount === "" || Number.isNaN(next) || next < 0) {
      setError("Вкажіть суму угоди числом.")
      return
    }
    setSavingAmount(true)
    setError(null)
    const ok = await onSaveAmount(next)
    setSavingAmount(false)
    if (ok) setAmountSaved(true)
    else setError("Не вдалося зберегти суму.")
  }

  const addPayment = async () => {
    const value = Number(payAmount)
    if (!payAmount || Number.isNaN(value) || value <= 0) {
      setError("Вкажіть суму платежу.")
      return
    }
    setSavingPayment(true)
    setError(null)
    try {
      const r = await authedFetch("/api/crm/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deal_id: dealId,
          customer_id: customerId,
          kind,
          method,
          amount_eur: value,
          reference: ref.trim() || undefined,
        }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) {
        setError(j.error || "Не вдалося внести платіж.")
        return
      }
      setPayAmount("")
      setRef("")
      // Після авансу наступний платіж найчастіше — залишок.
      if (kind === "deposit") setKind("balance")
      await onChanged()
    } finally {
      setSavingPayment(false)
    }
  }

  const finish = async () => {
    if (amountDirty && !amountSaved) {
      await saveAmount()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-card shadow-hover">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-foreground/5 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight-custom">Фінанси угоди</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {reference ? `${reference} · ` : ""}сума редагується, сплачене рахується з платежів
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={savingAmount || savingPayment}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            aria-label="Закрити"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto px-5 py-5">
          {/* Live summary */}
          <div className="grid grid-cols-3 gap-3">
            <Tile label="Сума" value={formatUAHDirect(liveAmount)} muted={amountDirty} />
            <Tile label="Сплачено" value={formatUAHDirect(paid)} />
            <Tile label="До сплати" value={formatUAHDirect(remaining)} highlight={remaining > 0} />
          </div>

          {/* Amount */}
          <section>
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Сума угоди, ₴
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="text"
                inputMode="decimal"
                value={draftAmount}
                onChange={(e) => {
                  setDraftAmount(onlyNumber(e.target.value))
                  setAmountSaved(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveAmount()
                }}
                placeholder="0"
                className="h-10 w-48 text-right text-base tabular-nums"
              />
              <Button
                onClick={saveAmount}
                disabled={!amountDirty || savingAmount}
                variant={amountDirty ? "default" : "outline"}
                className="rounded-xl gap-1.5"
              >
                {savingAmount ? "Зберігаю…" : amountSaved ? <><Check size={14} /> Збережено</> : "Зберегти суму"}
              </Button>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Остаточна ціна після заміру. Зміна суми не чіпає вже внесені платежі.
            </p>
          </section>

          {/* Add payment */}
          <section className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4">
            <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Внести платіж
            </span>
            <div className="flex flex-wrap gap-1.5">
              {KINDS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    kind === k
                      ? k === "refund"
                        ? "border-destructive bg-destructive/10 text-destructive"
                        : "border-foreground bg-foreground text-background"
                      : "border-foreground/15 hover:border-foreground/40"
                  )}
                >
                  {PAYMENT_KIND_LABELS_UK[k]}
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1.2fr_auto]">
              <Input
                type="text"
                inputMode="decimal"
                value={payAmount}
                onChange={(e) => setPayAmount(onlyNumber(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addPayment()
                }}
                placeholder="Сума, ₴"
                className="h-9 text-right tabular-nums"
              />
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
              >
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {PAYMENT_METHOD_LABELS_UK[m]}
                  </option>
                ))}
              </select>
              <Input
                type="text"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder="№ чека / переказу (необовʼязково)"
                className="h-9"
              />
              <Button
                onClick={addPayment}
                disabled={!payAmount || savingPayment}
                size="sm"
                className="h-9 rounded-lg gap-1.5"
              >
                <Plus size={14} /> {savingPayment ? "Вношу…" : "Внести"}
              </Button>
            </div>
            {remaining > 0 && kind !== "refund" && !payAmount && (
              <button
                type="button"
                onClick={() => setPayAmount(String(remaining))}
                className="mt-2 text-xs text-accent hover:underline"
              >
                Підставити весь залишок: {formatUAHDirect(remaining)}
              </button>
            )}
          </section>

          {/* Payments list */}
          <section>
            <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Платежі · {payments.length}
            </span>
            {payments.length === 0 ? (
              <p className="rounded-xl border border-dashed border-foreground/15 px-4 py-3 text-sm text-muted-foreground">
                Платежів ще немає. Перший зазвичай — аванс.
              </p>
            ) : (
              <div className="divide-y divide-foreground/5 rounded-xl border border-foreground/10">
                {payments.map((p) => (
                  <div key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        p.kind === "refund" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
                      )}
                    >
                      {PAYMENT_KIND_LABELS_UK[p.kind]}
                    </span>
                    <span className="text-xs text-muted-foreground">{PAYMENT_METHOD_LABELS_UK[p.method]}</span>
                    {p.reference && <span className="font-mono text-xs text-muted-foreground">{p.reference}</span>}
                    <span className="ml-auto font-medium tabular-nums whitespace-nowrap">
                      {p.kind === "refund" ? "−" : ""}
                      {formatUAHDirect(Number(p.amount_eur))}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(p.paid_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {error && (
            <p className="inline-flex items-center gap-1 text-xs text-destructive">
              <AlertCircle size={12} /> {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-foreground/5 bg-foreground/[0.02] px-5 py-3">
          <span className="text-xs text-muted-foreground">
            {amountDirty && !amountSaved ? "Сума ще не збережена" : ""}
          </span>
          <Button onClick={finish} disabled={savingAmount || savingPayment} className="rounded-xl gap-2">
            <Check size={14} /> Готово
          </Button>
        </div>
      </div>
    </div>
  )
}

function Tile({
  label,
  value,
  highlight,
  muted,
}: {
  label: string
  value: string
  highlight?: boolean
  muted?: boolean
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-xl border p-3 text-right",
        highlight ? "border-amber-500/30 bg-amber-500/5" : "border-foreground/10",
        muted && "opacity-60"
      )}
    >
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="break-words text-base font-semibold leading-tight tabular-nums">{value}</div>
    </div>
  )
}
