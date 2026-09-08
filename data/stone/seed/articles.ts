import type { Article } from '@/lib/stone/cms-types'
import { part1 } from '@/data/stone/seed/articles/part-1'
import { part2 } from '@/data/stone/seed/articles/part-2'
import { part3 } from '@/data/stone/seed/articles/part-3'

/**
 * Початкові статті журналу (18). Після імпорту в базу редагуються в адмінці
 * памʼятників → Стільниці → Блог; цей файл — лише для повторного імпорту.
 */
export const articles: Article[] = [...part1, ...part2, ...part3]
