/**
 * Stone Memory CRM — TypeScript типи (відповідають supabase/crm-migration.sql).
 * Використовуються у всіх stores і API routes.
 */

/**
 * Team roles. `super_admin` is a single-owner role above `admin`:
 * it's the only role allowed to change auth credentials (password/email)
 * and toggle channel integrations. Enforced by Postgres trigger
 * `block_sensitive_auth_updates` and `is_super_admin()` RLS helper —
 * see supabase/crm-super-admin-{1,2}-*.sql.
 */
export type TeamRole = "super_admin" | "admin" | "manager" | "master" | "sales"

/** Returns true when the role can do everything `admin` does, or more. */
export function roleCanAdminister(role: TeamRole | null | undefined): boolean {
  return role === "admin" || role === "super_admin"
}

/** Returns true ONLY for super_admin. Use as the single gate for
 *  credential changes and channel-integration writes. */
export function roleIsSuperAdmin(role: TeamRole | null | undefined): boolean {
  return role === "super_admin"
}

export type TeamMember = {
  id: string
  user_id: string | null
  email: string
  display_name: string | null
  role: TeamRole
  phone: string | null
  active: boolean
  notes: string | null
  /** Optional FK to a custom_roles row. When set, UI shows the custom
   *  role's label and uses its capability list for fine-grain gates.
   *  The base `role` field stays in sync with custom_role.base_role
   *  (via Postgres trigger) so RLS policies don't need to change. */
  custom_role_id: string | null
  created_at: string
  updated_at: string
}

/**
 * A user-defined or system role. See supabase/crm-custom-roles-migration.sql.
 * `is_system` rows (super_admin/admin/manager/master/sales) cannot be
 * deleted and have a fixed `name` slug. Other rows are fully editable
 * by super_admin via /admin/team/permissions.
 */
export type CustomRole = {
  id: string
  name: string
  label: string
  description: string | null
  base_role: TeamRole
  capabilities: string[]
  is_system: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

// =====================================================
// DEAL STATUS — state machine з 18 станами
// =====================================================
export type DealStatus =
  | "new"
  | "contacted"
  | "measurement_scheduled"
  | "measurement_done"
  | "sketch"
  | "sketch_approved"
  | "contract_signed"
  | "deposit_paid"
  | "in_production"
  | "qc"
  | "ready"
  | "delivery"
  | "installed"
  | "paid"
  | "completed"
  | "on_hold"
  | "cancelled"
  | "lost"

export type DealPriority = "low" | "normal" | "high" | "urgent"

/**
 * State machine: легальні переходи. Будь-який стан може йти в:
 * • on_hold (призупинити)
 * • cancelled / lost (закрити негативно)
 * Окрім цього — лінійний flow з можливістю повернення на 1 крок назад.
 */
export const DEAL_TRANSITIONS: Record<DealStatus, DealStatus[]> = {
  new: ["contacted", "cancelled", "lost"],
  contacted: ["measurement_scheduled", "sketch", "cancelled", "lost", "on_hold"],
  measurement_scheduled: ["measurement_done", "contacted", "cancelled", "on_hold"],
  measurement_done: ["sketch", "measurement_scheduled", "cancelled", "on_hold"],
  sketch: ["sketch_approved", "measurement_done", "cancelled", "on_hold"],
  sketch_approved: ["contract_signed", "sketch", "cancelled", "on_hold"],
  contract_signed: ["deposit_paid", "sketch_approved", "cancelled"],
  deposit_paid: ["in_production", "contract_signed", "cancelled"],
  in_production: ["qc", "deposit_paid", "on_hold"],
  qc: ["ready", "in_production"],
  ready: ["delivery", "qc"],
  delivery: ["installed", "ready"],
  installed: ["paid", "delivery"],
  paid: ["completed", "installed"],
  completed: [],
  on_hold: ["new", "contacted", "sketch", "in_production"],
  cancelled: [],
  lost: [],
}

/**
 * Канбан-колонки: групуємо стани, бо 18 колонок забагато.
 * Менеджер бачить дошку з 6 колонок, а кожна має substages всередині.
 */
export type DealLane =
  | "lead"           // new + contacted
  | "discovery"      // measurement_scheduled + measurement_done + sketch + sketch_approved
  | "agreement"      // contract_signed + deposit_paid
  | "production"     // in_production + qc + ready
  | "fulfillment"    // delivery + installed + paid
  | "closed"         // completed + cancelled + lost
  | "paused"         // on_hold

export const DEAL_STATUS_TO_LANE: Record<DealStatus, DealLane> = {
  new: "lead",
  contacted: "lead",
  measurement_scheduled: "discovery",
  measurement_done: "discovery",
  sketch: "discovery",
  sketch_approved: "discovery",
  contract_signed: "agreement",
  deposit_paid: "agreement",
  in_production: "production",
  qc: "production",
  ready: "production",
  delivery: "fulfillment",
  installed: "fulfillment",
  paid: "fulfillment",
  completed: "closed",
  cancelled: "closed",
  lost: "closed",
  on_hold: "paused",
}

/** Локалізовані назви станів для UI (українська як primary). */
export const DEAL_STATUS_LABELS_UK: Record<DealStatus, string> = {
  new: "Нова",
  contacted: "Сконтактовано",
  measurement_scheduled: "Замір призначено",
  measurement_done: "Замір зроблено",
  sketch: "Ескіз",
  sketch_approved: "Ескіз затверджено",
  contract_signed: "Договір підписано",
  deposit_paid: "Аванс отримано",
  in_production: "У виробництві",
  qc: "Контроль якості",
  ready: "Готово",
  delivery: "Доставка",
  installed: "Встановлено",
  paid: "Повна оплата",
  completed: "Завершено",
  on_hold: "На паузі",
  cancelled: "Скасовано",
  lost: "Втрачено",
}

export const DEAL_LANE_LABELS_UK: Record<DealLane, string> = {
  lead: "Ліди",
  discovery: "Узгодження",
  agreement: "Договір",
  production: "Виробництво",
  fulfillment: "Доставка та оплата",
  closed: "Закриті",
  paused: "На паузі",
}

// =====================================================
// CUSTOMER
// =====================================================
export type Customer = {
  id: string
  phone: string
  phone_norm: string
  name: string
  email: string | null
  locale: string
  city: string | null
  country: string | null
  source: string | null
  tags: string[]
  notes: string | null
  ltv_eur: number
  deal_count: number
  last_contact_at: string | null
  do_not_contact: boolean
  assigned_to: string | null
  created_at: string
  updated_at: string
}

// =====================================================
// DEAL
// =====================================================
export type Deal = {
  id: string
  reference: string | null
  customer_id: string
  status: DealStatus
  prev_status: DealStatus | null
  priority: DealPriority
  category: string | null
  description: string | null
  amount_eur: number
  deposit_eur: number
  balance_eur: number
  paid_eur: number
  install_address: string | null
  install_city: string | null
  install_lat: number | null
  install_lng: number | null
  assigned_to: string | null
  master_id: string | null
  expected_delivery: string | null
  expected_install: string | null
  contract_signed_at: string | null
  installed_at: string | null
  completed_at: string | null
  closed_at: string | null
  source: string | null
  utm: Record<string, string> | null
  notes: string | null
  internal_notes: string | null
  /** Captured when the deal moves to status='cancelled' or 'lost'.
   *  Categorical (price | timing | competitor | …) — see LOST_REASON_OPTIONS
   *  for the UI taxonomy. Free text by design at the DB level. */
  lost_reason: string | null
  lost_reason_note: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  /** Optional SLA enrichment populated by GET /api/crm/deals — most recent
   *  inbound/outbound communication timestamps. Used to render
   *  "X without reply" badges in the kanban. Absent on bare deal records
   *  (e.g. POST/PATCH responses), so always treat as optional. */
  last_inbound_at?: string | null
  last_outbound_at?: string | null
}

export type DealItem = {
  id: string
  deal_id: string
  kind: "stone" | "service" | "custom"
  ref_id: string | null
  title: string
  qty: number
  unit_price_eur: number
  total_eur: number
  meta: Record<string, unknown> | null
  position: number
  created_at: string
}

export type DealEvent = {
  id: number
  deal_id: string
  kind: string
  from_status: DealStatus | null
  to_status: DealStatus | null
  message: string | null
  data: Record<string, unknown> | null
  actor_id: string | null
  created_at: string
}

// =====================================================
// REMINDERS
// =====================================================
export type ReminderStatus = "pending" | "sent" | "snoozed" | "cancelled"

export type ReminderKind =
  | "follow_up"
  | "measurement"
  | "sketch_review"
  | "contract_send"
  | "deposit_check"
  | "production_check"
  | "delivery"
  | "installation"
  | "final_payment"
  | "sla_warning"
  | "custom"

export const REMINDER_KIND_LABELS_UK: Record<ReminderKind, string> = {
  follow_up: "Перетелефонувати",
  measurement: "Замір",
  sketch_review: "Огляд ескізу",
  contract_send: "Надіслати договір",
  deposit_check: "Перевірити передоплату",
  production_check: "Стан виробництва",
  delivery: "Доставка",
  installation: "Монтаж",
  final_payment: "Остаточна оплата",
  sla_warning: "SLA-таймер",
  custom: "Інше",
}

export type Reminder = {
  id: string
  deal_id: string | null
  customer_id: string | null
  assigned_to: string | null
  kind: ReminderKind
  title: string
  description: string | null
  due_at: string
  status: ReminderStatus
  notify_via: string[]
  notified_at: string | null
  snoozed_to: string | null
  completed_at: string | null
  recurrence: string | null
  created_by: string | null
  created_at: string
}

// =====================================================
// COMMUNICATIONS
// =====================================================
export type CommChannel =
  | "site_chat"
  | "telegram"
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "email"
  | "sms"
  | "phone"
  | "manual"

export type CommDirection = "inbound" | "outbound"

export const COMM_CHANNEL_LABELS: Record<CommChannel, string> = {
  site_chat: "Сайт",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
  email: "Email",
  sms: "SMS",
  phone: "Дзвінок",
  manual: "Запис вручну",
}

export type Communication = {
  id: number
  customer_id: string | null
  deal_id: string | null
  channel: CommChannel
  direction: CommDirection
  external_id: string | null
  thread_key: string | null
  subject: string | null
  body: string | null
  attachments: Array<{ name: string; url: string; mime: string; size: number }> | null
  read_at: string | null
  replied_at: string | null
  actor_id: string | null
  meta: Record<string, unknown> | null
  created_at: string
}

// =====================================================
// DOCUMENTS
// =====================================================
export type DocumentKind = "quote" | "contract" | "invoice" | "receipt" | "act" | "sketch" | "other"

export const DOCUMENT_KIND_LABELS_UK: Record<DocumentKind, string> = {
  quote: "Комерційна пропозиція",
  contract: "Договір",
  invoice: "Рахунок",
  receipt: "Квитанція",
  act: "Акт виконаних робіт",
  sketch: "Ескіз",
  other: "Інше",
}

export type Document = {
  id: string
  deal_id: string | null
  customer_id: string | null
  kind: DocumentKind
  number: string | null
  title: string | null
  storage_path: string
  public_url: string | null
  size_bytes: number | null
  version: number
  signed_at: string | null
  signed_by: string | null
  meta: Record<string, unknown> | null
  created_by: string | null
  created_at: string
}

// =====================================================
// PRODUCTION
// =====================================================
export type ProdStageKind =
  | "raw_material"
  | "cutting"
  | "grinding"
  | "polishing"
  | "engraving"
  | "sealing"
  | "qc"
  | "packaging"
  | "transport"
  | "foundation"
  | "installation"
  | "cleanup"

export type ProdStageStatus = "pending" | "in_progress" | "done" | "failed"

export const PROD_STAGE_LABELS_UK: Record<ProdStageKind, string> = {
  raw_material: "Матеріал з кар'єру",
  cutting: "Розпил",
  grinding: "Шліфування",
  polishing: "Полірування",
  engraving: "Гравіювання",
  sealing: "Герметизація",
  qc: "Контроль якості",
  packaging: "Пакування",
  transport: "Транспорт",
  foundation: "Фундамент",
  installation: "Монтаж",
  cleanup: "Прибирання",
}

export type ProductionStage = {
  id: string
  deal_id: string
  kind: ProdStageKind
  status: ProdStageStatus
  master_id: string | null
  started_at: string | null
  completed_at: string | null
  due_at: string | null
  photos: string[]
  notes: string | null
  position: number
  created_at: string
}

// =====================================================
// PAYMENTS
// =====================================================
export type PaymentKind = "deposit" | "partial" | "balance" | "refund" | "extra"
export type PaymentMethod = "cash" | "card" | "bank_transfer" | "iban" | "crypto" | "other"

export const PAYMENT_KIND_LABELS_UK: Record<PaymentKind, string> = {
  deposit: "Аванс",
  partial: "Частковий",
  balance: "Залишок",
  refund: "Повернення",
  extra: "Додатково",
}

export const PAYMENT_METHOD_LABELS_UK: Record<PaymentMethod, string> = {
  cash: "Готівка",
  card: "Картка",
  bank_transfer: "Банк. переказ",
  iban: "IBAN",
  crypto: "Крипто",
  other: "Інше",
}

export type Payment = {
  id: string
  deal_id: string
  customer_id: string
  kind: PaymentKind
  method: PaymentMethod
  amount_eur: number
  currency: string
  amount_native: number | null
  fx_rate: number | null
  reference: string | null
  paid_at: string
  recorded_by: string | null
  notes: string | null
  created_at: string
}

// =====================================================
// AUDIT LOG
// =====================================================
export type AuditEntry = {
  id: number
  actor_id: string | null
  actor_email: string | null
  entity_type: string
  entity_id: string
  action: string
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  ip: string | null
  user_agent: string | null
  created_at: string
}

// =====================================================
// AGGREGATE / VIEWS
// =====================================================

/** Customer 360° — все що знаємо про клієнта в одному об'єкті. */
export type CustomerOverview = {
  customer: Customer
  deals: Deal[]
  reminders: Reminder[]
  communications: Communication[]
  documents: Document[]
  payments: Payment[]
  totalLifetimeValue: number
  openDealsCount: number
}

/** Повний вид угоди з усіма зв'язками. */
export type DealOverview = {
  deal: Deal
  customer: Customer | null
  items: DealItem[]
  events: DealEvent[]
  reminders: Reminder[]
  communications: Communication[]
  documents: Document[]
  productionStages: ProductionStage[]
  payments: Payment[]
  assignee: TeamMember | null
  master: TeamMember | null
}

/** Перевірка legal transition між статусами. */
export function canTransition(from: DealStatus, to: DealStatus): boolean {
  return DEAL_TRANSITIONS[from]?.includes(to) ?? false
}

/** Які стани зараз доступні для переходу з поточного. */
export function availableTransitions(from: DealStatus): DealStatus[] {
  return DEAL_TRANSITIONS[from] ?? []
}

// =====================================================
// LOST / CANCELLED reasons — for post-mortem analytics.
// Stored as plain text in deals.lost_reason; the canonical UI taxonomy
// lives here. Adding/removing options does not require a migration —
// the DB column accepts any string, and analytics queries group on
// whatever values are present.
// =====================================================
export type LostReason =
  | "price"
  | "timing"
  | "competitor"
  | "ghosted"
  | "scope_mismatch"
  | "geography"
  | "duplicate_lead"
  | "not_interested"
  | "other"

export const LOST_REASON_OPTIONS: { value: LostReason; label: string; appliesTo: ("cancelled" | "lost")[] }[] = [
  { value: "price",            label: "Не підійшла ціна",                 appliesTo: ["cancelled", "lost"] },
  { value: "timing",           label: "Не вистачило часу / строки",        appliesTo: ["cancelled", "lost"] },
  { value: "competitor",       label: "Пішли до конкурента",               appliesTo: ["lost"] },
  { value: "ghosted",          label: "Перестали відповідати",             appliesTo: ["lost"] },
  { value: "scope_mismatch",   label: "Не наша спеціалізація",             appliesTo: ["cancelled", "lost"] },
  { value: "geography",        label: "Географія / логістика",             appliesTo: ["cancelled", "lost"] },
  { value: "duplicate_lead",   label: "Дублікат заявки",                   appliesTo: ["cancelled"] },
  { value: "not_interested",   label: "Передумали",                        appliesTo: ["cancelled", "lost"] },
  { value: "other",            label: "Інше (опишіть нижче)",              appliesTo: ["cancelled", "lost"] },
]

export function lostReasonLabel(value: string | null | undefined): string | null {
  if (!value) return null
  const found = LOST_REASON_OPTIONS.find((o) => o.value === value)
  return found?.label ?? value
}

// =====================================================
// SLA — "Х hours/days without reply" indicator for active deals.
// Computed purely from the last_inbound_at / last_outbound_at fields the
// deals listing API enriches each row with. Pure function, no I/O.
// =====================================================

/** Buckets used by the kanban badge to color responsiveness:
 *  ok → ball is in customer's court (no badge)
 *  fresh → owe a reply, < 4 hours
 *  warning → owe a reply, 4–24 hours
 *  overdue → owe a reply, ≥ 24 hours */
export type SLAStatus = "ok" | "fresh" | "warning" | "overdue"

export type SLAInfo = {
  status: SLAStatus
  /** Hours since the unanswered inbound message (0 when status='ok'). */
  hoursSinceInbound: number
}

/** Snapshot a deal's SLA based on the timestamps the API enriches.
 *  Returns null for deals that have no inbound history — we have nothing
 *  to compute against. */
export function computeDealSLA(
  deal: Pick<Deal, "last_inbound_at" | "last_outbound_at" | "status">
): SLAInfo | null {
  // Closed deals don't accrue SLA debt.
  if (
    deal.status === "completed" ||
    deal.status === "cancelled" ||
    deal.status === "lost"
  ) {
    return null
  }

  if (!deal.last_inbound_at) return null

  const inboundMs = new Date(deal.last_inbound_at).getTime()
  const outboundMs = deal.last_outbound_at
    ? new Date(deal.last_outbound_at).getTime()
    : 0

  // Customer wrote, we replied after — ball is in their court, no debt.
  if (outboundMs > inboundMs) {
    return { status: "ok", hoursSinceInbound: 0 }
  }

  const hours = Math.max(0, (Date.now() - inboundMs) / (1000 * 60 * 60))

  if (hours < 4) return { status: "fresh", hoursSinceInbound: hours }
  if (hours < 24) return { status: "warning", hoursSinceInbound: hours }
  return { status: "overdue", hoursSinceInbound: hours }
}

/** Short human-readable label like "2 год без відповіді" or "3 дні без відповіді". */
export function formatSLABadge(info: SLAInfo): string {
  const h = info.hoursSinceInbound
  if (h < 1) return "<1 год без відповіді"
  if (h < 24) {
    const rounded = Math.floor(h)
    return `${rounded} год без відповіді`
  }
  const days = Math.floor(h / 24)
  return `${days} дн без відповіді`
}
