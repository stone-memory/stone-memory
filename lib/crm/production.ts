/**
 * Стандартний виробничий цикл (порядок = enum у supabase/crm-migration.sql).
 *
 * Раніше жив у app/api/crm/production-stages/route.ts як експорт. Next
 * забороняє довільні експорти з route-файлів (типізовані роути), і
 * webpack-збірка на цьому падала; Turbopack пропускав. Тепер константа тут.
 */
export const PROD_STAGE_PIPELINE = [
  "raw_material",
  "cutting",
  "grinding",
  "polishing",
  "engraving",
  "sealing",
  "qc",
  "packaging",
  "transport",
  "foundation",
  "installation",
  "cleanup",
] as const

export type ProdStagePipelineKind = (typeof PROD_STAGE_PIPELINE)[number]
