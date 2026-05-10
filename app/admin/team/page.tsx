"use client"

import { useEffect, useState } from "react"
import { Plus, Mail, Phone, Shield, UserCog, HardHat, BadgeCheck, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authedFetch } from "@/lib/authed-fetch"
import { useTeamStore } from "@/lib/crm/store"
import type { TeamMember, TeamRole } from "@/lib/crm/types"
import { formatRelative } from "@/lib/admin-format"

const ROLE_LABEL_UK: Record<TeamRole, string> = {
  admin: "Адмін",
  manager: "Менеджер",
  master: "Майстер",
  sales: "Продажі",
}

const ROLE_ICON: Record<TeamRole, React.ComponentType<{ size?: number }>> = {
  admin: Shield,
  manager: UserCog,
  master: HardHat,
  sales: BadgeCheck,
}

const ROLE_DESC: Record<TeamRole, string> = {
  admin: "Повний доступ до CRM, ролей, фінансів",
  manager: "Управління угодами, клієнтами, платежами",
  master: "Виробничі задачі — лише свої угоди",
  sales: "Продажі — лише свої ліди",
}

export default function TeamPage() {
  const members = useTeamStore((s) => s.members)
  const loaded = useTeamStore((s) => s.loaded)
  const load = useTeamStore((s) => s.load)
  const [showAdd, setShowAdd] = useState(false)
  const [draft, setDraft] = useState<{ email: string; display_name: string; role: TeamRole; phone: string }>({
    email: "",
    display_name: "",
    role: "manager",
    phone: "",
  })

  useEffect(() => { load() }, [load])

  const submit = async () => {
    if (!draft.email) return
    await authedFetch("/api/crm/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    })
    setShowAdd(false)
    setDraft({ email: "", display_name: "", role: "manager", phone: "" })
    // Force reload
    useTeamStore.setState({ loaded: false })
    load()
  }

  const updateMember = async (id: string, patch: Partial<TeamMember>) => {
    await authedFetch(`/api/crm/team/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
    useTeamStore.setState({ loaded: false })
    load()
  }

  const removeMember = async (id: string) => {
    if (!confirm("Деактивувати цього члена команди? Історія угод збережеться.")) return
    await authedFetch(`/api/crm/team/${id}`, { method: "DELETE" })
    useTeamStore.setState({ loaded: false })
    load()
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight-custom">Команда і ролі</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Учасники команди мають реальні Supabase-ролі. RLS обмежує що видно кожній ролі.
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="rounded-xl gap-2">
          <Plus size={16} /> Додати учасника
        </Button>
      </header>

      {/* Roles legend */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.keys(ROLE_LABEL_UK) as TeamRole[]).map((role) => {
          const Icon = ROLE_ICON[role]
          const count = members.filter((m) => m.role === role).length
          return (
            <div key={role} className="rounded-2xl border border-foreground/10 bg-card p-4">
              <div className="flex items-center gap-2">
                <Icon size={16} />
                <span className="font-medium">{ROLE_LABEL_UK[role]}</span>
                <span className="ml-auto text-xs text-muted-foreground tabular-nums">{count}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{ROLE_DESC[role]}</p>
            </div>
          )
        })}
      </div>

      {/* List */}
      {loaded && members.length === 0 && (
        <div className="rounded-2xl border border-dashed border-foreground/15 p-12 text-center text-sm text-muted-foreground">
          Поки немає учасників. Додайте першого вище.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-foreground/5 bg-foreground/[0.02] text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Учасник</th>
              <th className="px-4 py-3 text-left">Контакти</th>
              <th className="px-4 py-3 text-left">Роль</th>
              <th className="px-4 py-3 text-left">Статус</th>
              <th className="px-4 py-3 text-right">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/5">
            {members.map((m) => {
              const Icon = ROLE_ICON[m.role]
              return (
                <tr key={m.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{m.display_name || m.email.split("@")[0]}</div>
                    {m.user_id ? null : (
                      <div className="text-[10px] uppercase tracking-wide text-amber-600">не зарееєстрований у Supabase Auth</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <a href={`mailto:${m.email}`} className="flex items-center gap-1.5 hover:text-foreground">
                      <Mail size={12} /> {m.email}
                    </a>
                    {m.phone && (
                      <a href={`tel:${m.phone}`} className="flex items-center gap-1.5 mt-0.5 text-xs hover:text-foreground">
                        <Phone size={12} /> {m.phone}
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={m.role}
                      onChange={(e) => updateMember(m.id, { role: e.target.value as TeamRole })}
                      className="h-8 rounded-md border border-foreground/10 bg-background px-2 text-xs"
                    >
                      {(Object.keys(ROLE_LABEL_UK) as TeamRole[]).map((r) => (
                        <option key={r} value={r}>{ROLE_LABEL_UK[r]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => updateMember(m.id, { active: !m.active })}
                      className={`rounded-full px-2 py-0.5 text-xs ${m.active ? "bg-success/10 text-success" : "bg-foreground/5 text-muted-foreground"}`}
                    >
                      {m.active ? "Активний" : "Деактивований"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => removeMember(m.id)}
                      className="rounded-md p-1.5 text-destructive/70 hover:bg-destructive/10"
                      title="Деактивувати"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-md rounded-2xl border border-foreground/10 bg-card p-6 shadow-hover" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Новий учасник</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">Email *</label>
                <Input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} autoFocus />
                <p className="mt-1 text-xs text-muted-foreground">
                  Учасник зможе увійти в /admin лише після реєстрації цього email у Supabase Auth.
                </p>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">Імʼя</label>
                <Input value={draft.display_name} onChange={(e) => setDraft({ ...draft, display_name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">Роль *</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(ROLE_LABEL_UK) as TeamRole[]).map((r) => {
                    const Icon = ROLE_ICON[r]
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setDraft({ ...draft, role: r })}
                        className={`rounded-xl border px-3 py-2 text-left text-xs ${
                          draft.role === r ? "border-foreground bg-foreground/5" : "border-foreground/15"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-medium">
                          <Icon size={12} /> {ROLE_LABEL_UK[r]}
                        </div>
                        <p className="mt-0.5 text-muted-foreground">{ROLE_DESC[r]}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">Телефон</label>
                <Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="+380…" />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAdd(false)} className="rounded-xl">Скасувати</Button>
              <Button onClick={submit} disabled={!draft.email} className="rounded-xl">Додати</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
