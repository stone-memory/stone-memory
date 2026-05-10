"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, X, Minus, LayoutGrid, Table2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  ROLE_PERMISSIONS,
  ALL_ROLES_ORDERED,
  PERMISSION_MATRIX,
  type PermissionCell,
} from "@/lib/permissions/role-definitions"
import { RolePermissionCard } from "@/components/admin/role-permission-card"
import type { TeamRole } from "@/lib/crm/types"
import { cn } from "@/lib/utils"

/**
 * /admin/team/permissions — comparison reference for all roles.
 *
 * Two view modes:
 *   1. Cards — same RolePermissionCard used in the new-member modal,
 *      laid out in a grid with their full can/cannot lists expanded.
 *   2. Table — side-by-side matrix of capabilities × roles, grouped by
 *      area (Угоди / Клієнти / Фінанси / …). Best for "is this safe to
 *      give to a sales rep?" snap decisions.
 *
 * Mobile: cards stack to one column; table becomes horizontally
 * scrollable (overflow-x-auto wrapper).
 */
export default function PermissionsPage() {
  const [view, setView] = useState<"cards" | "table">("cards")

  return (
    <div className="space-y-6">
      <Link
        href="/admin/team"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} /> До команди
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight-custom">Права ролей</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-prose">
            Що може кожна роль, а що ні. Відкривайте перед тим, як додавати нову людину в команду —
            щоб не переживати, чи не даєте забагато доступу. Дані тут описують реальні обмеження
            у Postgres RLS — UI-блокування дзеркалить серверні правила.
          </p>
        </div>
        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)} className="w-auto">
          <TabsList>
            <TabsTrigger value="cards" className="gap-1.5">
              <LayoutGrid size={14} /> Картки
            </TabsTrigger>
            <TabsTrigger value="table" className="gap-1.5">
              <Table2 size={14} /> Таблиця
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
        <TabsContent value="cards">
          <CardsView />
        </TabsContent>
        <TabsContent value="table">
          <TableView />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ----------------------------------------------------------------
// Cards view — full can/cannot for each role, no hover required.
// ----------------------------------------------------------------
function CardsView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {ALL_ROLES_ORDERED.map((role) => {
        const def = ROLE_PERMISSIONS[role]
        const Icon = def.icon
        return (
          <article
            key={role}
            className={cn(
              "rounded-2xl border bg-card p-5",
              role === "super_admin"
                ? "border-amber-300/40 bg-amber-50/30 dark:bg-amber-900/10"
                : "border-foreground/10"
            )}
          >
            <header className="flex items-start gap-3">
              <Icon size={20} className={def.iconClass} />
              <div className="flex-1">
                <h2 className="text-lg font-semibold tracking-tight-custom">{def.label}</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">{def.description}</p>
              </div>
            </header>

            {def.warning && (
              <div className="mt-3 rounded-lg bg-amber-100/70 px-3 py-2 text-xs text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
                ⚠ {def.warning}
              </div>
            )}

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {def.can.length > 0 && (
                <div>
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                    Може
                  </div>
                  <ul className="space-y-1.5 text-sm leading-snug">
                    {def.can.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check size={13} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {def.cannot.length > 0 && (
                <div>
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                    Не може
                  </div>
                  <ul className="space-y-1.5 text-sm leading-snug">
                    {def.cannot.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <X size={13} className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}

// ----------------------------------------------------------------
// Table view — capability × role matrix.
// ----------------------------------------------------------------
function TableView() {
  // Group rows by `group` for visual separation.
  const grouped = useMemo(() => {
    const map = new Map<string, typeof PERMISSION_MATRIX>()
    for (const row of PERMISSION_MATRIX) {
      const arr = map.get(row.group) ?? []
      arr.push(row)
      map.set(row.group, arr)
    }
    return Array.from(map.entries())
  }, [])

  return (
    <div className="overflow-x-auto rounded-2xl border border-foreground/10 bg-card">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 border-b border-foreground/10 bg-card text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left w-2/5">Можливість</th>
            {ALL_ROLES_ORDERED.map((role) => {
              const def = ROLE_PERMISSIONS[role]
              const Icon = def.icon
              return (
                <th key={role} className="px-3 py-3 text-center min-w-[120px]">
                  <div className="inline-flex items-center gap-1.5">
                    <Icon size={12} className={def.iconClass} />
                    <span>{def.label}</span>
                  </div>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {grouped.map(([group, rows]) => (
            <tbody key={group} className="divide-y divide-foreground/5">
              <tr className="bg-foreground/[0.02]">
                <th colSpan={1 + ALL_ROLES_ORDERED.length} className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {group}
                </th>
              </tr>
              {rows.map((row, i) => (
                <tr key={`${group}-${i}`} className="border-t border-foreground/5">
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium leading-snug">{row.label}</div>
                    {row.description && (
                      <div className="mt-0.5 text-xs text-muted-foreground">{row.description}</div>
                    )}
                  </td>
                  {ALL_ROLES_ORDERED.map((role) => (
                    <td key={role} className="px-3 py-3 text-center align-top">
                      <CellMark
                        cell={row.byRole[role]}
                        note={row.partialNote?.[role]}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CellMark({ cell, note }: { cell: PermissionCell; note?: string }) {
  if (cell === "yes") {
    return (
      <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 p-1 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
        <Check size={14} />
      </span>
    )
  }
  if (cell === "no") {
    return (
      <span className="inline-flex items-center justify-center rounded-full bg-rose-100 p-1 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
        <X size={14} />
      </span>
    )
  }
  // partial
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-amber-100 p-1 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
      title={note || "часткові права"}
    >
      <Minus size={14} />
      {note && <span className="ml-1 text-[10px] font-medium">{note}</span>}
    </span>
  )
}
