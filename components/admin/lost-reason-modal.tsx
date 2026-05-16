"use client"

import { useState } from "react"
import { Check, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  LOST_REASON_OPTIONS,
  type LostReason,
} from "@/lib/crm/types"
import { cn } from "@/lib/utils"

/**
 * Modal that intercepts a deal status transition to "cancelled" or "lost"
 * and asks for a reason before letting it through.
 *
 * The reason is captured at close-time so post-mortem analytics has real
 * data ("how many lost to price last quarter?") instead of guesswork.
 *
 * The parent owns the actual API call — this modal just gathers
 * { lost_reason, lost_reason_note } and hands them to onConfirm together
 * with the target status.
 */
export function LostReasonModal({
  open,
  targetStatus,
  busy,
  onCancel,
  onConfirm,
}: {
  open: boolean
  /** Which terminal status the user is moving the deal to. */
  targetStatus: "cancelled" | "lost"
  /** Disable buttons while parent is saving. */
  busy?: boolean
  onCancel: () => void
  onConfirm: (payload: { lost_reason: LostReason; lost_reason_note: string | null }) => void
}) {
  const [reason, setReason] = useState<LostReason | null>(null)
  const [note, setNote] = useState("")
  const [showError, setShowError] = useState(false)

  if (!open) return null

  const options = LOST_REASON_OPTIONS.filter((o) => o.appliesTo.includes(targetStatus))
  const headerCopy =
    targetStatus === "lost"
      ? "Чому угода втрачена?"
      : "Чому скасовано?"
  const subCopy =
    targetStatus === "lost"
      ? "Цю інформацію використовуємо для звіту «куди витікають ліди»."
      : "Допомагає відрізнити справжні скасування від дублікатів і випадкових помилок."

  const submit = () => {
    if (!reason) {
      setShowError(true)
      return
    }
    onConfirm({
      lost_reason: reason,
      lost_reason_note: note.trim() ? note.trim() : null,
    })
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-foreground/10 bg-card shadow-hover">
        <div className="flex items-start justify-between gap-4 border-b border-foreground/5 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight-custom">{headerCopy}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{subCopy}</p>
          </div>
          <button
            onClick={onCancel}
            disabled={busy}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div>
            <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Причина
            </span>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {options.map((opt) => {
                const active = reason === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setReason(opt.value)
                      setShowError(false)
                    }}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                      active
                        ? "border-foreground bg-foreground/5"
                        : "border-foreground/10 hover:border-foreground/30 hover:bg-foreground/[0.02]"
                    )}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
            {showError && !reason && (
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-destructive">
                <AlertCircle size={12} /> Виберіть одну з причин
              </p>
            )}
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Деталі (необов'язково)
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder={
                reason === "competitor"
                  ? "Назва конкурента, ціна / умови які вони запропонували…"
                  : reason === "price"
                    ? "Який бюджет очікував клієнт?"
                    : "Будь-який контекст, який допоможе через рік пригадати, що сталось…"
              }
              className="w-full rounded-xl border border-foreground/10 bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/5"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-foreground/5 bg-foreground/[0.02] px-5 py-3">
          <Button variant="outline" onClick={onCancel} disabled={busy} className="rounded-xl">
            Назад
          </Button>
          <Button
            onClick={submit}
            disabled={busy}
            className="rounded-xl gap-2"
            variant={targetStatus === "lost" ? "destructive" : "default"}
          >
            {busy ? "Зберігаю…" : (
              <>
                <Check size={14} />
                {targetStatus === "lost" ? "Позначити втраченою" : "Скасувати угоду"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
