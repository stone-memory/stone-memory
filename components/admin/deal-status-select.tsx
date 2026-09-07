"use client"

import {
  DEAL_MAIN_FLOW,
  DEAL_STATUS_LABELS_UK,
  availableTransitions,
  type DealStatus,
} from "@/lib/crm/types"
import { cn } from "@/lib/utils"

/**
 * Один випадний список «Перевести в…» замість десятка пігулок.
 * Групи: «Далі» (будь-який наступний етап), «Назад» (один крок), «Інше»
 * (пауза / скасування / втрата). Значення після вибору скидається, щоб
 * список завжди показував підказку, а не поточний статус.
 */
export function DealStatusSelect({
  status,
  onChange,
  disabled,
  className,
}: {
  status: DealStatus
  onChange: (next: DealStatus) => void
  disabled?: boolean
  className?: string
}) {
  const options = availableTransitions(status).filter((s) => s !== "new")
  if (options.length === 0) return null

  const idx = DEAL_MAIN_FLOW.indexOf(status)
  const forward = options.filter((s) => DEAL_MAIN_FLOW.indexOf(s) > idx)
  const back = options.filter((s) => {
    const j = DEAL_MAIN_FLOW.indexOf(s)
    return j >= 0 && j < idx
  })
  const side = options.filter((s) => DEAL_MAIN_FLOW.indexOf(s) === -1)

  return (
    <select
      value=""
      disabled={disabled}
      onChange={(e) => {
        const next = e.target.value as DealStatus | ""
        if (next) onChange(next)
      }}
      className={cn(
        "h-7 max-w-full rounded-full border border-foreground/15 bg-background px-2 text-xs text-foreground hover:border-foreground/40 disabled:opacity-50",
        className
      )}
      aria-label="Перевести угоду в інший статус"
    >
      <option value="">Перевести в…</option>
      {forward.length > 0 && (
        <optgroup label="Далі">
          {forward.map((s) => (
            <option key={s} value={s}>
              {DEAL_STATUS_LABELS_UK[s]}
            </option>
          ))}
        </optgroup>
      )}
      {back.length > 0 && (
        <optgroup label="Назад">
          {back.map((s) => (
            <option key={s} value={s}>
              {DEAL_STATUS_LABELS_UK[s]}
            </option>
          ))}
        </optgroup>
      )}
      {side.length > 0 && (
        <optgroup label="Інше">
          {side.map((s) => (
            <option key={s} value={s}>
              {DEAL_STATUS_LABELS_UK[s]}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  )
}
