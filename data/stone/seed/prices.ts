import type { CalculatorRates, Price } from '@/lib/stone/cms-types'

/** Відомі ціни матеріалів; решта колекцій отримує value 0 = «ціна за запитом». */
export const knownPrices: Record<string, Price> = {
  'grey-ukraine': { value: 3640, unit: 'пог.м', currency: 'грн' },
  'kometa-black': { value: 3900, unit: 'пог.м', currency: 'грн' },
  'volga-blue': { value: 6000, unit: 'пог.м', currency: 'грн' },
  'irina-blue': { value: 5200, unit: 'пог.м', currency: 'грн' },
  'rosso-santiago': { value: 2030, unit: 'м²', currency: 'грн' },
  'maple-red': { value: 2200, unit: 'м²', currency: 'грн' },
  'star-of-ukraine': { value: 2620, unit: 'пог.м', currency: 'грн' },
  sophiyvsky: { value: 2400, unit: 'пог.м', currency: 'грн' },
  'bianco-carrara': { value: 240, unit: 'м²', currency: '€' },
  'taj-mahal': { value: 650, unit: 'м²', currency: '€' },
  'caesarstone-calacatta-nuvo': { value: 20148, unit: 'м²', currency: 'грн' },
  'atem-white': { value: 3590, unit: 'м²', currency: 'грн' },
  avant: { value: 8121, unit: 'м²', currency: 'грн' },
  neolith: { value: 15790, unit: 'м²', currency: 'грн' },
  dekton: { value: 10011, unit: 'м²', currency: 'грн' },
}

/** Ставки калькулятора (адмінка → Стільниці → Калькулятор). */
export const calculator: CalculatorRates = {
  productRates: { Стільниця: 5600, Підвіконня: 3900, Сходи: 4800 },
  materialRates: { 'Базовий рівень': 1, 'Середній рівень': 1.35, 'Преміальний рівень': 1.8 },
  edgeRates: { Прямий: 0, Заокруглений: 650, Інший: 1100 },
  cutoutRate: 900,
  minimumOrder: 4500,
}
