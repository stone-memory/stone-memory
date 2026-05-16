# Stone Memory CRM — handoff brief

Self-contained context for picking up this work in a fresh Claude
session. Read top-to-bottom — everything below is current as of the
last commit on `fix/admin-dashboard-improvements`.

---

## Project at a glance

- **What:** Internal admin CRM for Stone Memory, a memorial / natural-
  stone atelier from Rivne Oblast, Ukraine. Manages long-cycle deals
  (lead → consultation → measurement → sketch → contract → production
  → installation → handover).
- **Stack:** Next.js 16 (App Router) + TypeScript strict + Supabase
  (Postgres + Auth + RLS) + Tailwind v4 + shadcn-style primitives in
  `components/ui/*`. UA-first UI with PL/EN/DE/LT locales.
- **Owner:** Gruttyx (a.k.a. Grut), email
  `sttonememory@gmail.com`. Treated as `super_admin` everywhere, both
  via DB role and via env-fallback (see `lib/auth/permissions.ts`
  → `OWNER_EMAILS`).
- **Public site:** `https://stonememory.com.ua` (or localhost:3000 in
  dev). Admin lives under `/admin/*`.

---

## Branch state

```
fix/admin-dashboard-improvements  (current)
├── seo-foundation-implementation (parent — also has unmerged work)
└── main                          (clean baseline, NOT updated yet)
```

**Nothing is pushed to origin yet.** Local rewriting via filter-branch
was used to scrub auto-added Co-Authored-By trailers — that means SHAs
have changed since any earlier session. If you push, use
`--force-with-lease`.

## Commit history on `fix/admin-dashboard-improvements`

(newest first; everything since branching from
`seo-foundation-implementation`)

```
a881d77  test(perf): bash-based load test against critical CRM endpoints
3843829  feat(inbox): pick reply channel + per-channel unread badges + viber chip
93a30ee  feat(integrations): test-connection + auto-webhook setup buttons
664efca  feat(viber): end-to-end Viber channel — types, send, webhook, modal
a61d50f  feat(integrations): token entry UI in CRM — DB-backed config overrides env
9c2b98f  feat(backfill): pre-flight migration check with friendly instructions
4ed1801  feat(chat-settings): auto-translate triggers across 5 locales on add
bcac461  feat(team,api): password + phone mask in new-member form
cd37dbf  fix(featured): purge stale stone ids + count by valid stones not raw list
010b20a  fix(auth,team): role-picker fallback + owner-email super_admin bootstrap
33b5b28  feat(rbac): custom role editor UI + integration into team page (3/3)
6b5c593  feat(rbac): capability taxonomy + custom-roles API + lib helpers (2/3)
17fda77  feat(rbac): custom_roles table + capability resolver (1/3)
31e0b8b  test(auth): curl-based boundary tests for Fix 4/5/6
4a96153  feat(analytics,inbox): clickable chat session cards (Fix 3)
87615ec  feat(analytics): sample-size hints on hourly/weekday charts (Fix 2)
91a973f  refactor(account,team): drop "ask owner" panel, super_admin can reset others' passwords
1d9a23e  feat(analytics): proper revenue-by-days chart with three states (Fix 1)
3619fbf  feat(integrations): lock channel integrations to super_admin (Fix 6)
e116f1c  feat(team): role permissions detail UI + comparison table (Fix 5)
b524c77  feat(auth): super_admin role + lock account credentials (Fix 4)
```

And on parent branch `seo-foundation-implementation` (already done):

```
592b9c8  feat(crm): SLA "X without reply" badge on kanban deal cards
f3f7862  feat(crm): capture win/loss reasons when closing a deal
a409fc5  feat(crm): unified activity timeline on customer detail page
e932f95  fix(admin): real KPI trends on orders dashboard, no more fake +12%
a0c2f43  feat(admin): editable homepage hero categories + retire legacy roles
deb8388  feat(admin): surface backfill-chat errors in UI and dev console
eeec5bd  fix(admin): wire up blog CRUD to mirror other admin sections
6c606a6  feat(i18n): add locale-detection middleware (Phase 2)
53eb16a  feat(i18n): switch pathnames to Option A (localized URL slugs)
aa22f22  feat(i18n): add config and localized pathnames tables (no behavior change)
```

---

## SQL migrations that need to run in Supabase before deploy

Order matters. Two-transaction ones must be run in separate executions
(Postgres won't let a newly-added enum value be used in the same
transaction it was added).

```
1. supabase/crm-super-admin-1-enum.sql       (alone, commits, then…)
2. supabase/crm-super-admin-2-policies.sql

3. supabase/crm-channels-migration.sql       (only if not run yet)
   ^ adds communications.thread_key + customers.channels + integrations table.
   The backfill-chat pre-flight check tells the user if this is missing.

4. supabase/crm-loss-reasons-migration.sql

5. supabase/crm-custom-roles-migration.sql   (single file, idempotent)

6. supabase/crm-viber-migration.sql          (2 steps inside one file —
   read header comments carefully)
```

All migrations are **idempotent** — safe to re-run.

---

## Paused / pending work

### i18n URL migration (Phase 3+ paused)

Phases 1-2 already on `seo-foundation-implementation`:
- Phase 1 (`aa22f22`, `53eb16a`): config + pathnames tables (Option A
  localized slugs).
- Phase 2 (`6c606a6`): middleware at `/middleware.ts` redirects bare
  URLs to `/<locale>/...` and rewrites localized slugs to canonical.

**Phase 3 is the folder restructure** — every public route under
`app/about/`, `app/blog/`, etc. needs to move under `app/[locale]/`.
**Until Phase 3 lands, the public site is broken (all redirects →
404).** Admin pages bypass middleware so they keep working.

Phases 4-8 remaining: context update (URL-driven instead of ipapi
geo), internal-link rewrites, metadata builders, sitemap, 301
redirects for legacy `?lang=xx`.

User explicitly paused i18n at end of Phase 2 to work on CRM. Resume
trigger: user says something like "продовжуй i18n" or "Phase 3".

### Variant C custom roles (RBAC) — not enforced at RLS layer

The 3-commit RBAC implementation gives admin a UI to define custom
roles with capability overlays. Capabilities are checked at the API
layer (`requireCapability()` in `lib/auth/permissions.ts`) and UI
gating layer (`useCurrentRole().capabilities`). **RLS still uses the
base role enum.** Custom roles anchor to a base via `base_role`
column, and a trigger keeps `team_members.role` synced.

If RLS-level capability checks are wanted later, switch all policies
from `current_user_role() in (...)` to
`has_capability('cap.name')` — that helper is already defined.

---

## Key files / locations

### Auth + permissions
- `lib/auth/permissions.ts` — server-side `getAuthedUser`,
  `requireSuperAdmin`, `requireAdminOrSuperAdmin`, `requireCapability`,
  `getCurrentCapabilities`. Owner-email override for
  `sttonememory@gmail.com` lives here (`OWNER_EMAILS`).
- `lib/auth/use-current-role.ts` — client hook; returns role + email +
  capabilities. Used by sidebar (lock icon on integrations) and
  account / integrations pages.
- `lib/permissions/role-definitions.ts` — `ROLE_PERMISSIONS` UI copy +
  `PERMISSION_MATRIX` for the comparison table.
- `lib/permissions/capabilities.ts` — `Capability` union,
  `CAPABILITY_LABELS`, `CAPABILITY_GROUPS`, `BASE_ROLE_CAPABILITIES`,
  `resolveCapabilities()`.

### Integrations
- `lib/integrations/config.ts` — `getIntegrationConfig(id)` merges DB
  config (Supabase `integrations` table) with env vars (DB wins).
  Used by `lib/telegram.ts`, `lib/crm/send.ts` outbound senders, and
  the status API.
- `app/api/crm/integrations/[id]/route.ts` — GET/PUT config
  (super_admin only).
- `app/api/crm/integrations/[id]/test/route.ts` — Pings each channel's
  identity API to verify saved tokens work.
- `app/api/crm/integrations/[id]/setup-webhook/route.ts` —
  Auto-registers webhook URL via Telegram `setWebhook` or Viber
  `set_webhook`. Returns manual-instructions for WhatsApp / Instagram
  / Twilio / Email.
- `components/admin/integration-config-modal.tsx` — per-channel
  config UI with «Перевірити» + «Підключити webhook» buttons.
- `app/admin/integrations/page.tsx` — page lists cards, opens modal.

### Channels — outbound + inbound
- `lib/crm/send.ts` — `sendToChannel({ customerId, channel, body })`
  router. Handles email, telegram, whatsapp, instagram, viber, sms,
  site_chat, phone/manual.
- `lib/telegram.ts` — `sendTelegram()` for outbound + admin notifs.
- `lib/email.tsx` — `sendOne()` via Resend.
- `app/api/telegram/route.ts` — Telegram inbound
- `app/api/whatsapp/webhook/route.ts`
- `app/api/instagram/webhook/route.ts`
- `app/api/viber/webhook/route.ts` (new)
- `app/api/email/inbound/route.ts`
- `app/api/sms/inbound/route.ts`

### Inbox & CRM
- `app/admin/inbox/page.tsx` — unified inbox; reads
  `communications` table grouped by `thread_key`. Reply picker chooses
  channel (default = inbound). Per-channel unread badges in filter
  strip.
- `app/admin/deals/page.tsx` — kanban with SLA badges.
- `app/admin/deals/[id]/page.tsx` — deal detail; lost-reason modal on
  cancel/lost.
- `app/admin/customers/[id]/page.tsx` — customer 360° with
  `<ActivityTimeline>` at top.
- `components/admin/activity-timeline.tsx` — reusable timeline component.
- `lib/crm/comms.ts` — `findOrCreateCustomer`,
  `updateCustomerChannelIds`, `getCustomerChannels`,
  `findActiveDealForCustomer`.

### Chat-bot / FAQ
- `lib/chat-bot.ts` — fuzzy matcher (`matchQuickReply`,
  `normalizeForMatch`, Levenshtein). `botCopy` carries default
  quick-replies per locale.
- `lib/store/chat-settings.ts` — admin override store. `tryMatchFaq`
  reads live admin-edited replies.
- `app/admin/chat-settings/page.tsx` — UI with triggers chip-editor;
  auto-translates new triggers across 5 locales via `/api/translate`.

### Team & roles
- `app/admin/team/page.tsx` — main team page. Member table + new
  modal. New: password field, phone mask, custom-role picker with
  enum fallback, super_admin can reset others' passwords.
- `app/admin/team/permissions/page.tsx` — `/admin/team/permissions`
  reference page with three views: cards, matrix table, custom roles
  (with create/edit/delete via `CustomRoleEditor` modal).
- `components/admin/role-permission-card.tsx` — hover/popover card.
- `components/admin/custom-role-editor.tsx` — capability checkbox
  editor.
- `lib/store/custom-roles.ts` — store for custom_roles CRUD.

### Other admin pages worth knowing
- `app/admin/page.tsx` — orders dashboard; real period-over-period
  KPI trends (no more fake +12%).
- `app/admin/analytics/page.tsx` — full analytics; `RevenueByDays` is
  a separate component with Recharts.
- `components/admin/revenue-by-days.tsx`
- `app/admin/featured/page.tsx` — popular-items picker; auto-purges
  stale stone ids.
- `app/admin/homepage/page.tsx` — edits the "Що саме ми робимо" hero
  section (categories cards).
- `app/admin/account/page.tsx` — split view (super_admin vs others).

### Test scripts
- `scripts/test-auth.sh` — security boundary tests (auth gates,
  super_admin enforcement, integrations lock, role-PATCH whitelist).
- `scripts/load-test.sh` — concurrent latency / error-rate test
  against 8 critical endpoints with p50/p95/p99 SLO assertions.

Run them with the env vars they document at the top.

---

## Conventions to keep

1. **NO `Co-Authored-By: Claude` trailer in commits.** The user
   explicitly removed all historical ones with filter-branch — don't
   re-add. Just end commit body with the last paragraph.
2. **Never push to remote without `--force-with-lease`** until the
   branch is merged (history was rewritten).
3. **UI copy is Ukrainian** by default. English only for code
   identifiers and standard tech terms (email, password, super_admin).
4. **Use existing shadcn primitives** in `components/ui/*` — don't
   invent new patterns. Available: button, input, dialog, popover,
   hover-card, tabs, skeleton, badge, card, drawer, dropdown-menu,
   command, etc.
5. **Type-check after every change:** `npx tsc --noEmit`. No `any`.
6. **Defense in depth for auth:** UI disabled, API guard, RLS policy,
   and (for credentials) a Postgres trigger — all four must agree.
7. **Idempotent SQL migrations** — every new one starts with
   `if not exists` / `do $$ ... exception when ... end $$`.
8. **Empty states with CTA** — never leave a grey block. Skeleton
   while loading, info-state with action when no data.

---

## How to resume

1. **Check branch:** `git checkout fix/admin-dashboard-improvements`
2. **Dev server:** `npm run dev`. Listens on :3000.
3. **Migrations status** — ask user to confirm which SQL files have
   been run in Supabase. Default assumption: none of the new ones,
   so until they confirm, treat the user's Supabase as having only
   `crm-migration.sql` + `crm-channels-migration.sql`.
4. **Most-recent user complaints** to look out for:
   - Backfill chat → if user reports "0 перенесено, 22 помилок",
     they haven't run `crm-channels-migration.sql`.
   - "Roles not loading" in new-member modal → custom-roles migration
     not run, fallback enum picker will kick in.
   - Viber card missing → viber migration not run.
5. **i18n migration** is paused at Phase 2; only resume on explicit
   user request.

---

_End of handoff._
