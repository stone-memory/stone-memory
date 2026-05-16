"use client"

import { Info, Check, X, AlertTriangle } from "lucide-react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  ROLE_PERMISSIONS,
  type RolePermissions,
} from "@/lib/permissions/role-definitions"
import type { TeamRole } from "@/lib/crm/types"
import { cn } from "@/lib/utils"

/**
 * A clickable role card with rich permission detail.
 *
 * Two interaction modes:
 *   - Card click → calls `onSelect(role)` (used by the new-member modal
 *     to pick the role for the new teammate).
 *   - "i" info button → opens a HoverCard (desktop hover) AND Popover
 *     (mobile tap) showing the full can/cannot lists. Both are wired so
 *     the same content appears regardless of input device.
 *
 * If `onSelect` is omitted, the whole card is non-interactive — useful
 * for the /admin/team/permissions reference page.
 */
export function RolePermissionCard({
  role,
  active = false,
  onSelect,
}: {
  role: TeamRole
  active?: boolean
  onSelect?: (role: TeamRole) => void
}) {
  const def = ROLE_PERMISSIONS[role]
  const Icon = def.icon
  const interactive = Boolean(onSelect)

  return (
    <div
      className={cn(
        "relative rounded-xl border px-3 py-2 text-left text-xs transition-colors",
        active
          ? "border-foreground bg-foreground/5"
          : "border-foreground/15 hover:border-foreground/30 hover:bg-foreground/[0.02]",
        interactive && "cursor-pointer"
      )}
      onClick={interactive ? () => onSelect?.(role) : undefined}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onSelect?.(role)
              }
            }
          : undefined
      }
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5">
          <Icon size={14} className={def.iconClass} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 font-medium">
            {def.label}
            <RoleInfoTrigger role={role} />
          </div>
          <p className="mt-0.5 text-muted-foreground line-clamp-2">{def.description}</p>
        </div>
      </div>
    </div>
  )
}

/**
 * The "i" button that opens the role detail. We render a HoverCard for
 * pointer devices (instant on hover, no click required) AND a Popover
 * for touch devices. Both contain the same body so editing copy means
 * editing one place: PermissionsBody.
 */
function RoleInfoTrigger({ role }: { role: TeamRole }) {
  const def = ROLE_PERMISSIONS[role]
  return (
    <>
      {/* Desktop: hover-only */}
      <HoverCard openDelay={150}>
        <HoverCardTrigger asChild>
          <button
            type="button"
            aria-label={`Деталі ролі ${def.label}`}
            onClick={(e) => e.stopPropagation()}
            className="hidden md:inline-flex items-center justify-center rounded-full p-0.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          >
            <Info size={11} />
          </button>
        </HoverCardTrigger>
        <HoverCardContent
          align="start"
          side="right"
          className="w-80 p-0"
          sideOffset={8}
        >
          <PermissionsBody def={def} />
        </HoverCardContent>
      </HoverCard>

      {/* Mobile: tap-to-open */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`Деталі ролі ${def.label}`}
            onClick={(e) => e.stopPropagation()}
            className="md:hidden inline-flex items-center justify-center rounded-full p-0.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          >
            <Info size={11} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="bottom"
          className="w-72 p-0"
          sideOffset={6}
          onClick={(e) => e.stopPropagation()}
        >
          <PermissionsBody def={def} />
        </PopoverContent>
      </Popover>
    </>
  )
}

function PermissionsBody({ def }: { def: RolePermissions }) {
  const Icon = def.icon
  return (
    <div className="space-y-3 p-4 text-sm">
      <header className="flex items-start gap-2">
        <Icon size={16} className={def.iconClass} />
        <div>
          <h4 className="font-semibold leading-tight">{def.label}</h4>
          <p className="text-xs text-muted-foreground leading-snug">{def.description}</p>
        </div>
      </header>

      {def.warning && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-100/70 px-2.5 py-2 text-xs text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
          <AlertTriangle size={12} className="mt-0.5 shrink-0" />
          <span>{def.warning}</span>
        </div>
      )}

      {def.can.length > 0 && (
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            Може
          </div>
          <ul className="space-y-1 text-xs leading-snug">
            {def.can.map((item) => (
              <li key={item} className="flex items-start gap-1.5">
                <Check size={11} className="mt-1 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {def.cannot.length > 0 && (
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
            Не може
          </div>
          <ul className="space-y-1 text-xs leading-snug">
            {def.cannot.map((item) => (
              <li key={item} className="flex items-start gap-1.5">
                <X size={11} className="mt-1 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
