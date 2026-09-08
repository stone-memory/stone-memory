import type { CalculatorRates, Price } from '@/lib/stone/cms-types'

/** «від 3 640 грн/пог.м» або «ціна за запитом», якщо ціни нема. */
export function formatPrice(p: Price | undefined | null) {
  if (!p?.value) return 'ціна за запитом'
  const value = new Intl.NumberFormat('uk-UA').format(p.value).replace(/\s/g, ' ')
  return `від ${value} ${p.currency}/${p.unit}`
}

export type EstimateInput = {
  product: string
  tier: string
  lengthMm: number
  widthMm: number
  edge: string
  cutouts: number
}

/** Орієнтовна вартість виробу за ставками з налаштувань (адмінка → Стільниці → Калькулятор). */
export function estimatePrice(rates: CalculatorRates, input: EstimateInput) {
  const area = (Math.max(0, input.lengthMm) * Math.max(0, input.widthMm)) / 1_000_000
  const product = rates.productRates[input.product] ?? Object.values(rates.productRates)[0] ?? 0
  const tier = rates.materialRates[input.tier] ?? 1
  const edge = rates.edgeRates[input.edge] ?? 0
  return Math.max(
    rates.minimumOrder,
    Math.round(
      (area * product * tier + edge + Math.max(0, input.cutouts) * rates.cutoutRate) / 100
    ) * 100
  )
}
