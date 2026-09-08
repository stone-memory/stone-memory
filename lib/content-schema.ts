// Shared config for generic /api/content/[resource] routes.
// Each collection maps to one table with an id column, data jsonb, and an ordering column.

import type { Capability } from "@/lib/permissions/capabilities"

export type CollectionConfig = {
  table: string
  idColumn: string
  orderColumn: string // column used for ORDER BY
  orderAsc?: boolean  // default true
  selectColumns: string
  // Capability required to MUTATE this collection (POST/PATCH/DELETE/
  // reorder). GET stays public — the storefront reads catalog data
  // unauthenticated. `null` = any active team member may write (used
  // for resources that aren't role-gated).
  writeCapability: Capability | null
}

export const collections: Record<string, CollectionConfig> = {
  stones: {
    table: "stones",
    idColumn: "id",
    orderColumn: "position",
    selectColumns: "*",
    writeCapability: "content.catalog",
  },
  services: {
    table: "services",
    idColumn: "slug",
    orderColumn: "position",
    selectColumns: "*",
    writeCapability: "content.catalog",
  },
  projects: {
    table: "projects",
    idColumn: "slug",
    orderColumn: "position",
    selectColumns: "*",
    writeCapability: "content.editorial",
  },
  articles: {
    table: "articles",
    idColumn: "slug",
    orderColumn: "position",
    selectColumns: "*",
    writeCapability: "content.editorial",
  },
  reviews: {
    table: "reviews",
    idColumn: "id",
    orderColumn: '"order"',
    selectColumns: "*",
    writeCapability: "content.editorial",
  },
  "faq-items": {
    table: "faq_items",
    idColumn: "id",
    orderColumn: '"order"',
    selectColumns: "*",
    writeCapability: "content.editorial",
  },
  transactions: {
    table: "transactions",
    idColumn: "id",
    orderColumn: "occurred_at",
    orderAsc: false,
    selectColumns: "*",
    writeCapability: "finances.view_company",
  },
  "crm-messages": {
    table: "crm_messages",
    idColumn: "id",
    orderColumn: "received_at",
    orderAsc: false,
    selectColumns: "*",
    writeCapability: "customers.message",
  },

  // === Сайт стільниць (окремий сайт, спільна база). Після запису
  // lib/seo/revalidate.ts стукає на його /api/revalidate. ===
  "stilnytsi-materials": {
    table: "stilnytsi_materials",
    idColumn: "slug",
    orderColumn: "position",
    selectColumns: "*",
    writeCapability: "content.editorial",
  },
  "stilnytsi-projects": {
    table: "stilnytsi_projects",
    idColumn: "slug",
    orderColumn: "position",
    selectColumns: "*",
    writeCapability: "content.editorial",
  },
  "stilnytsi-articles": {
    table: "stilnytsi_articles",
    idColumn: "slug",
    orderColumn: "position",
    selectColumns: "*",
    writeCapability: "content.editorial",
  },
  "stilnytsi-slabs": {
    table: "stilnytsi_slabs",
    idColumn: "id",
    orderColumn: "position",
    selectColumns: "*",
    writeCapability: "content.editorial",
  },
  "stilnytsi-remnants": {
    table: "stilnytsi_remnants",
    idColumn: "id",
    orderColumn: "position",
    selectColumns: "*",
    writeCapability: "content.editorial",
  },
}

export function getCollection(resource: string): CollectionConfig | null {
  return collections[resource] ?? null
}
