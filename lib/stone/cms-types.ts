/**
 * Типи контенту сайту стільниць. Самі дані живуть у Supabase (таблиці
 * stilnytsi_*), редагуються в адмінці памʼятників і читаються через lib/cms.ts.
 * Початкові значення для першого імпорту — у data/seed/*.
 */

export type Price = { value: number; unit: 'пог.м' | 'м²'; currency: 'грн' | '€' }

export type Collection = {
  slug: string
  name: string
  /** Внутрішній ключ матеріалу для калькулятора й слябів: granit | marmur | kvarcyt | kvarc | keramohranit */
  material: string
  /** Назва родини, як у data/families.ts (Граніт, Мармур, Кварц, Керамограніт, Кварцит, Лабрадорит) */
  family: string
  origin: string
  tone: string
  finishes: string[]
  thicknesses: number[]
  applications: string[]
  description: string
  image: string
  cardImage: string
  brand?: string
  formats?: string[]
  exteriorOnly?: boolean
  care: string
  relatedArticles: string[]
  relatedCategories: string[]
  /** Без ціни (value 0) на сайті пишемо «ціна за запитом». */
  price?: Price
}

export type Project = {
  slug: string
  name: string
  type: string
  material: string
  materialSlug: string
  location: string
  story: string
  solution: string
  image: string
  gallery: string[]
  alt: string
}

export type ArticleCategory = 'Матеріали' | 'Догляд' | 'Проєктування' | 'Ціни'

export type Article = {
  slug: string
  title: string
  h1: string
  description: string
  dek: string
  category: ArticleCategory
  readingTime: string
  datePublished: string
  dateModified: string
  intro: string
  /** body — абзаци через порожній рядок */
  sections: { heading: string; body: string }[]
  table: { headers: string[]; rows: string[][] }
  faq: { question: string; answer: string }[]
  related: string[]
  materials: string[]
  categories: string[]
  /** Обкладинка; якщо порожньо — /blog/<slug>.webp */
  image?: string
  /** Друге фото в тексті; якщо порожньо — /blog/<slug>-detail.webp */
  detailImage?: string
}

export type Slab = {
  id: string
  material: string
  collection: string
  collectionSlug: string
  tone: string
  dimensions: [number, number]
  thickness: number
  finish: string
  lot: string
  origin: string
  availability: string
  uniqueness: string
  status: 'В наявності' | 'Резерв' | 'Під замовлення'
  quantity: number
  price: number
  image: string
  alt: string
}

export type Remnant = {
  id: string
  name: string
  size: string
  thickness: string
  finish: string
  price: string
  status: string
  image: string
}

export type Contacts = {
  legalName: string
  brand: string
  company: string
  phone: { display: string; href: string }
  email: { display: string; href: string }
  address: {
    city: string
    region: string
    country: string
    street: string
    postalCode: string
    lat: number
    lng: number
  }
  hours: { weekdays: string; saturday: string; sunday: string }
  chat: { viber: string; telegram: string; whatsapp: string }
  social: { instagram: string; facebook: string }
}

export type CalculatorRates = {
  /** грн за м² для типу виробу */
  productRates: Record<string, number>
  /** множник рівня матеріалу */
  materialRates: Record<string, number>
  /** доплата за профіль кромки, грн */
  edgeRates: Record<string, number>
  cutoutRate: number
  minimumOrder: number
}

export type Faq = { question: string; answer: string }
export type FaqSet = { category: Faq[]; calculator: Faq[]; b2b: Faq[]; geo: Faq[] }

export type SupportPage = {
  eyebrow: string
  title: string
  copy: string
  sections: { title: string; copy: string }[]
  faq: Faq[]
}
export type SupportPages = Record<string, SupportPage>

export type Comparison = {
  title: string
  /** Коротший заголовок для <title> */
  seoTitle: string
  left: string
  right: string
  verdict: string
  rows: string[][]
}
export type Comparisons = Record<string, Comparison>

export type GeoCity = { locative: string; context: string; distance: string }
export type GeoCities = Record<string, GeoCity>

export type ProfessionalSegment = {
  slug: string
  name: string
  copy: string
  image: string
  alt: string
  deliverables: string[]
}
export type ProfessionalSpecial = { title: string; seoTitle: string; copy: string; items: string[] }
export type Professional = {
  segments: ProfessionalSegment[]
  specials: Record<string, ProfessionalSpecial>
  specificationSteps: string[]
  tradeBenefits: string[]
  b2bFaq: { q: string; a: string }[]
}

export type Service = {
  promises: { response: string; turnaround: string; warranty: string }
  workSteps: [string, string, string][]
}

/** Ключі таблиці stilnytsi_settings → тип значення. */
export type Settings = {
  contacts: Contacts
  calculator: CalculatorRates
  faq: FaqSet
  support: SupportPages
  comparisons: Comparisons
  geo: GeoCities
  professional: Professional
  service: Service
}
export type SettingKey = keyof Settings
