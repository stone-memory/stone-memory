-- ============================================================
-- STONE MEMORY CRM — Viber channel migration
-- Run AFTER all previous CRM migrations.
-- TWO transactions required (Postgres limitation on enum value use).
--
-- STEP 1 (run alone):
-- ============================================================

alter type comm_channel add value if not exists 'viber';

-- COMMIT step 1, then run STEP 2 below in a new SQL editor execution.

-- ============================================================
-- STEP 2 — seed integrations row + RLS sanity
-- Run after STEP 1 is committed.
-- ============================================================

insert into public.integrations (id, enabled) values ('viber', false)
on conflict (id) do nothing;

-- Done. After this, /admin/integrations should show a Viber card and
-- super_admin can save credentials via the IntegrationConfigModal.
