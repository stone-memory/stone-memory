"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Plus, Mail, Phone, Shield, UserCog, HardHat, BadgeCheck, Trash2, Crown, Table2, Key, X, Check, AlertCircle, Sparkles, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authedFetch } from "@/lib/authed-fetch"
import { useTeamStore } from "@/lib/crm/store"
import type { CustomRole, TeamMember, TeamRole } from "@/lib/crm/types"
import { formatRelative } from "@/lib/admin-format"
import { useCustomRoles } from "@/lib/store/custom-roles"
import { useCurrentRole, isSuperAdmin } from "@/lib/auth/use-current-role"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CAPABILITY_LABELS, BASE_ROLE_CAPABILITIES, type Capability } from "@/lib/permissions/capabilities"
import { cn } from "@/lib/utils"

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

// Note: assignable-role logic moved to the custom_roles list at runtime.
// We filter `customRoles.filter(r => r.base_role !== "super_admin")` in
// the picker — that's the new source of truth for "what can a UI user
// pick when adding a teammate".

export default function TeamPage() {
  const members = useTeamStore((s) => s.members)
  const loaded = useTeamStore((s) => s.loaded)
  const load = useTeamStore((s) => s.load)
  const { role: currentRole } = useCurrentRole()
  const canResetPasswords = isSuperAdmin(currentRole)
  const [showAdd, setShowAdd] = useState(false)
  // When set, opens the "reset password for this teammate" modal.
  const [resetTarget, setResetTarget] = useState<TeamMember | null>(null)
  // Custom roles drive the picker — we send custom_role_id, the DB
  // trigger derives base role automatically. role string in draft
  // is only used as fallback if the user picks a system role we
  // haven't loaded yet (network race).
  const customRoles = useCustomRoles()
  const [draft, setDraft] = useState<{
    email: string
    display_name: string
    custom_role_id: string | null
    role: TeamRole
    phone: string
  }>({
    email: "",
    display_name: "",
    custom_role_id: null,
    role: "manager",
    phone: "",
  })

  useEffect(() => { load() }, [load])

  // When the role list hydrates and no role is selected yet, default
  // to system_manager (matches the previous behavior where new members
  // defaulted to 'manager' enum). User can change before submitting.
  useEffect(() => {
    if (!draft.custom_role_id && customRoles.length > 0) {
      const def = customRoles.find((r) => r.name === "system_manager") ?? customRoles[0]
      setDraft((d) => ({ ...d, custom_role_id: def.id, role: def.base_role }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customRoles])

  const submit = async () => {
    if (!draft.email) return
    await authedFetch("/api/crm/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: draft.email,
        display_name: draft.display_name,
        role: draft.role,
        custom_role_id: draft.custom_role_id,
        phone: draft.phone,
      }),
    })
    setShowAdd(false)
    setDraft({ email: "", display_name: "", custom_role_id: null, role: "manager", phone: "" })
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
                    ) : customRoles.length === 0 ? (
                      // Fallback when custom_roles table not yet hydrated
                      // (e.g. migration not applied). Pure enum select so
                      // the row is still editable.
                      <select
                        value={m.role}
                        onChange={(e) =>
                          updateMember(m.id, {
                            role: e.target.value as TeamRole,
                            custom_role_id: null,
                          })
                        }
                        className="h-8 rounded-md border border-foreground/10 bg-background px-2 text-xs max-w-[180px]"
                      >
                        <option value="admin">Адмін</option>
                        <option value="manager">Менеджер</option>
                        <option value="master">Майстер</option>
                        <option value="sales">Продажі</option>
                      </select>
                    ) : (
                      // Role picker driven by custom_roles. For legacy
                      // members without custom_role_id, fall back to the
                      // matching system_* row so the dropdown shows a
                      // sensible selection instead of empty.
                      (() => {
                        const fallbackSystem = customRoles.find(
                          (cr) => cr.is_system && cr.base_role === m.role
                        )
                        const selectedId = m.custom_role_id || fallbackSystem?.id || ""
                        return (
                          <select
                            value={selectedId}
                            onChange={(e) => {
                              const id = e.target.value || null
                              const picked = customRoles.find((cr) => cr.id === id)
                              updateMember(m.id, {
                                custom_role_id: id,
                                ...(picked ? { role: picked.base_role } : {}),
                              })
                            }}
                            className="h-8 rounded-md border border-foreground/10 bg-background px-2 text-xs max-w-[180px]"
                          >
                            {customRoles
                              .filter((cr) => cr.base_role !== "super_admin")
                              .map((cr) => (
                                <option key={cr.id} value={cr.id}>
                                  {cr.label}
                                  {!cr.is_system ? " ★" : ""}
                                </option>
                              ))}
                          </select>
                        )
                      })()
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
                <RolePicker
                  roles={customRoles}
                  selectedId={draft.custom_role_id}
                  fallbackRole={draft.role}
                  onSelectCustom={(role) =>
                    setDraft({ ...draft, custom_role_id: role.id, role: role.base_role })
                  }
                  onSelectBase={(baseRole) =>
                    setDraft({ ...draft, custom_role_id: null, role: baseRole })
                  }
                />
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Наведіть курсор (або натисніть «i») щоб подивитись що дозволено та заборонено.
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

// ----------------------------------------------------------------
// Role picker for the new-member modal.
//
// Renders one of two modes:
//   • custom_roles loaded → cards from DB (system + user-defined),
//     excluding super_admin. Selection writes custom_role_id.
//   • custom_roles empty (migration not applied, or fresh DB) →
//     fallback to the 4 hardcoded base roles. Selection writes only
//     role enum (custom_role_id stays null). This makes the modal
//     usable without requiring SQL migration first — the original
//     stumbling block was a forever-spinning "Завантажую ролі…".
// ----------------------------------------------------------------
function RolePicker({
  roles,
  selectedId,
  fallbackRole,
  onSelectCustom,
  onSelectBase,
}: {
  roles: CustomRole[]
  selectedId: string | null
  fallbackRole: TeamRole
  onSelectCustom: (role: CustomRole) => void
  onSelectBase: (baseRole: TeamRole) => void
}) {
  const assignable = useMemo(
    () => roles.filter((r) => r.base_role !== "super_admin"),
    [roles]
  )

  // Fallback: enum-role grid when no custom_roles are loaded yet.
  if (assignable.length === 0) {
    const BASE_ROLES: { role: TeamRole; label: string; hint: string; icon: typeof Shield }[] = [
      { role: "admin", label: "Адмін", hint: "Повний доступ до CRM, ролей, фінансів", icon: Shield },
      { role: "manager", label: "Менеджер", hint: "Управління угодами, клієнтами, платежами", icon: UserCog },
      { role: "master", label: "Майстер", hint: "Виробничі задачі — лише свої угоди", icon: HardHat },
      { role: "sales", label: "Продажі", hint: "Продажі — лише свої ліди", icon: BadgeCheck },
    ]
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {BASE_ROLES.map(({ role, label, hint, icon: Icon }) => {
          const active = fallbackRole === role
          return (
            <button
              key={role}
              type="button"
              onClick={() => onSelectBase(role)}
              className={cn(
                "rounded-xl border px-3 py-2 text-left text-xs transition-colors",
                active
                  ? "border-foreground bg-foreground/5"
                  : "border-foreground/15 hover:border-foreground/30 hover:bg-foreground/[0.02]"
              )}
            >
              <div className="flex items-center gap-1.5 font-medium">
                <Icon size={12} /> {label}
              </div>
              <p className="mt-0.5 text-muted-foreground">{hint}</p>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {assignable.map((r) => {
        const active = selectedId === r.id
        return (
          <div
            key={r.id}
            className={cn(
              "relative rounded-xl border px-3 py-2 text-left text-xs transition-colors cursor-pointer",
              active
                ? "border-foreground bg-foreground/5"
                : "border-foreground/15 hover:border-foreground/30 hover:bg-foreground/[0.02]"
            )}
            onClick={() => onSelectCustom(r)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onSelectCustom(r)
              }
            }}
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 font-medium">
                  {r.label}
                  {!r.is_system && (
                    <span
                      className="inline-flex items-center gap-0.5 rounded-full bg-accent/10 px-1 py-0 text-[9px] font-medium text-accent"
                      title="Кастомна роль"
                    >
                      <Sparkles size={8} /> custom
                    </span>
                  )}
                  <RoleInfoTrigger role={r} />
                </div>
                <p className="mt-0.5 line-clamp-2 text-muted-foreground">
                  {r.description || `Базується на: ${baseRoleNameUk(r.base_role)}`}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function RoleInfoTrigger({ role }: { role: CustomRole }) {
  return (
    <>
      <HoverCard openDelay={150}>
        <HoverCardTrigger asChild>
          <button
            type="button"
            aria-label={`Деталі ролі ${role.label}`}
            onClick={(e) => e.stopPropagation()}
            className="hidden md:inline-flex items-center justify-center rounded-full p-0.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          >
            <Info size={11} />
          </button>
        </HoverCardTrigger>
        <HoverCardContent align="start" side="right" className="w-80 p-0" sideOffset={8}>
          <RolePermissionsBody role={role} />
        </HoverCardContent>
      </HoverCard>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`Деталі ролі ${role.label}`}
            onClick={(e) => e.stopPropagation()}
            className="md:hidden inline-flex items-center justify-center rounded-full p-0.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          >
            <Info size={11} />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" side="bottom" className="w-72 p-0" sideOffset={6} onClick={(e) => e.stopPropagation()}>
          <RolePermissionsBody role={role} />
        </PopoverContent>
      </Popover>
    </>
  )
}

function RolePermissionsBody({ role }: { role: CustomRole }) {
  // Effective caps = base capabilities ∪ role.capabilities. Render
  // those that the role grants, with a small "base"/"extra" tag.
  const baseCaps = BASE_ROLE_CAPABILITIES[role.base_role] || []
  const extras = role.capabilities.filter(
    (c): c is Capability => c in CAPABILITY_LABELS && !baseCaps.includes(c as Capability)
  )
  return (
    <div className="space-y-3 p-4 text-sm">
      <header>
        <h4 className="font-semibold leading-tight">{role.label}</h4>
        <p className="text-xs text-muted-foreground leading-snug">
          {role.description || `На основі: ${baseRoleNameUk(role.base_role)}`}
        </p>
      </header>
      <div>
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
          Базові дозволи ({baseRoleNameUk(role.base_role)})
        </div>
        <ul className="space-y-1 text-xs leading-snug">
          {baseCaps.map((cap) => (
            <li key={cap} className="flex items-start gap-1.5">
              <Check size={11} className="mt-1 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{CAPABILITY_LABELS[cap]}</span>
            </li>
          ))}
          {baseCaps.length === 0 && (
            <li className="text-muted-foreground text-xs">— (базова роль не дає прав)</li>
          )}
        </ul>
      </div>
      {extras.length > 0 && (
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-accent">
            Додатково в цій ролі
          </div>
          <ul className="space-y-1 text-xs leading-snug">
            {extras.map((cap) => (
              <li key={cap} className="flex items-start gap-1.5">
                <Sparkles size={11} className="mt-1 shrink-0 text-accent" />
                <span>{CAPABILITY_LABELS[cap]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function baseRoleNameUk(r: TeamRole): string {
  switch (r) {
    case "super_admin": return "Головний адмін"
    case "admin": return "Адмін"
    case "manager": return "Менеджер"
    case "master": return "Майстер"
    case "sales": return "Продажі"
  }
}
