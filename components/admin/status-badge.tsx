import type { OrderStatus } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: OrderStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<OrderStatus, { bg: string; text: string; border: string }> = {
    new: { bg: "bg-blue-500/10", text: "text-blue-700", border: "border-blue-500/20" },
    in_progress: { bg: "bg-amber-500/10", text: "text-amber-700", border: "border-amber-500/20" },
    completed: { bg: "bg-emerald-500/10", text: "text-emerald-700", border: "border-emerald-500/20" },
  }

  const { bg, text, border } = styles[status]
  const labels: Record<OrderStatus, string> = {
    new: "New",
    in_progress: "In Progress",
    completed: "Completed",
  }

  return (
    <Badge variant="outline" className={`${bg} ${text} ${border}`}>
      {labels[status]}
    </Badge>
  )
}
