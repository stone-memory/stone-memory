"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Search, Plus, User, Phone, Mail, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCustomersStore } from "@/lib/crm/store"
import { formatUAH, formatRelative } from "@/lib/admin-format"
import { cn } from "@/lib/utils"

export default function AdminCustomersPage() {
  const items = useCustomersStore((s) => s.items)
  const loading = useCustomersStore((s) => s.loading)
  const load = useCustomersStore((s) => s.load)
  const create = useCustomersStore((s) => s.create)
  const [q, setQ] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [draft, setDraft] = useState({ name: "", phone: "", email: "", city: "" })

  useEffect(() => {
    load()
  }, [load])

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => load(q || undefined), 300)
    return () => clearTimeout(t)
  }, [q, load])

  const submitAdd = async () => {
    if (!draft.phone || !draft.name) return
    const c = await create(draft)
    if (c) {
      setShowAdd(false)
      setDraft({ name: "", phone: "", email: "", city: "" })
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight-custom">Клієнти</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Усі клієнти в одному місці. Клацни — побачиш всі угоди, документи, платежі.
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="rounded-xl gap-2">
          <Plus size={16} /> Новий клієнт
        </Button>
      </header>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ім'я, телефон, email…"
          className="pl-9"
        />
      </div>

      {loading && items.length === 0 && (
        <div className="rounded-xl border border-foreground/10 bg-card p-6 text-center text-sm text-muted-foreground">
          Завантаження…
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-foreground/15 p-12 text-center text-sm text-muted-foreground">
          Поки немає клієнтів. Перші зʼявляться автоматично коли клієнт залишить заявку, або додайте вручну.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-foreground/5 bg-foreground/[0.02] text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Клієнт</th>
              <th className="px-4 py-3 text-left">Контакти</th>
              <th className="px-4 py-3 text-left">Місто</th>
              <th className="px-4 py-3 text-right">Угоди</th>
              <th className="px-4 py-3 text-right">LTV</th>
              <th className="px-4 py-3 text-left">Останній контакт</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/5">
            {items.map((c) => (
              <tr key={c.id} className="hover:bg-foreground/[0.02]">
                <td className="px-4 py-3">
                  <Link href={`/admin/customers/${c.id}`} className="flex items-center gap-3 group">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/5 text-foreground/70 group-hover:bg-foreground/10">
                      <User size={16} />
                    </span>
                    <div>
                      <div className="font-medium group-hover:text-accent">{c.name}</div>
                      {c.do_not_contact && (
                        <span className="text-[10px] uppercase tracking-wide text-destructive">не дзвонити</span>
                      )}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <a href={`tel:${c.phone.replace(/\s+/g, "")}`} className="flex items-center gap-1.5 hover:text-foreground">
                    <Phone size={12} /> {c.phone}
                  </a>
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 mt-0.5 text-xs hover:text-foreground">
                      <Mail size={12} /> {c.email}
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {c.city ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} /> {c.city}
                    </span>
                  ) : "—"}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-medium">{c.deal_count}</td>
                <td className="px-4 py-3 text-right tabular-nums" title={`€${c.ltv_eur}`}>
                  {c.ltv_eur > 0 ? formatUAH(Number(c.ltv_eur)) : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {c.last_contact_at ? formatRelative(c.last_contact_at) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-md rounded-2xl border border-foreground/10 bg-card p-6 shadow-hover" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Новий клієнт</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Імʼя *</label>
                <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} autoFocus />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Телефон *</label>
                <Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="+380..." />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Email</label>
                <Input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Місто</label>
                <Input value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAdd(false)} className="rounded-xl">Скасувати</Button>
              <Button onClick={submitAdd} disabled={!draft.name || !draft.phone} className={cn("rounded-xl")}>Створити</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
