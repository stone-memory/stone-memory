// Shared config for generic /api/content/[resource] routes.
// Each collection maps to one table with an id column, data jsonb, and an ordering column.

export type CollectionConfig = {
  table: string
  idColumn: string
  orderColumn: string // column used for ORDER BY
  orderAsc?: boolean  // default true
  selectColumns: string
}

export const collections: Record<string, CollectionConfig> = {
  stones: {
    table: "stones",
    idColumn: "id",
    orderColumn: "position",
    selectColumns: "*",
  },
  services: {
    table: "services",
    idColumn: "slug",
    orderColumn: "position",
    selectColumns: "*",
  },
  projects: {
    table: "projects",
    idColumn: "slug",
    orderColumn: "position",
    selectColumns: "*",
  },
  articles: {
    table: "articles",
    idColumn: "slug",
    orderColumn: "position",
    selectColumns: "*",
  },
  reviews: {
    table: "reviews",
    idColumn: "id",
    orderColumn: '"order"',
    selectColumns: "*",
  },
  "faq-items": {
    table: "faq_items",
    idColumn: "id",
    orderColumn: '"order"',
    selectColumns: "*",
  },
  tasks: {
    table: "tasks",
    idColumn: "id",
    orderColumn: "updated_at",
    orderAsc: false,
    selectColumns: "*",
  },
  transactions: {
    table: "transactions",
    idColumn: "id",
    orderColumn: "occurred_at",
    orderAsc: false,
    selectColumns: "*",
  },
  "crm-messages": {
    table: "crm_messages",
    idColumn: "id",
    orderColumn: "received_at",
    orderAsc: false,
    selectColumns: "*",
  },
}

export function getCollection(resource: string): CollectionConfig | null {
  return collections[resource] ?? null
}
