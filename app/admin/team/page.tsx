"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Mail, Phone, Shield, UserCog, HardHat, BadgeCheck, Trash2, Crown, Table2, Key, X, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authedFetch } from "@/lib/authed-fetch"
import { useTeamStore } from "@/lib/crm/store"
import type { TeamMember, TeamRole } from "@/lib/crm/types"
import { formatRelative } from "@/lib/admin-format"
import { RolePermissionCard } from "@/components/admin/role-permission-card"
import { useCurrentRole, isSuperAdmin } from "@/lib/auth/use-current-role"

const ROLE_LABEL_UK: Record<TeamRole, string> = {
  super_admin: "Головний адмін",
  admin: "Адмін",
  manager: "Менеджер",
  master: "Майстер",
  sales: "Продажі",
}

const ROLE_ICON: Record<TeamRole, React.ComponentType<{ size?: number }>> = {
  super_admin: Crown,
  admin: Shield,
  manager: UserCog,
  master: HardHat,
  sales: BadgeCheck,
}

const ROLE_DESC: Record<TeamRole, string> = {
  super_admin: "Власник бізнесу. Повний контроль + інтеграції каналів",
  admin: "Повний доступ до CRM, ролей, фінансів",
  manager: "Управління угодами, клієнтами, платежами",
  master: "Виробничі задачі — лише свої угоди",
  sales: "Продажі — лише свої ліди",
}

/** Roles assignable through the UI. super_admin is intentionally absent —
 *  it's a single-owner role, granted only by the database migration
 *  (supabase/crm-super-admin-2-policies.sql). Promotion via UI would
 *  let any admin grant themselves owner-level privileges. */
const ASSIGNABLE_ROLES: TeamRole[] = ["admin", "manager", "master", "sales"]

export default function TeamPage() {
  const members = useTeamStore((s) => s.members)
  const loaded = useTeamStore((s) => s.loaded)
  const load = useTeamStore((s) => s.load)
  const { role: currentRole } = useCurrentRole()
  const canResetPasswords = isSuperAdmin(currentRole)
  const [showAdd, setShowAdd] = useState(false)
  // When set, opens the "reset password for this teammate" modal.
  const [resetTarget, setResetTarget] = useState<TeamMember | null>(null)
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
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="rounded-xl gap-2">
            <Link href="/admin/team/permissions">
              <Table2 size={16} /> Порівняти права ролей
            </Link>
          </Button>
          <Button onClick={() => setShowAdd(true)} className="rounded-xl gap-2">
            <Plus size={16} /> Додати учасника
          </Button>
        </div>
      </header>

      {/* Roles legend — super_admin card only renders when at least one
         member holds that role (single-owner, populated via SQL). */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.keys(ROLE_LABEL_UK) as TeamRole[])
          .filter((role) => role !== "super_admin" || members.some((m) => m.role === "super_admin"))
          .map((role) => {
            const Icon = ROLE_ICON[role]
            const count = members.filter((m) => m.role === role).length
            const isSuper = role === "super_admin"
            return (
              <div
                key={role}
                className={
                  isSuper
                    ? "rounded-2xl border border-amber-300/40 bg-amber-50/40 p-4 dark:bg-amber-900/10"
                    : "rounded-2xl border border-foreground/10 bg-card p-4"
                }
              >
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
                    {m.role === "super_admin" ? (
                      // super_admin can't be demoted via UI — owner role is
                      // pinned. Demotion requires a SQL update by definition.
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                        👑 Головний адмін
                      </span>
                    ) : (
                      <select
                        value={m.role}
                        onChange={(e) => updateMember(m.id, { role: e.target.value as TeamRole })}
                        className="h-8 rounded-md border border-foreground/10 bg-background px-2 text-xs"
                      >
                        {ASSIGNABLE_ROLES.map((r) => (
                          <option key={r} value={r}>{ROLE_LABEL_UK[r]}</option>
                        ))}
                      </select>
                    )}
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
                    <div className="inline-flex items-center gap-1">
                      {canResetPasswords && m.user_id && (
                        // Visible only to super_admin AND only when the
                        // teammate has actually registered in Supabase Auth
                        // (without user_id we can't target their auth row).
                        <button
                          onClick={() => setResetTarget(m)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                          title="Скинути пароль"
                        >
                          <Key size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => removeMember(m.id)}
                        className="rounded-md p-1.5 text-destructive/70 hover:bg-destructive/10"
                        title="Деактивувати"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {resetTarget && (
        <ResetPasswordDialog
          target={resetTarget}
          onClose={() => setResetTarget(null)}
        />
      )}

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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ASSIGNABLE_ROLES.map((r) => (
                    <RolePermissionCard
                      key={r}
                      role={r}
                      active={draft.role === r}
                      onSelect={(role) => setDraft({ ...draft, role })}
                    />
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Наведіть курсор (або натисніть «i») щоб подивитись повний список того, що дозволено та заборонено.
                  <Link
                    href="/admin/team/permissions"
                    className="ml-1 underline underline-offset-2 hover:text-foreground"
                  >
                    Порівняти всі ролі →
                  </Link>
                </p>
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

/**
 * super_admin-only dialog: set a new password for any team member.
 * Calls /api/auth/update-password with targetUserId. The endpoint
 * gates by requireSuperAdmin so even if a non-super-admin somehow
 * lands here, the API rejects.
 *
 * After reset, the teammate's existing sessions are NOT killed by
 * Supabase admin.updateUserById — they stay logged in until the token
 * expires. This is consistent with how supabase.auth.updateUser({password})
 * normally behaves and matches user expectations ("changing password
 * doesn't sign me out").
 */
function ResetPasswordDialog({
  target,
  onClose,
}: {
  target: TeamMember
  onClose: () => void
}) {
  const [pw1, setPw1] = useState("")
  const [pw2, setPw2] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("idle")
    setErrorMsg(null)

    if (pw1.length < 8) {
      setStatus("error")
      setErrorMsg("Мінімум 8 символів")
      return
    }
    if (pw1 !== pw2) {
      setStatus("error")
      setErrorMsg("Паролі не збігаються")
      return
    }
    if (!target.user_id) {
      setStatus("error")
      setErrorMsg("У цього учасника ще немає auth-користувача")
      return
    }

    setSubmitting(true)
    try {
      const r = await authedFetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: pw1, targetUserId: target.user_id }),
      })
      const j = await r.json()
      if (!r.ok) {
        setStatus("error")
        setErrorMsg(j.error || "Помилка")
        return
      }
      setStatus("ok")
      setPw1("")
      setPw2("")
      // Auto-close after a short pause so the user sees the success state.
      setTimeout(onClose, 1500)
    } finally {
      setSubmitting(false)
    }
  }

  const displayName = target.display_name || target.email.split("@")[0]

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-foreground/10 bg-card p-6 shadow-hover"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <h2 className="text-lg font-semibold tracking-tight-custom">Скинути пароль</h2>
            <p className="mt-0.5 text-xs text-muted-foreground break-all">
              Для <span className="font-medium text-foreground">{displayName}</span> ({target.email})
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <p className="mt-3 rounded-lg bg-amber-50/60 px-3 py-2 text-xs text-amber-900 dark:bg-amber-900/10 dark:text-amber-200">
          Учасник зможе ввійти з новим паролем одразу. Поточні активні сесії не закриваються —
          якщо потрібно вилогінити, попроси учасника натиснути «Вийти» або зроби це через Supabase Dashboard.
        </p>

        <form onSubmit={submit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Новий пароль</label>
            <Input
              type="password"
              value={pw1}
              onChange={(e) => setPw1(e.target.value)}
              placeholder="Мінімум 8 символів"
              autoComplete="new-password"
              className="h-11 rounded-xl"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Підтвердіть</label>
            <Input
              type="password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              autoComplete="new-password"
              className="h-11 rounded-xl"
              required
            />
          </div>
          {status === "error" && errorMsg && (
            <p className="inline-flex items-center gap-1.5 text-sm text-destructive">
              <AlertCircle size={14} /> {errorMsg}
            </p>
          )}
          {status === "ok" && (
            <p className="inline-flex items-center gap-1.5 text-sm text-success">
              <Check size={14} /> Пароль оновлено
            </p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
              Скасувати
            </Button>
            <Button type="submit" disabled={submitting} className="rounded-xl gap-2">
              <Key size={14} />
              {submitting ? "Зберігаю…" : "Скинути пароль"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
