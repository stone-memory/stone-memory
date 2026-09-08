/**
 * Структурні довідники сайту, що живуть у коді: категорії виробів, матеріали
 * (рівні для калькулятора), навігація. Увесь редагований контент — у lib/cms.ts.
 */
export { categories, materials } from '@/data/stone/materials'

export const nav = [
  { href: '/kamin/vyroby', label: 'Вироби' },
  { href: '/kamin/materialy', label: 'Матеріали' },
  { href: '/kamin/proekty', label: 'Проєкти' },
  { href: '/kamin/kalkulyator', label: 'Калькулятор' },
  { href: '/kamin/b2b', label: 'B2B' },
]
