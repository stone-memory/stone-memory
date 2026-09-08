-- =====================================================================
-- Stone Memory · контент сайту стільниць (CMS) — крок 1: схема
-- Виконати в Supabase → SQL Editor (той самий проєкт, що й CRM памʼятників).
--
-- Принцип: одна таблиця на тип контенту, сам запис — jsonb у колонці data
-- (як articles/projects у CRM). Читає сайт стільниць через anon-ключ і RLS
-- (лише неприховані записи), пише — тільки адмінка через service role.
-- =====================================================================

create table if not exists public.stilnytsi_materials (
  slug        text primary key,
  data        jsonb not null,
  hidden      boolean not null default false,
  position    integer not null default 0,
  updated_at  timestamptz not null default now()
);

create table if not exists public.stilnytsi_projects (
  slug        text primary key,
  data        jsonb not null,
  hidden      boolean not null default false,
  position    integer not null default 0,
  updated_at  timestamptz not null default now()
);

create table if not exists public.stilnytsi_articles (
  slug        text primary key,
  data        jsonb not null,
  hidden      boolean not null default false,
  position    integer not null default 0,
  updated_at  timestamptz not null default now()
);

create table if not exists public.stilnytsi_slabs (
  id          text primary key,
  data        jsonb not null,
  hidden      boolean not null default false,
  position    integer not null default 0,
  updated_at  timestamptz not null default now()
);

create table if not exists public.stilnytsi_remnants (
  id          text primary key,
  data        jsonb not null,
  hidden      boolean not null default false,
  position    integer not null default 0,
  updated_at  timestamptz not null default now()
);

-- Налаштування: контакти, ставки калькулятора, FAQ, тексти службових сторінок…
create table if not exists public.stilnytsi_settings (
  key         text primary key,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

-- updated_at оновлюється сам
create or replace function public.stilnytsi_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['stilnytsi_materials','stilnytsi_projects','stilnytsi_articles',
                           'stilnytsi_slabs','stilnytsi_remnants','stilnytsi_settings'] loop
    execute format('drop trigger if exists %I_touch on public.%I', t, t);
    execute format('create trigger %I_touch before update on public.%I
                    for each row execute function public.stilnytsi_touch_updated_at()', t, t);
  end loop;
end $$;

-- RLS: публічне читання лише неприхованого; запис — service role (адмінка)
do $$
declare t text;
begin
  foreach t in array array['stilnytsi_materials','stilnytsi_projects','stilnytsi_articles',
                           'stilnytsi_slabs','stilnytsi_remnants'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I_public_read on public.%I', t, t);
    execute format('create policy %I_public_read on public.%I for select to anon, authenticated using (not hidden)', t, t);
    execute format('grant select on public.%I to anon, authenticated', t);
  end loop;
end $$;

alter table public.stilnytsi_settings enable row level security;
drop policy if exists stilnytsi_settings_public_read on public.stilnytsi_settings;
create policy stilnytsi_settings_public_read on public.stilnytsi_settings
  for select to anon, authenticated using (true);
grant select on public.stilnytsi_settings to anon, authenticated;

-- Перевірка: має повернути 6 таблиць
select table_name from information_schema.tables
where table_schema = 'public' and table_name like 'stilnytsi_%'
order by table_name;
