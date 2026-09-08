/**
 * Родини матеріалів: слаг URL → назва, за якою фільтруються колекції
 * (Collection.family). Кожна родина — статичний сегмент app/materialy/(families)/<slug>,
 * тому колізія зі слагом колекції в app/materialy/[collection] неможлива на рівні
 * файлової системи.
 *
 * Не плутати зі слагами Material (data/materials.ts): там 'keramohranit' —
 * внутрішній ключ матеріалу для калькулятора й слябів, а URL керамограніту — /materialy/keramogranit.
 */
export const families = {
  granit: 'Граніт',
  marmur: 'Мармур',
  kvarc: 'Кварц',
  keramogranit: 'Керамограніт',
  kvarcyt: 'Кварцит',
  labradoryt: 'Лабрадорит',
} as const

export type FamilySlug = keyof typeof families
export const familySlugs = Object.keys(families) as FamilySlug[]

/** Адреса родини для слага матеріалу з data/materials.ts ('keramohranit' → /materialy/keramogranit). */
export const familyHrefForMaterial = (materialSlug: string) =>
  `/arkhitekturnyi-kamin/materialy/${materialSlug === 'keramohranit' ? 'keramogranit' : materialSlug}`
