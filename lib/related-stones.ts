import type { StoneItem } from "@/lib/types"

/**
 * «Схожі моделі» для картки товару — багатокритеріальний бал, а не простий
 * фільтр. Кожен збіг додає бали, у блок ідуть найвищі: клієнт бачить справді
 * близькі позиції, а не випадкові з тієї ж категорії й кольору.
 *
 * Рахується на сервері. Раніше це робив клієнт у useMemo, і задля шести
 * карток сторінка товару несла в RSC-корисному навантаженні всі 200+ позицій
 * каталогу — ~150 КБ HTML на кожен перегляд із телефона.
 */
export function relatedStones(stone: StoneItem, stones: StoneItem[], limit = 6): StoneItem[] {
  const PRICE_TOLERANCE = 0.35 // ±35 % від ціни поточного каменю — «близько»
  const minPrice = stone.priceFrom ? stone.priceFrom * (1 - PRICE_TOLERANCE) : undefined
  const maxPrice = stone.priceFrom ? stone.priceFrom * (1 + PRICE_TOLERANCE) : undefined
  const sameCategory = stones.filter((s) => s.id !== stone.id && s.category === stone.category)

  const scored = sameCategory
    .map((s) => {
      let score = 0
      if (s.color && s.color === stone.color) score += 4
      if (s.materialType && s.materialType === stone.materialType) score += 4
      if (s.shape && s.shape === stone.shape) score += 3
      if (s.finish && s.finish === stone.finish) score += 2
      if (s.priceFrom && minPrice && maxPrice && s.priceFrom >= minPrice && s.priceFrom <= maxPrice) score += 2
      if (s.origin && stone.origin && s.origin.split(",")[0] === stone.origin.split(",")[0]) score += 1
      if (s.isFeatured) score += 1
      return { s, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ s }) => s)

  if (scored.length > 0) return scored

  // Рідкісний камінь без збігів: та сама категорія, відсортована за близькістю ціни.
  return sameCategory
    .sort(
      (a, b) =>
        Math.abs((a.priceFrom ?? 0) - (stone.priceFrom ?? 0)) - Math.abs((b.priceFrom ?? 0) - (stone.priceFrom ?? 0))
    )
    .slice(0, limit)
}
