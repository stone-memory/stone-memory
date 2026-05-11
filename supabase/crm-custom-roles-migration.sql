-- ============================================================
-- STONE MEMORY CRM — custom roles migration (RBAC layer)
-- Run AFTER crm-super-admin-2-policies.sql.
-- Idempotent.
--
-- Adds a flexible role system on top of the existing team_role enum:
--
--   • New table `custom_roles` lets super_admin define named roles with
--     a base_role + a list of capability flags. The base_role anchors
--     the row to one of the 5 enum values, which is what existing RLS
--     policies check — so we don't need to rewrite ~15 policies. The
--     capabilities array is checked at the API / UI layer for fine-
--     grained gating on top of base_role's coarse RLS access.
--
--   • Existing 5 enum values get seeded as is_system rows (un-deletable)
--     so the comparison page and member-add modal can read them from
--     the same table as user-defined roles.
--
--   • New column `team_members.custom_role_id` links a member to a
--     custom role. When set, UI uses the custom role's label and
--     capability list. The enum `role` column ALSO stays set (kept in
--     sync with the custom_role's base_role) so existing RLS policies
--     remain valid without any other changes.
--
--   • New SQL helper `current_user_capabilities()` returns the array
--     of capabilities for the calling user (resolving through their
--     custom_role if present). Used by future fine-grained policies.
-- ============================================================

-- ----------------------------------------------------------------
-- 1. custom_roles table
-- ----------------------------------------------------------------
create table if not exists public.custom_roles (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,                       -- slug, e.g. 'engraver'
  label        text not null,                              -- display, e.g. 'Гравер'
  description  text,
  base_role    team_role not null,                         -- RLS anchor
  capabilities text[] not null default '{}',               -- extra fine-grain perms
  is_system    boolean not null default false,             -- system rows can't be deleted
  created_by   uuid references public.team_members(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists custom_roles_base_idx on public.custom_roles (base_role);

alter table public.custom_roles enable row level security;

-- Everyone authed can READ the role catalog (needed to render labels on
-- team list and analytics). Only super_admin can mutate.
drop policy if exists custom_roles_read on public.custom_roles;
create policy custom_roles_read on public.custom_roles for select to authenticated
  using (true);

drop policy if exists custom_roles_write on public.custom_roles;
create policy custom_roles_write on public.custom_roles for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- ----------------------------------------------------------------
-- 2. team_members.custom_role_id
-- ----------------------------------------------------------------
alter table public.team_members
  add column if not exists custom_role_id uuid references public.custom_roles(id) on delete set null;

create index if not exists team_members_custom_role_idx
  on public.team_members (custom_role_id)
  where custom_role_id is not null;

-- Trigger: keep team_members.role in sync with custom_roles.base_role.
-- Reason: existing RLS policies still check the enum directly. If admin
-- assigns "Гравер" (base_role=master) to a member, we automatically set
-- their role = master so policies don't need any change.
create or replace function public.sync_team_member_role_from_custom()
returns trigger as $$
declare
  base team_role;
begin
  if NEW.custom_role_id is null then
    return NEW;
  end if;
  select cr.base_role into base from public.custom_roles cr where cr.id = NEW.custom_role_id;
  if base is not null and base is distinct from NEW.role then
    NEW.role := base;
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists sync_team_member_role on public.team_members;
create trigger sync_team_member_role
  before insert or update of custom_role_id on public.team_members
  for each row
  execute function public.sync_team_member_role_from_custom();

-- ----------------------------------------------------------------
-- 3. Capability resolver
-- ----------------------------------------------------------------
-- Returns the capability list for the currently authenticated user.
-- - If they have a custom_role → that role's capabilities[] union the
--   base capabilities for the base_role.
-- - Else → just the base capabilities for the enum role.
-- - Anon / no team_members row → empty array.
--
-- The "base capabilities" map below is the SQL mirror of
-- lib/permissions/role-definitions.ts. Keep these two in sync — if you
-- add a new capability to a role in TypeScript, add it here too.
create or replace function public.base_role_capabilities(r team_role)
returns text[] as $$
  select case r
    when 'super_admin' then array[
      'deals.view_all','deals.create','deals.edit','deals.delete_permanent',
      'customers.view_all','customers.edit','customers.message',
      'finances.view_company','finances.record_payments','finances.create_documents',
      'team.manage','team.change_credentials','content.catalog','content.editorial',
      'integrations.manage','data.export'
    ]
    when 'admin' then array[
      'deals.view_all','deals.create','deals.edit',
      'customers.view_all','customers.edit','customers.message',
      'finances.view_company','finances.record_payments','finances.create_documents',
      'team.manage','content.catalog','content.editorial'
    ]
    when 'manager' then array[
      'deals.view_all','deals.create','deals.edit',
      'customers.view_all','customers.edit','customers.message',
      'finances.record_payments','finances.create_documents',
      'content.editorial'
    ]
    when 'master' then array[
      'deals.edit'
      -- master sees ONLY own deals — that scope filter happens in RLS,
      -- not in capabilities. The capability just allows the action.
    ]
    when 'sales' then array[
      'deals.create','deals.edit','customers.edit','customers.message',
      'finances.record_payments'
    ]
    else array[]::text[]
  end;
$$ language sql immutable;

create or replace function public.current_user_capabilities()
returns text[] as $$
declare
  base team_role;
  custom_id uuid;
  extra text[];
begin
  select tm.role, tm.custom_role_id
    into base, custom_id
    from public.team_members tm
   where tm.user_id = auth.uid()
     and tm.active = true
   limit 1;

  if base is null then
    return array[]::text[];
  end if;

  if custom_id is not null then
    select cr.capabilities into extra from public.custom_roles cr where cr.id = custom_id;
    -- union: base capabilities + custom additions, deduplicated
    return array(
      select distinct unnest(public.base_role_capabilities(base) || coalesce(extra, '{}'::text[]))
    );
  end if;

  return public.base_role_capabilities(base);
end;
$$ language plpgsql stable security definer;

create or replace function public.has_capability(cap text)
returns boolean as $$
  select cap = any(public.current_user_capabilities());
$$ language sql stable security definer;

-- ----------------------------------------------------------------
-- 4. Bootstrap: seed the 5 system roles
-- ----------------------------------------------------------------
-- These are immutable from the UI perspective (is_system = true).
-- Each maps to its corresponding enum value 1:1. Capabilities mirror
-- base_role_capabilities() exactly so the UI matrix renders identically
-- to the hardcoded ROLE_PERMISSIONS in TypeScript.
insert into public.custom_roles (name, label, description, base_role, capabilities, is_system)
values
  ('system_super_admin', 'Головний адмін', 'Власник бізнесу. Повний контроль над CRM', 'super_admin',
    public.base_role_capabilities('super_admin'), true),
  ('system_admin', 'Адмін', 'Повний доступ до CRM, ролей, фінансів', 'admin',
    public.base_role_capabilities('admin'), true),
  ('system_manager', 'Менеджер', 'Управління угодами, клієнтами, платежами', 'manager',
    public.base_role_capabilities('manager'), true),
  ('system_master', 'Майстер', 'Виробничі задачі — лише свої угоди', 'master',
    public.base_role_capabilities('master'), true),
  ('system_sales', 'Продажі', 'Продажі — лише свої ліди', 'sales',
    public.base_role_capabilities('sales'), true)
on conflict (name) do update set
  label = excluded.label,
  description = excluded.description,
  base_role = excluded.base_role,
  capabilities = excluded.capabilities,
  is_system = excluded.is_system,
  updated_at = now();

-- ----------------------------------------------------------------
-- VERIFICATION
-- ----------------------------------------------------------------
-- After running, sanity-check with:
--   select count(*) from public.custom_roles where is_system;     -- expect 5
--   select public.current_user_capabilities();                    -- expect non-empty array if logged-in admin
