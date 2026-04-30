"use client"

import { useMemo, useState } from "react"
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, CircleDollarSign, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFinancesStore, useTransactions, type TxCategory, type TxKind } from "@/lib/store/finances"
import { cn } from "@/lib/utils"

type Period = "7d" | "30d" | "90d" | "ytd" | "all"

const periods: { key: Period; label: string }[] = [
  { key: "7d", label: "7 днів" },
  { key: "30d", label: "30 днів" },
  { key: "90d", label: "90 днів" },
  { key: "ytd", label: "З початку року" },
  { key: "all", label: "Увесь час" },
]

const categoryLabels: Record<TxCategory, string> = {
  order: "Замовлення",
  materials: "Матеріали",
  logistics: "Логістика",
  payroll: "Зарплата",
  tools: "Обладнання",
  rent: "Оренда",
  marketing: "Маркетинг",
  tax: "Податки",
  other: "Інше",
}

const categoryColor: Record<TxCategory, string> = {
  order: "bg-success/15 text-success",
  materials: "bg-orange-500/15 text-orange-600",
  logistics: "bg-blue-500/15 text-blue-600",
  payroll: "bg-purple-500/15 text-purple-600",
  tools: "bg-indigo-500/15 text-indigo-600",
  rent: "bg-pink-500/15 text-pink-600",
  marketing: "bg-yellow-500/15 text-yellow-700",
  tax: "bg-red-500/15 text-red-600",
  other: "bg-foreground/10 text-foreground/70",
}

function startOfPeriod(p: Period): number | null {
  const now = Date.now()
  if (p === "all") return null
  if (p === "7d") return now - 7 * 86400000
  if (p === "30d") return now - 30 * 86400000
  if (p === "90d") return now - 90 * 86400000
  if (p === "ytd") return new Date(new Date().getFullYear(), 0, 1).getTime()
  return null
}

function fmt(n: number): string {
  return n.toLocaleString("uk-UA", { maximumFractionDigits: 0 })
}

export default function AdminFinancesPage() {
  const transactions = useTransactions()
  const add = useFinancesStore((s) => s.add)
  const remove = useFinancesStore((s) => s.remove)

  const [period, setPeriod] = useState<Period>("30d")
  const [showAdd, setShowAdd] = useState(false)
  const [draft, setDraft] = useState<{ kind: TxKind; category: TxCategory; amount: string; note: string }>({
    kind: "income",
    category: "order",
    amount: "",
    note: "",
  })

  const from = startOfPeriod(period)
  const filtered = useMemo(
    () =>
      transactions
        .filter((t) => !from || t.date >= from)
        .sort((a, b) => b.date - a.date),
    [transactions, from]
  )

  const totals = useMemo(() => {
    const inc = filtered.filter((t) => t.kind === "income").reduce((s, t) => s + t.amount, 0)
    const exp = filtered.filter((t) => t.kind === "expense").reduce((s, t) => s + t.amount, 0)
    return { inc, exp, profit: inc - exp }
  }, [filtered])

  const byCategory = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {}
    for (const t of filtered) {
      if (!map[t.category]) map[t.category] = { income: 0, expense: 0 }
      map[t.category][t.kind] += t.amount
    }
    return Object.entries(map).sort(
      (a, b) => b[1].income + b[1].expense - (a[1].income + a[1].expense)
    )
  }, [filtered])

  // Timeline: net per day (last 30 days or period)
  const timeline = useMemo(() => {
    const buckets: Record<string, { income: number; expense: number }> = {}
    for (const t of filtered) {
      const d = new Date(t.date)
      const key = `${d.getMonth() + 1}-${d.getDate()}`
      if (!buckets[key]) buckets[key] = { income: 0, expense: 0 }
      buckets[key][t.kind] += t.amount
    }
    return Object.entries(buckets).slice(-30)
  }, [filtered])
  const maxVal = Math.max(1, ...timeline.map(([, v]) => Math.max(v.income, v.expense)))

  const submitAdd = () => {
    const amount = Number(draft.amount.replace(/\s/g, "")) || 0
    if (amount <= 0) return
    add({ kind: draft.kind, category: draft.category, amount, date: Date.now(), note: draft.note || undefined })
    setDraft({ kind: "income", category: "order", amount: "", note: "" })
    setShowAdd(false)
  }

  const exportCsv = () => {
    const rows = [
      ["id", "kind", "category", "amount_eur", "date_iso", "note"].join(","),
      ...filtered.map((t) =>
        [
          t.id,
          t.kind,
          t.category,
          t.amount,
          new Date(t.date).toISOString(),
          `"${(t.note || "").replace(/"/g, '""')}"`,
        ].join(",")
      ),
    ].join("\n")
    const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `finances-${period}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight-custom">Фінанси</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Дохід, витрати, чистий прибуток. Транзакції за періоди, експорт у CSV.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv} className="rounded-xl gap-2">
            <Download size={16} /> CSV
          </Button>
          <Button onClick={() => setShowAdd(true)} className="rounded-xl gap-2">
            <Plus size={16} /> Транзакція
          </Button>
        </div>
      </header>

      <div className="flex gap-1 rounded-full bg-foreground/5 p-1 w-fit">
        {periods.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              period === p.key
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Kpi icon={<TrendingUp size={18} />} label="Дохід" value={`€ ${fmt(totals.inc)}`} tone="success" />
        <Kpi icon={<TrendingDown size={18} />} label="Витрати" value={`€ ${fmt(totals.exp)}`} tone="warn" />
        <Kpi
          icon={<CircleDollarSign size={18} />}
          label="Чистий прибуток"
          value={`€ ${fmt(totals.profit)}`}
          tone={totals.profit >= 0 ? "success" : "warn"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-foreground/10 bg-card p-5 lg:col-span-2">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Динаміка
          </h2>
          {timeline.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Немає транзакцій за період</p>
          ) : (
            <div className="flex h-44 items-end gap-1">
              {timeline.map(([key, v]) => (
                <div key={key} className="flex flex-1 flex-col items-center gap-0.5" title={`${key} · дохід: ${v.income} · витрати: ${v.expense}`}>
                  <div className="flex w-full items-end gap-0.5" style={{ height: "100%" }}>
                    <div
                      className="flex-1 rounded-t bg-success/70"
                      style={{ height: `${(v.income / maxVal) * 100}%` }}
                    />
                    <div
                      className="flex-1 rounded-t bg-destructive/70"
                      style={{ height: `${(v.expense / maxVal) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded bg-success/70" /> Дохід
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded bg-destructive/70" /> Витрати
            </span>
          </div>
        </section>

        <section className="rounded-2xl border border-foreground/10 bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            За категоріями
          </h2>
          <div className="space-y-2">
            {byCategory.map(([cat, v]) => {
              const total = v.income + v.expense
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between text-sm">
                    <span className={cn("inline-flex items-center gap-2 rounded-full px-2 py-0.5 text-xs font-medium", categoryColor[cat as TxCategory])}>
                      {categoryLabels[cat as TxCategory]}
                    </span>
                    <span className="tabular-nums">
                      {v.income > 0 && <span className="text-success">+€{fmt(v.income)} </span>}
                      {v.expense > 0 && <span className="text-destructive">−€{fmt(v.expense)}</span>}
                    </span>
                  </div>
                </div>
              )
            })}
            {byCategory.length === 0 && <p className="text-sm text-muted-foreground">—</p>}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-foreground/10 bg-card">
        <div className="border-b border-foreground/5 p-4 flex items-center gap-2">
          <Wallet size={16} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Транзакції ({filtered.length})
          </h2>
        </div>
        <div className="divide-y divide-foreground/5">
          {filtered.map((t) => (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", categoryColor[t.category])}>
                {categoryLabels[t.category]}
              </span>
              <span className="text-muted-foreground text-xs tabular-nums">
                {new Date(t.date).toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "2-digit" })}
              </span>
              <span className="min-w-0 flex-1 truncate">{t.note || "—"}</span>
              <span className={cn("tabular-nums font-medium", t.kind === "income" ? "text-success" : "text-destructive")}>
                {t.kind === "income" ? "+" : "−"}€ {fmt(t.amount)}
              </span>
              <button
                onClick={() => remove(t.id)}
                className="rounded-md p-1.5 text-destructive/70 hover:bg-destructive/10"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">Транзакцій немає</p>
          )}
        </div>
      </section>

      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-foreground/10 bg-card p-6 shadow-hover">
            <h2 className="text-lg font-semibold">Нова транзакція</h2>
            <div className="mt-4 space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setDraft({ ...draft, kind: "income", category: "order" })}
                  className={cn("flex-1 rounded-xl px-3 py-2 text-sm font-medium", draft.kind === "income" ? "bg-success/15 text-success" : "bg-foreground/5 text-muted-foreground")}
                >
                  + Дохід
                </button>
                <button
                  onClick={() => setDraft({ ...draft, kind: "expense", category: "materials" })}
                  className={cn("flex-1 rounded-xl px-3 py-2 text-sm font-medium", draft.kind === "expense" ? "bg-destructive/15 text-destructive" : "bg-foreground/5 text-muted-foreground")}
                >
                  − Витрата
                </button>
              </div>
              <select
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value as TxCategory })}
                className="h-10 w-full rounded-xl border border-foreground/10 bg-background px-3 text-sm"
              >
                {(Object.keys(categoryLabels) as TxCategory[]).map((c) => (
                  <option key={c} value={c}>{categoryLabels[c]}</option>
                ))}
              </select>
              <Input
                placeholder="Сума (€)"
                inputMode="numeric"
                value={draft.amount}
                onChange={(e) => setDraft({ ...draft, amount: e.target.value.replace(/[^\d]/g, "") })}
              />
              <Input
                placeholder="Примітка"
                value={draft.note}
                onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAdd(false)} className="rounded-xl">Скасувати</Button>
              <Button onClick={submitAdd} className="rounded-xl">Додати</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Kpi({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: "success" | "warn" }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <div className={cn("mt-3 text-3xl font-semibold tabular-nums", tone === "success" ? "text-success" : "text-destructive")}>
        {value}
      </div>
    </div>
  )
}
