-- ============================================================
-- STONE MEMORY CRM — super_admin role migration · STEP 2 of 2
-- Run AFTER crm-super-admin-1-enum.sql has been committed.
--
-- What this adds:
--   • Helper function is_super_admin() for RLS policies / triggers.
--   • Trigger on auth.users that blocks password / email updates from
--     non-super-admins (hard-stop at the DB level — even if a user
--     bypasses our API and calls supabase.auth.updateUser from
--     devtools, the trigger raises 42501).
--   • Initial assignment: sttonememory@gmail.com → super_admin.
--   • Updated RLS policies so super_admin gets at least everything
--     admin gets, and integrations are super_admin-only (Fix 6).
--
-- Idempotent: re-running is safe (drop + recreate where needed).
-- ============================================================

-- Helper for use in policies and the auth.users trigger.
create or replace function public.is_super_admin() returns boolean as $$
  select exists (
    select 1 from public.team_members
    where user_id = auth.uid()
      and role = 'super_admin'
      and active = true
  );
$$ language sql stable security definer;

comment on function public.is_super_admin() is
  'True iff the calling user has team_members.role = super_admin and active = true. Service-role calls (auth.uid() is null) return false here — use that for trigger bypass via separate auth.uid() is null check.';

-- ----------------------------------------------------------------
-- Block password / email changes from non-super-admins
-- ----------------------------------------------------------------
-- Even with a UI lock, a savvy user could call supabase.auth.updateUser
-- from devtools or curl and update their own auth.users row. This
-- trigger fires inside Supabase's GoTrue update path and stops it.
--
-- Service-role calls bypass RLS and have auth.uid() = null — those
-- legitimately need to be able to change credentials (e.g. super_admin
-- resetting someone else's password through our admin API). We let
-- those through.
create or replace function public.block_sensitive_auth_updates()
returns trigger as $$
declare
  changing_password boolean;
  changing_email    boolean;
begin
  changing_password := NEW.encrypted_password is distinct from OLD.encrypted_password;
  changing_email    := NEW.email is distinct from OLD.email;

  -- Nothing sensitive changed → allow.
  if not (changing_password or changing_email) then
    return NEW;
  end if;

  -- Service-role / no auth context → allow (admin API path).
  if auth.uid() is null then
    return NEW;
  end if;

  -- Authenticated user trying to change own password/email — gate on role.
  if not public.is_super_admin() then
    raise exception 'Only super_admin can change account credentials. Contact the owner.'
      using errcode = '42501', hint = 'See /admin/account for guidance.';
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists block_sensitive_auth_updates on auth.users;
create trigger block_sensitive_auth_updates
  before update on auth.users
  for each row
  execute function public.block_sensitive_auth_updates();

-- ----------------------------------------------------------------
-- Update existing admin RLS policies to include super_admin
-- ----------------------------------------------------------------
-- Every existing policy that compares to 'admin' should also accept
-- 'super_admin'. Replace in place; idempotent via drop + create.

drop policy if exists team_members_admin_all on public.team_members;
create policy team_members_admin_all on public.team_members for all to authenticated
  using (public.current_user_role() in ('admin', 'super_admin'))
  with check (public.current_user_role() in ('admin', 'super_admin'));

-- integrations: super_admin only (Fix 6 — channels are owner-level
-- config; a manager who toggled them off by accident would silence the
-- whole funnel).
drop policy if exists integrations_admin on public.integrations;
drop policy if exists integrations_super_admin on public.integrations;
create policy integrations_super_admin on public.integrations for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- ----------------------------------------------------------------
-- Bootstrap: assign owner email → super_admin
-- ----------------------------------------------------------------
-- Only runs when the row exists; we don't insert because team_members
-- entries are created through /admin/team, not migration.
update public.team_members
   set role = 'super_admin'
 where lower(email) = 'sttonememory@gmail.com'
   and role <> 'super_admin';

-- ============================================================
-- POST-MIGRATION VERIFICATION
-- ============================================================
-- Run these manually after deploy to confirm:
--
--   select role, count(*) from public.team_members group by role;
--   -- Expect: super_admin=1, plus whatever admins/managers exist.
--
--   select tgname from pg_trigger where tgname = 'block_sensitive_auth_updates';
--   -- Expect: one row.
--
--   -- Sanity check: log in as a manager and try
--   --   supabase.auth.updateUser({password: 'x'})
--   -- Should fail with "Only super_admin can change account credentials."
