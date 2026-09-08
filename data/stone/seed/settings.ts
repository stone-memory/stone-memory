import type { Settings } from '@/lib/stone/cms-types'
import { contacts } from '@/data/stone/seed/contacts'
import { calculator } from '@/data/stone/seed/prices'
import { faq } from '@/data/stone/seed/faq'
import { supportPages } from '@/data/stone/seed/support'
import { comparisons } from '@/data/stone/seed/comparisons'
import { geoCities } from '@/data/stone/seed/geo'
import { professional } from '@/data/stone/seed/professional'
import { service } from '@/data/stone/seed/service'

/** Початкові налаштування для таблиці stilnytsi_settings (ключ = поле). */
export const settings: Settings = {
  contacts,
  calculator,
  faq,
  support: supportPages,
  comparisons,
  geo: geoCities,
  professional,
  service,
}
