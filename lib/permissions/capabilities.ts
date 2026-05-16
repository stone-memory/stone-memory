import type { TeamRole } from "@/lib/crm/types"

/**
 * Capability taxonomy — single source of truth.
 *
 * Capabilities are fine-grained permission flags that layer on top of
 * the base team_role. They power:
 *   • The role editor on /admin/team/permissions — capabilities are
 *     grouped into sections and rendered as checkboxes.
 *   • Server-side gating via `requireCapability()` in lib/auth/permissions.
 *   • Client-side UI gating via `useCurrentCapabilities()`.
 *
 * IMPORTANT: this file mirrors supabase/crm-custom-roles-migration.sql
 *   → `base_role_capabilities()` SQL function. If you add a capability
 *   here, also add it to the SQL list for the appropriate base roles
 *   (otherwise has_capability() in Postgres won't return true for
 *   members on system roles). Out-of-sync would mean UI shows a
 *   permission as enabled while server-side checks reject.
 */

export const CAPABILITIES = [
  // Deals
  "deals.view_all",
  "deals.create",
  "deals.edit",
  "deals.delete_permanent",

  // Customers
  "customers.view_all",
  "customers.edit",
  "customers.message",

  // Finances
  "finances.view_company",
  "finances.record_payments",
  "finances.create_documents",

  // Team
  "team.manage",
  "team.change_credentials",

  // Content
  "content.catalog",
  "content.editorial",

  // Settings
  "integrations.manage",
  "data.export",
] as const

export type Capability = (typeof CAPABILITIES)[number]

export function isCapability(value: string): value is Capability {
  return (CAPABILITIES as readonly string[]).includes(value)
}

/**
 * Human-readable label per capability — Ukrainian, shown in the role
 * editor checkbox list. Keep concise; the longer description lives in
 * PERMISSION_MATRIX entries.
 */
export const CAPABILITY_LABELS: Record<Capability, string> = {
  "deals.view_all":          "Бачити всі угоди компанії",
  "deals.create":            "Створювати нові угоди",
  "deals.edit":              "Редагувати поля та статуси угод",
  "deals.delete_permanent":  "Видаляти угоди безповоротно",

  "customers.view_all":      "Бачити всіх клієнтів",
  "customers.edit":          "Редагувати дані клієнтів",
  "customers.message":       "Спілкуватись з клієнтами (unified inbox)",

  "finances.view_company":   "Бачити фінансові звіти за всю компанію",
  "finances.record_payments":"Реєструвати платежі",
  "finances.create_documents":"Створювати договори, рахунки, акти",

  "team.manage":             "Додавати/деактивувати членів команди",
  "team.change_credentials": "Змінювати email/пароль інших користувачів",

  "content.catalog":         "Редагувати каталог, ціни, послуги",
  "content.editorial":       "Редагувати блог, FAQ, проєкти",

  "integrations.manage":     "Підключати інтеграції каналів",
  "data.export":             "Експортувати базу даних",
}

/** Capability grouping for the role-editor UI. Order matters — rendered top-down. */
export const CAPABILITY_GROUPS: { group: string; capabilities: Capability[] }[] = [
  { group: "Угоди",        capabilities: ["deals.view_all", "deals.create", "deals.edit", "deals.delete_permanent"] },
  { group: "Клієнти",      capabilities: ["customers.view_all", "customers.edit", "customers.message"] },
  { group: "Фінанси",      capabilities: ["finances.view_company", "finances.record_payments", "finances.create_documents"] },
  { group: "Команда",      capabilities: ["team.manage", "team.change_credentials"] },
  { group: "Контент",      capabilities: ["content.catalog", "content.editorial"] },
  { group: "Налаштування", capabilities: ["integrations.manage", "data.export"] },
]

/**
 * Static base capability map. MUST match the SQL function
 * `base_role_capabilities()` in crm-custom-roles-migration.sql.
 *
 * super_admin gets everything by definition. The rest mirror what
 * the existing RLS policies + API gates already enforced before the
 * RBAC migration.
 */
export const BASE_ROLE_CAPABILITIES: Record<TeamRole, Capability[]> = {
  super_admin: [...CAPABILITIES],
  admin: [
    "deals.view_all", "deals.create", "deals.edit",
    "customers.view_all", "customers.edit", "customers.message",
    "finances.view_company", "finances.record_payments", "finances.create_documents",
    "team.manage", "content.catalog", "content.editorial",
  ],
  manager: [
    "deals.view_all", "deals.create", "deals.edit",
    "customers.view_all", "customers.edit", "customers.message",
    "finances.record_payments", "finances.create_documents",
    "content.editorial",
  ],
  master: [
    "deals.edit",
    // master sees ONLY own deals — that scope filter happens at the RLS
    // level (current_user_role()='master' restricts to assigned), not in
    // capabilities. The capability just permits the action when reached.
  ],
  sales: [
    "deals.create", "deals.edit",
    "customers.edit", "customers.message",
    "finances.record_payments",
  ],
}

/**
 * Resolves the effective capability set for a member given their base
 * role + custom-role extras. Pure function — mirrors Postgres
 * `current_user_capabilities()` logic.
 *
 *   resolveCapabilities("manager", ["finances.view_company"])
 *   // → manager defaults UNION ["finances.view_company"], deduplicated
 */
export function resolveCapabilities(
  baseRole: TeamRole | null | undefined,
  customRoleCaps?: readonly string[] | null
): Capability[] {
  if (!baseRole) return []
  const base = BASE_ROLE_CAPABILITIES[baseRole] ?? []
  if (!customRoleCaps || customRoleCaps.length === 0) return [...base]
  const extras = customRoleCaps.filter(isCapability)
  const set = new Set<Capability>([...base, ...extras])
  return Array.from(set)
}
