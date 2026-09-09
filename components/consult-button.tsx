"use client"

import { ArrowRight } from "lucide-react"
import { useSelectionStore } from "@/lib/store/selection"
import { cn } from "@/lib/utils"

/**
 * Кнопка «отримати розрахунок» для інформаційних сторінок.
 *
 * Відкриває той самий бічний блок заявки, що й кошик каталогу — форма одна,
 * заявка йде в CRM тим самим шляхом. Окремої форми на кожній сторінці не
 * потрібно, а посилання на #contact вело б у футер, де форми немає.
 */
export function ConsultButton({
  children = "Отримати розрахунок",
  variant = "primary",
  className,
}: {
  children?: React.ReactNode
  variant?: "primary" | "secondary"
  className?: string
}) {
  const openSidebar = useSelectionStore((s) => s.openSidebar)
  return (
    <button
      type="button"
      onClick={openSidebar}
      className={cn(
        "group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-transform hover:-translate-y-[1px] active:scale-[0.98]",
        variant === "primary"
          ? "bg-foreground text-background"
          : "border border-foreground/15 bg-background text-foreground hover:bg-foreground/5",
        className
      )}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
    </button>
  )
}
