/**
 * Структурні довідники сайту, що живуть у коді: категорії виробів, матеріали
 * (рівні для калькулятора), навігація. Увесь редагований контент — у lib/cms.ts.
 */
export { categories, materials } from '@/data/stone/materials'

export const nav = [
  { href: '/arkhitekturnyi-kamin/vyroby', label: 'Вироби' },
  { href: '/arkhitekturnyi-kamin/materialy', label: 'Матеріали' },
  { href: '/arkhitekturnyi-kamin/proekty', label: 'Проєкти' },
  { href: '/arkhitekturnyi-kamin/kalkulyator', label: 'Калькулятор' },
  { href: '/arkhitekturnyi-kamin/b2b', label: 'B2B' },
]
