-- ============================================================
-- STONE MEMORY CRM — win/loss reasons migration
-- Run AFTER crm-migration.sql + crm-channels-migration.sql.
-- Idempotent.
--
-- What this adds:
--   • deals.lost_reason — short categorical reason (price | timing | competitor | …)
--   • deals.lost_reason_note — optional free-text elaboration
--
-- Used when a deal moves to status='lost' or status='cancelled'.
-- Captured at close-time so post-mortem analytics has real data
-- ("how many lost to price last quarter?") instead of guesswork.
-- ============================================================

alter table public.deals
  add column if not exists lost_reason text,
  add column if not exists lost_reason_note text;

-- We deliberately don't add a CHECK constraint on lost_reason values
-- (e.g. ('price','timing','competitor',...)). Reason taxonomy will
-- evolve over time and a CHECK forces a migration each time. Validation
-- lives in the API layer (app/api/crm/deals/[id]/route.ts) instead.

-- Index for analytics queries like "count deals lost to price last 30d".
create index if not exists deals_lost_reason_idx
  on public.deals (lost_reason)
  where lost_reason is not null;

comment on column public.deals.lost_reason is
  'Short categorical reason a deal was cancelled/lost. Free text by design — taxonomy lives in app/admin/deals UI. Null for active or completed deals.';
comment on column public.deals.lost_reason_note is
  'Optional free-text elaboration on lost_reason (e.g. specific competitor name, price gap).';
