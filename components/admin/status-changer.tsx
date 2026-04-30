"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { OrderStatus } from "@/lib/types"

interface StatusChangerProps {
  currentStatus: OrderStatus | undefined
  onChange: (status: OrderStatus) => void
}

export function StatusChanger({ currentStatus, onChange }: StatusChangerProps) {
  return (
    <Select value={currentStatus || "new"} onValueChange={(value) => onChange(value as OrderStatus)}>
      <SelectTrigger className="w-full h-10 rounded-xl border border-black/10">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="new">New</SelectItem>
        <SelectItem value="in_progress">In Progress</SelectItem>
        <SelectItem value="completed">Completed</SelectItem>
      </SelectContent>
    </Select>
  )
}
