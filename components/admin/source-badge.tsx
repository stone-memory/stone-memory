import { Badge } from "@/components/ui/badge"

/**
 * Позначка джерела заявки. Показується лише для заявок з інших сайтів
 * бренду; заявки з сайту памʼятників (source null / 'site' / 'selection-form')
 * позначки не мають — це типовий випадок, і шум ні до чого.
 */
const LABELS: Record<string, string> = {
  stilnytsi: "Стільниці",
}

export function SourceBadge({ source }: { source?: string | null }) {
  const label = source ? LABELS[source] : undefined
  if (!label) return null
  return (
    <Badge
      variant="outline"
      className="bg-teal-500/10 text-teal-700 border-teal-500/20 text-[10px] uppercase tracking-wide"
    >
      {label}
    </Badge>
  )
}
