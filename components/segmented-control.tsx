"use client"

import { motion } from "framer-motion"
import { useTranslation } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"
import type { Category } from "@/lib/types"

interface SegmentedControlProps {
  value: Category
  onChange: (value: Category) => void
  className?: string
}

export function SegmentedControl({
  value,
  onChange,
  className,
}: SegmentedControlProps) {
  const { t } = useTranslation()

  const segments: { value: Category; label: string }[] = [
    { value: "memorial", label: t.nav.memorial },
    { value: "home", label: t.nav.home },
  ]
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full bg-foreground/5 p-1",
        className
      )}
    >
      {segments.map((segment) => (
        <button
          key={segment.value}
          onClick={() => onChange(segment.value)}
          className={cn(
            "relative px-4 py-1.5 text-sm font-medium transition-colors duration-200",
            "rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            value === segment.value
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground/80"
          )}
        >
          {value === segment.value && (
            <motion.span
              layoutId="segment-bg"
              className="absolute inset-0 rounded-full bg-card shadow-soft"
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 35,
              }}
            />
          )}
          <span className="relative z-10">{segment.label}</span>
        </button>
      ))}
    </div>
  )
}
