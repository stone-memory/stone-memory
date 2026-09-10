"use client"

import { ArrowRight } from "lucide-react"
import { useConsultStore } from "@/lib/store/consult"
import { cn } from "@/lib/utils"

/**
 * Кнопка «отримати розрахунок» для інформаційних сторінок.
 *
 * Відкриває модалку заявки (components/consult-modal.tsx): ім'я, телефон,
 * зручний канал зв'язку, повідомлення і фото або ескіз. Раніше вона відкривала
 * бічний кошик каталогу, але без вибраних моделей його форма не надсилалась,
 * а обіцяне в текстах «надішліть фото» не було куди прикріпити.
 *
 * `topic` — контекст блоку, з якого натиснули («Не знайшли свою модель?»),
 * іде менеджеру в заявці. Текст кнопки стає заголовком модалки.
 */
export function ConsultButton({
  children = "Отримати розрахунок",
  variant = "primary",
  className,
  topic,
}: {
  children?: React.ReactNode
  variant?: "primary" | "secondary"
  className?: string
  topic?: string
}) {
  const open = useConsultStore((s) => s.open)
  const title = typeof children === "string" ? children : undefined
  return (
    <button
      type="button"
      onClick={() => open({ title, topic })}
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
