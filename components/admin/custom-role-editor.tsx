"use client"

import { useMemo, useState } from "react"
import { Check, X, AlertCircle, Lock, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  CAPABILITY_GROUPS,
  CAPABILITY_LABELS,
  BASE_ROLE_CAPABILITIES,
  type Capability,
} from "@/lib/permissions/capabilities"
import type { CustomRole, TeamRole } from "@/lib/crm/types"
import { cn } from "@/lib/utils"

/**
 * Modal for creating or editing a custom role. Two use sites:
 *   1. /admin/team/permissions → "+ Нова роль" or per-row "edit"
 *   2. Reusable elsewhere later (e.g. import flow) — passing
 *      `initial` for the edit case, omitting it for create.
 *
 * System rows (is_system=true) get a reduced editor: label and
 * base_role are locked because changing them would break the link
 * between the row and the enum-based RLS that depends on it.
 * Capabilities[] is still editable so the owner can tweak the
 * built-in baseline if they want (e.g. give all managers
 * finances.view_company permanently).
 */
export function CustomRoleEditor({
  initial,
  onSave,
  onCancel,
  onDelete,
  busy,
}: {
  /** When set → editing this role; when undefined → creating new. */
  initial?: CustomRole
  onSave: (payload: {
    name: string
    label: string
    description: string | null
    base_role: TeamRole
    capabilities: Capability[]
  }) => Promise<{ ok: boolean; error?: string }>
  onCancel: () => void
  /** Only passed in edit mode for non-system rows. */
  onDelete?: () => Promise<{ ok: boolean; error?: string }>
  busy?: boolean
}) {
  const isEdit = Boolean(initial)
  const isSystem = initial?.is_system ?? false

  const [name, setName] = useState(initial?.name ?? "")
  const [label, setLabel] = useState(initial?.label ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [baseRole, setBaseRole] = useState<TeamRole>(initial?.base_role ?? "manager")
  const [caps, setCaps] = useState<Set<Capability>>(
    () => new Set((initial?.capabilities || []).filter((c) => c in CAPABILITY_LABELS) as Capability[])
  )
  const [error, setError] = useState<string | null>(null)

  // Auto-derived base capability set (the things the picked base_role
  // grants for free). We render those checkboxes as visually distinct +
  // disabled so the user understands they can't UNCHECK them — base
  // role determines RLS, not the checkbox.
  const baseCaps = useMemo(() => new Set(BASE_ROLE_CAPABILITIES[baseRole] || []), [baseRole])

  const toggleCap = (cap: Capability) => {
    if (baseCaps.has(cap)) return // already granted by base role
    setCaps((prev) => {
      const next = new Set(prev)
      if (next.has(cap)) next.delete(cap)
      else next.add(cap)
      return next
    })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!label.trim()) {
      setError("Назва ролі обов'язкова")
      return
    }
    if (!isEdit && !name.trim()) {
      setError("Slug обов'язковий (англ. літери, цифри, _)")
      return
    }
    // Only send capabilities[] EXTRA to the base. Base capabilities are
    // re-derived by the server from base_role, so we don't duplicate.
    const extras = Array.from(caps).filter((c) => !baseCaps.has(c))
    const res = await onSave({
      name: name.trim(),
      label: label.trim(),
      description: description.trim() || null,
      base_role: baseRole,
      capabilities: extras,
    })
    if (!res.ok) setError(res.error || "Не вдалось зберегти")
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-foreground/10 bg-card shadow-hover">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-foreground/5 bg-card px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight-custom">
              {isEdit ? `Редагувати роль: ${initial?.label}` : "Нова роль"}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground max-w-md">
              Виберіть базову роль (це визначає що людина бачить у Postgres RLS), додайте
              назву і додаткові дозволи поверх базових.
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={busy}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          >
            <X size={16} />
          </button>
        </header>

        <form onSubmit={submit} className="space-y-5 px-5 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Назва (для UI)" required>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Гравер"
                disabled={isSystem}
                className="h-10 rounded-xl"
              />
              {isSystem && (
                <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Lock size={10} /> системна роль — назву редагувати не можна
                </p>
              )}
            </Field>
            <Field label="Slug (id у БД)" required={!isEdit}>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
                placeholder="engraver"
                disabled={isEdit}
                className="h-10 rounded-xl font-mono text-xs"
              />
              {isEdit && (
                <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Lock size={10} /> slug не змінюється після створення
                </p>
              )}
            </Field>
          </div>

          <Field label="Опис">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/5"
              placeholder="Що ця роль робить у бізнесі — для довідки колегам"
            />
          </Field>

          <Field label="Базова роль (RLS-anchor)" required>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(["admin", "manager", "master", "sales"] as TeamRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setBaseRole(r)}
                  disabled={isSystem}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-left text-xs transition-colors",
                    baseRole === r
                      ? "border-foreground bg-foreground/5"
                      : "border-foreground/10 hover:border-foreground/30",
                    isSystem && "opacity-60 cursor-not-allowed"
                  )}
                >
                  <div className="font-medium">{labelForBaseRole(r)}</div>
                  <p className="mt-0.5 text-muted-foreground text-[11px]">
                    {hintForBaseRole(r)}
                  </p>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Базова роль визначає що людина <span className="font-medium">бачить</span> на рівні бази (RLS).
              Чекбокси нижче додають точкові дозволи зверху — наприклад, менеджеру можна додати «Бачити фінанси».
            </p>
          </Field>

          <div>
            <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Дозволи (можливості)
            </span>
            <div className="space-y-4">
              {CAPABILITY_GROUPS.map((group) => (
                <div key={group.group}>
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80">
                    {group.group}
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
                    {group.capabilities.map((cap) => {
                      const fromBase = baseCaps.has(cap)
                      const checked = fromBase || caps.has(cap)
                      return (
                        <label
                          key={cap}
                          className={cn(
                            "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors",
                            fromBase
                              ? "border-emerald-300/40 bg-emerald-50/40 dark:bg-emerald-900/10"
                              : checked
                                ? "border-foreground bg-foreground/5"
                                : "border-foreground/10 hover:border-foreground/30"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={fromBase}
                            onChange={() => toggleCap(cap)}
                            className="mt-0.5 accent-foreground"
                          />
                          <span className="flex-1 leading-snug">
                            {CAPABILITY_LABELS[cap]}
                            {fromBase && (
                              <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] text-emerald-700 dark:text-emerald-300">
                                <Lock size={8} /> з базової
                              </span>
                            )}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="inline-flex items-center gap-1.5 text-sm text-destructive">
              <AlertCircle size={14} /> {error}
            </p>
          )}

          <div className="flex flex-wrap justify-between gap-2 border-t border-foreground/5 pt-4">
            {isEdit && onDelete && !isSystem ? (
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  if (!confirm(`Видалити роль «${initial?.label}»? Учасники з цією роллю повернуться до базової.`)) return
                  const res = await onDelete()
                  if (!res.ok) setError(res.error || "Не вдалось видалити")
                }}
                disabled={busy}
                className="rounded-xl gap-2 text-destructive"
              >
                <Trash2 size={14} /> Видалити роль
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onCancel} disabled={busy} className="rounded-xl">
                Скасувати
              </Button>
              <Button type="submit" disabled={busy} className="rounded-xl gap-2">
                <Check size={14} />
                {busy ? "Зберігаю…" : isEdit ? "Зберегти" : "Створити"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
    </label>
  )
}

function labelForBaseRole(r: TeamRole): string {
  switch (r) {
    case "admin": return "Адмін"
    case "manager": return "Менеджер"
    case "master": return "Майстер"
    case "sales": return "Продажі"
    default: return r
  }
}

function hintForBaseRole(r: TeamRole): string {
  switch (r) {
    case "admin": return "бачить усі дані, керує командою"
    case "manager": return "бачить усі угоди, без фінзвітів"
    case "master": return "лише свої угоди"
    case "sales": return "лише свої ліди"
    default: return ""
  }
}
