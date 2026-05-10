import type { Order } from "@/lib/types"

interface KPICardProps {
  label: string
  value: string | number
  trend?: { value: number; isPositive: boolean }
  sparkline?: number[]
}

function MiniSparkline({ data }: { data: number[] }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100
      const y = ((max - v) / range) * 32
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg viewBox="0 0 100 32" className="w-full h-8 mt-3">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        className="opacity-30"
      />
    </svg>
  )
}

export function KPICard({ label, value, trend, sparkline }: KPICardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-black/5">
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
          {label}
        </div>
        {trend && (
          <div
            className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
              trend.isPositive
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {trend.isPositive ? "+" : "-"}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="text-3xl font-semibold tracking-tight">{value}</div>
      {sparkline && <MiniSparkline data={sparkline} />}
    </div>
  )
}
