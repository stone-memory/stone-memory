-- ============================================================
-- STONE MEMORY CRM — super_admin role migration · STEP 1 of 2
-- Run AFTER crm-migration.sql, BEFORE crm-super-admin-2-policies.sql.
--
-- Why split: Postgres forbids using a newly-added enum value in the
-- same transaction it was added. Supabase SQL editor wraps each script
-- run in one transaction, so we have to land the ADD VALUE first,
-- then run the rest in a second script.
--
-- Idempotent: safe to re-run.
-- ============================================================

alter type team_role add value if not exists 'super_admin' before 'admin';
