import { Crown, Shield, UserCog, HardHat, BadgeCheck } from "lucide-react"
import type { ComponentType } from "react"
import type { TeamRole } from "@/lib/crm/types"

/**
 * Canonical role descriptions. Single source of truth for the UI:
 * the new-member modal, /admin/team/permissions comparison table,
 * /admin/account banner, and any future role-aware copy all read from
 * here so the wording stays consistent.
 *
 * NOTE: this file describes UI copy, not the actual authorization logic.
 * Real enforcement lives in:
 *   • Postgres RLS policies (supabase/crm-migration.sql + super-admin-2)
 *   • API guards (lib/auth/permissions.ts requireSuperAdmin / requireAdminOrSuperAdmin)
 * Editing copy here does NOT change what a role can actually do — those
 * changes need migrations.
 */

export type RolePermissions = {
  label: string
  icon: ComponentType<{ size?: number; className?: string }>
  iconClass: string
  description: string
  /** Capabilities this role HAS. Plain UA strings, end-user-friendly. */
  can: string[]
  /** Capabilities this role does NOT have. Mirrors `can` of higher roles. */
  cannot: string[]
  /** Optional warning shown on the role card (e.g. "owner-only role"). */
  warning?: string
}

export const ROLE_PERMISSIONS: Record<TeamRole, RolePermissions> = {
  super_admin: {
    label: "Головний адмін",
    icon: Crown,
    iconClass: "text-amber-600 dark:text-amber-400",
    description: "Власник бізнесу. Повний контроль над CRM",
    can: [
      "Все, що може Адмін",
      "Змінювати email та пароль будь-якого користувача",
      "Підключати інтеграції каналів (Telegram, WhatsApp, Instagram, Email, SMS)",
      "Видаляти акаунт компанії та експортувати всю базу",
    ],
    cannot: [],
    warning: "Ця роль надається лише власнику бізнесу. Призначається через SQL, не через UI.",
  },
  admin: {
    label: "Адмін",
    icon: Shield,
    iconClass: "text-foreground",
    description: "Повний доступ до CRM, ролей, фінансів",
    can: [
      "Бачити та редагувати всі угоди, всіх клієнтів",
      "Призначати майстрів і менеджерів на угоди",
      "Бачити фінансову аналітику та звіти",
      "Додавати/деактивовувати членів команди (крім super_admin)",
      "Налаштовувати каталог, ціни, матеріали",
    ],
    cannot: [
      "Змінювати email та пароль інших користувачів",
      "Підключати/відключати інтеграції каналів",
      "Призначати роль super_admin",
    ],
  },
  manager: {
    label: "Менеджер",
    icon: UserCog,
    iconClass: "text-blue-600 dark:text-blue-400",
    description: "Управління угодами, клієнтами, платежами",
    can: [
      "Бачити та редагувати всі угоди компанії",
      "Спілкуватись з клієнтами через unified inbox",
      "Створювати договори, виставляти рахунки",
      "Призначати майстрів на виконання",
      "Бачити календар виробництва",
    ],
    cannot: [
      "Бачити повні фінансові звіти за всю компанію",
      "Додавати/видаляти членів команди",
      "Змінювати ціни в каталозі",
      "Видаляти угоди безповоротно",
    ],
  },
  master: {
    label: "Майстер",
    icon: HardHat,
    iconClass: "text-orange-600 dark:text-orange-400",
    description: "Виробничі задачі — лише свої угоди",
    can: [
      "Бачити лише угоди, на які його призначено",
      "Завантажувати фото-звіти з виробництва",
      "Оновлювати статус виробничого етапу",
      "Бачити свій робочий календар",
    ],
    cannot: [
      "Бачити інших клієнтів та інші угоди",
      "Бачити ціни і фінансову інформацію",
      "Спілкуватись з клієнтом напряму через чат",
      "Додавати нових клієнтів",
    ],
  },
  sales: {
    label: "Продажі",
    icon: BadgeCheck,
    iconClass: "text-purple-600 dark:text-purple-400",
    description: "Продажі — лише свої ліди",
    can: [
      "Створювати нові ліди та угоди",
      "Бачити лише своїх клієнтів",
      "Спілкуватись зі своїми клієнтами в чаті",
      "Бачити свою комісію (якщо налаштовано)",
    ],
    cannot: [
      "Бачити чужих клієнтів та чужі угоди",
      "Бачити загальну статистику компанії",
      "Призначати майстрів",
      "Затверджувати договори",
    ],
  },
}

/** Roles that the UI may assign through the new-member modal.
 *  super_admin is intentionally excluded — see /admin/team/page.tsx. */
export const ASSIGNABLE_ROLES: TeamRole[] = ["admin", "manager", "master", "sales"]

/** All roles in display order, for the comparison table. */
export const ALL_ROLES_ORDERED: TeamRole[] = [
  "super_admin",
  "admin",
  "manager",
  "master",
  "sales",
]

// =====================================================
// PERMISSION MATRIX — flat list of high-level capabilities and how each
// role handles them. Used by /admin/team/permissions for the side-by-side
// comparison table. Hardcoded (not auto-derived from can/cannot strings)
// because the per-role labels would be hard to match across slight
// wording differences.
//
// "yes" → ✅, "no" → ❌, "partial" → ⚠️ (with a tooltip explaining what's
// limited — e.g. master sees their own deals only).
// =====================================================

export type PermissionCell = "yes" | "no" | "partial"

export type PermissionRow = {
  group: string
  label: string
  description?: string
  /** Optional partial-explanation per role, shown in cell tooltip. */
  partialNote?: Partial<Record<TeamRole, string>>
  byRole: Record<TeamRole, PermissionCell>
}

export const PERMISSION_MATRIX: PermissionRow[] = [
  // Угоди
  {
    group: "Угоди",
    label: "Бачити всі угоди компанії",
    byRole: {
      super_admin: "yes", admin: "yes", manager: "yes", master: "partial", sales: "partial",
    },
    partialNote: { master: "лише призначені на нього", sales: "лише свої ліди" },
  },
  {
    group: "Угоди",
    label: "Створювати нові угоди",
    byRole: { super_admin: "yes", admin: "yes", manager: "yes", master: "no", sales: "yes" },
  },
  {
    group: "Угоди",
    label: "Змінювати статус, поля, призначення",
    byRole: { super_admin: "yes", admin: "yes", manager: "yes", master: "partial", sales: "partial" },
    partialNote: { master: "лише виробничі етапи", sales: "лише статус своїх лідів" },
  },
  {
    group: "Угоди",
    label: "Видаляти угоди безповоротно",
    byRole: { super_admin: "yes", admin: "no", manager: "no", master: "no", sales: "no" },
  },

  // Клієнти
  {
    group: "Клієнти",
    label: "Бачити всіх клієнтів",
    byRole: { super_admin: "yes", admin: "yes", manager: "yes", master: "no", sales: "partial" },
    partialNote: { sales: "лише своїх клієнтів" },
  },
  {
    group: "Клієнти",
    label: "Редагувати дані клієнтів",
    byRole: { super_admin: "yes", admin: "yes", manager: "yes", master: "no", sales: "partial" },
    partialNote: { sales: "лише своїх клієнтів" },
  },
  {
    group: "Клієнти",
    label: "Спілкування з клієнтом (unified inbox)",
    byRole: { super_admin: "yes", admin: "yes", manager: "yes", master: "no", sales: "partial" },
    partialNote: { sales: "лише зі своїми клієнтами" },
  },

  // Фінанси
  {
    group: "Фінанси",
    label: "Бачити фінансові звіти за всю компанію",
    byRole: { super_admin: "yes", admin: "yes", manager: "no", master: "no", sales: "no" },
  },
  {
    group: "Фінанси",
    label: "Реєструвати платежі по своїх угодах",
    byRole: { super_admin: "yes", admin: "yes", manager: "yes", master: "no", sales: "partial" },
    partialNote: { sales: "лише на своїх лідах" },
  },
  {
    group: "Фінанси",
    label: "Створювати договори, рахунки, акти",
    byRole: { super_admin: "yes", admin: "yes", manager: "yes", master: "no", sales: "no" },
  },

  // Команда
  {
    group: "Команда",
    label: "Додавати/деактивувати членів команди",
    byRole: { super_admin: "yes", admin: "yes", manager: "no", master: "no", sales: "no" },
  },
  {
    group: "Команда",
    label: "Призначати роль super_admin",
    byRole: { super_admin: "no", admin: "no", manager: "no", master: "no", sales: "no" },
    description: "Роль super_admin призначається лише через SQL-міграцію",
  },
  {
    group: "Команда",
    label: "Змінювати email/пароль інших користувачів",
    byRole: { super_admin: "yes", admin: "no", manager: "no", master: "no", sales: "no" },
  },

  // Контент сайту
  {
    group: "Контент",
    label: "Редагувати каталог, ціни, послуги",
    byRole: { super_admin: "yes", admin: "yes", manager: "no", master: "no", sales: "no" },
  },
  {
    group: "Контент",
    label: "Редагувати блог, FAQ, проєкти",
    byRole: { super_admin: "yes", admin: "yes", manager: "yes", master: "no", sales: "no" },
  },

  // Налаштування
  {
    group: "Налаштування",
    label: "Підключати інтеграції каналів (Telegram, WhatsApp, …)",
    byRole: { super_admin: "yes", admin: "no", manager: "no", master: "no", sales: "no" },
  },
  {
    group: "Налаштування",
    label: "Експортувати всю базу даних",
    byRole: { super_admin: "yes", admin: "no", manager: "no", master: "no", sales: "no" },
  },
]
