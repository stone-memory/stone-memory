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
  // for personal tasks which aren't a role-gated resource).
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
  tasks: {
    table: "tasks",
    idColumn: "id",
    orderColumn: "updated_at",
    orderAsc: false,
    selectColumns: "*",
    // Personal task board — any active team member manages their own.
    writeCapability: null,
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
}

export function getCollection(resource: string): CollectionConfig | null {
  return collections[resource] ?? null
}
