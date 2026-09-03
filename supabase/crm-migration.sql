-- ============================================================
-- STONE MEMORY CRM — повноцінна міграція
-- Запустити ПІСЛЯ schema.sql у Supabase SQL Editor.
-- Idempotent — можна запускати кілька разів.
--
-- Що додаємо (без втрати існуючих даних):
--   • customers          — централізовані картки клієнтів
--   • deals              — угоди з повним lifecycle (17 станів)
--   • deal_items         — позиції угоди (камені/послуги)
--   • deal_events        — timeline всіх подій угоди
--   • reminders          — нагадування з cron-ом
--   • communications     — unified inbox (всі канали)
--   • documents          — згенеровані PDF/договори
--   • production_stages  — етапи виробництва з фото
--   • payments           — платежі по угодам
--   • team_members       — внутрішня команда (admin/manager/master/sales)
--   • audit_log          — повний журнал змін
--
-- Існуючі orders/chat_messages/tasks залишаються нетронутими.
-- ============================================================

-- ----------------------------------------------------------------
-- ROLES (для RLS пізніше)
-- ----------------------------------------------------------------
do $$ begin
  create type team_role as enum ('admin', 'manager', 'master', 'sales');
exception when duplicate_object then null; end $$;

create table if not exists public.team_members (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid unique references auth.users(id) on delete cascade,
  email       text unique not null,
  display_name text,
  role        team_role not null default 'manager',
  phone       text,
  active      boolean not null default true,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists team_members_user_id_idx on public.team_members (user_id);
create index if not exists team_members_role_idx on public.team_members (role) where active = true;

-- Helper: повертає роль поточного auth-користувача (або 'guest')
create or replace function public.current_user_role() returns text as $$
  select coalesce(
    (select role::text from public.team_members where user_id = auth.uid() and active = true limit 1),
    'guest'
  );
$$ language sql stable security definer;

-- ----------------------------------------------------------------
-- CUSTOMERS — централізована картка клієнта
-- ----------------------------------------------------------------
create table if not exists public.customers (
  id           uuid primary key default gen_random_uuid(),
  -- Унікальність по нормалізованому телефону (без пробілів і знаків).
  phone        text not null,
  phone_norm   text generated always as (regexp_replace(coalesce(phone, ''), '\D', '', 'g')) stored,
  name         text not null,
  email        text,
  locale       text not null default 'uk',
  city         text,
  country      text,
  source       text,                                  -- 'site' | 'phone' | 'instagram' | 'referral' | …
  tags         text[] not null default '{}',
  notes        text,
  ltv_eur      numeric(12,2) not null default 0,      -- сума всіх виконаних угод
  deal_count   int not null default 0,                -- кеш для швидкого відображення
  last_contact_at timestamptz,
  do_not_contact boolean not null default false,
  assigned_to  uuid references public.team_members(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create unique index if not exists customers_phone_norm_uniq on public.customers (phone_norm) where phone_norm <> '';
create index if not exists customers_email_idx on public.customers (lower(email)) where email is not null;
create index if not exists customers_assigned_idx on public.customers (assigned_to);
create index if not exists customers_last_contact_idx on public.customers (last_contact_at desc nulls last);
create index if not exists customers_tags_idx on public.customers using gin (tags);

-- ----------------------------------------------------------------
-- DEALS — угоди з повним lifecycle
-- ----------------------------------------------------------------
do $$ begin
  create type deal_status as enum (
    'new',                    -- щойно створена, не оброблена
    'contacted',              -- менеджер зв'язався
    'measurement_scheduled',  -- замір призначено
    'measurement_done',       -- замір зроблено
    'sketch',                 -- готується ескіз
    'sketch_approved',        -- ескіз затверджено клієнтом
    'contract_signed',        -- договір підписано
    'deposit_paid',           -- передоплата отримана
    'in_production',          -- у виробництві
    'qc',                     -- контроль якості
    'ready',                  -- готово до доставки
    'delivery',               -- у доставці / монтаж
    'installed',              -- встановлено
    'paid',                   -- повна оплата отримана
    'completed',              -- закрито позитивно
    -- side states
    'on_hold',                -- призупинено
    'cancelled',              -- скасовано клієнтом
    'lost'                    -- втрачено (відмова, конкурент)
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type deal_priority as enum ('low', 'normal', 'high', 'urgent');
exception when duplicate_object then null; end $$;

create table if not exists public.deals (
  id                uuid primary key default gen_random_uuid(),
  reference         text unique,                          -- читабельний номер: SM-2026-001247
  customer_id       uuid not null references public.customers(id) on delete restrict,
  status            deal_status not null default 'new',
  prev_status       deal_status,                          -- попередній стан, для undo
  priority          deal_priority not null default 'normal',

  -- продукти/категорія
  category          text,                                 -- 'memorial' | 'home'
  description       text,                                 -- ТЗ від клієнта

  -- фінанси (всі суми у EUR, конвертація для UI)
  amount_eur        numeric(12,2) not null default 0,     -- загальна сума
  deposit_eur       numeric(12,2) not null default 0,     -- внесений аванс
  balance_eur       numeric(12,2) generated always as (amount_eur - deposit_eur) stored,
  paid_eur          numeric(12,2) not null default 0,     -- сумарно оплачено

  -- адреси/локація
  install_address   text,
  install_city      text,
  install_lat       numeric(9,6),
  install_lng       numeric(9,6),

  -- assignment
  assigned_to       uuid references public.team_members(id) on delete set null,
  master_id         uuid references public.team_members(id) on delete set null,

  -- ключові дати
  expected_delivery date,
  expected_install  date,
  contract_signed_at timestamptz,
  installed_at      timestamptz,
  completed_at      timestamptz,
  closed_at         timestamptz,                          -- для cancelled/lost

  -- метадані
  source            text,                                 -- звідки прийшов лід
  utm               jsonb,                                -- {source, medium, campaign}
  notes             text,
  internal_notes    text,                                 -- видно лише команді

  created_by        uuid references public.team_members(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists deals_status_idx on public.deals (status);
create index if not exists deals_customer_idx on public.deals (customer_id);
create index if not exists deals_assigned_idx on public.deals (assigned_to) where status not in ('completed', 'cancelled', 'lost');
create index if not exists deals_master_idx on public.deals (master_id) where status not in ('completed', 'cancelled', 'lost');
create index if not exists deals_priority_idx on public.deals (priority, status);
create index if not exists deals_created_idx on public.deals (created_at desc);
create index if not exists deals_install_idx on public.deals (expected_install) where expected_install is not null;

-- Авто-генерація reference для нових угод (формат: SM-YYYY-NNNNNN)
create sequence if not exists deal_reference_seq start with 100000;
create or replace function public.generate_deal_reference() returns trigger as $$
begin
  if new.reference is null or new.reference = '' then
    new.reference := 'SM-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('deal_reference_seq')::text, 6, '0');
  end if;
  return new;
end $$ language plpgsql;

drop trigger if exists deals_set_reference on public.deals;
create trigger deals_set_reference
  before insert on public.deals
  for each row execute function public.generate_deal_reference();

-- Авто-оновлення updated_at
create or replace function public.touch_updated_at() returns trigger as $$
begin new.updated_at := now(); return new; end $$ language plpgsql;

drop trigger if exists deals_touch on public.deals;
create trigger deals_touch before update on public.deals
  for each row execute function public.touch_updated_at();

drop trigger if exists customers_touch on public.customers;
create trigger customers_touch before update on public.customers
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------
-- DEAL_ITEMS — позиції угоди (камені, доп. послуги)
-- ----------------------------------------------------------------
create table if not exists public.deal_items (
  id          uuid primary key default gen_random_uuid(),
  deal_id     uuid not null references public.deals(id) on delete cascade,
  kind        text not null default 'stone',                -- 'stone' | 'service' | 'custom'
  ref_id      text,                                          -- stones.id або services.slug
  title       text not null,
  qty         int not null default 1,
  unit_price_eur numeric(12,2) not null default 0,
  total_eur   numeric(12,2) generated always as (qty * unit_price_eur) stored,
  meta        jsonb,                                         -- розміри, кольори, гравіювання
  position    int not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists deal_items_deal_idx on public.deal_items (deal_id, position);

-- ----------------------------------------------------------------
-- DEAL_EVENTS — timeline (всі переходи статусу + системні події)
-- ----------------------------------------------------------------
create table if not exists public.deal_events (
  id          bigserial primary key,
  deal_id     uuid not null references public.deals(id) on delete cascade,
  kind        text not null,                                 -- 'status_change' | 'note' | 'call' | 'email' | 'sms' | 'document' | 'payment' | 'reminder_set'
  from_status deal_status,
  to_status   deal_status,
  message     text,
  data        jsonb,                                         -- довільні метадані
  actor_id    uuid references public.team_members(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists deal_events_deal_idx on public.deal_events (deal_id, created_at desc);
create index if not exists deal_events_kind_idx on public.deal_events (kind);

-- Тригер: при зміні status — автоматично додати запис у deal_events
create or replace function public.log_deal_status_change() returns trigger as $$
begin
  if tg_op = 'INSERT' then
    insert into public.deal_events (deal_id, kind, to_status, message)
    values (new.id, 'status_change', new.status, 'Угода створена');
    return new;
  end if;

  if old.status is distinct from new.status then
    new.prev_status := old.status;
    insert into public.deal_events (deal_id, kind, from_status, to_status)
    values (new.id, 'status_change', old.status, new.status);

    -- Авто-проставлення певних timestamp-ів
    if new.status = 'contract_signed' and new.contract_signed_at is null then
      new.contract_signed_at := now();
    end if;
    if new.status = 'installed' and new.installed_at is null then
      new.installed_at := now();
    end if;
    if new.status = 'completed' and new.completed_at is null then
      new.completed_at := now();
    end if;
    if new.status in ('cancelled', 'lost') and new.closed_at is null then
      new.closed_at := now();
    end if;
  end if;
  return new;
end $$ language plpgsql;

drop trigger if exists deals_log_status_change on public.deals;
create trigger deals_log_status_change
  before insert or update on public.deals
  for each row execute function public.log_deal_status_change();

-- Тригер: при зміні статусу на 'completed' — оновити customers.ltv_eur і deal_count
create or replace function public.refresh_customer_aggregates() returns trigger as $$
declare
  c_id uuid := coalesce(new.customer_id, old.customer_id);
begin
  if c_id is null then return coalesce(new, old); end if;
  update public.customers set
    deal_count = (select count(*) from public.deals where customer_id = c_id and status not in ('cancelled', 'lost')),
    ltv_eur = (select coalesce(sum(amount_eur), 0) from public.deals where customer_id = c_id and status = 'completed'),
    last_contact_at = greatest(coalesce(last_contact_at, '-infinity'::timestamptz), now())
  where id = c_id;
  return coalesce(new, old);
end $$ language plpgsql;

drop trigger if exists deals_refresh_customer on public.deals;
create trigger deals_refresh_customer
  after insert or update of status, amount_eur or delete on public.deals
  for each row execute function public.refresh_customer_aggregates();

-- ----------------------------------------------------------------
-- REMINDERS — нагадування з cron-ом
-- ----------------------------------------------------------------
do $$ begin
  create type reminder_status as enum ('pending', 'sent', 'snoozed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type reminder_kind as enum (
    'follow_up',         -- перетелефонувати
    'measurement',       -- замір
    'sketch_review',     -- огляд ескізу
    'contract_send',     -- надіслати договір
    'deposit_check',     -- перевірити передоплату
    'production_check',  -- перевірити стан виробництва
    'delivery',          -- доставка
    'installation',      -- монтаж
    'final_payment',     -- остаточна оплата
    'sla_warning',       -- SLA-таймер
    'custom'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.reminders (
  id            uuid primary key default gen_random_uuid(),
  deal_id       uuid references public.deals(id) on delete cascade,
  customer_id   uuid references public.customers(id) on delete cascade,
  assigned_to   uuid references public.team_members(id) on delete set null,
  kind          reminder_kind not null default 'follow_up',
  title         text not null,
  description   text,
  due_at        timestamptz not null,
  status        reminder_status not null default 'pending',
  notify_via    text[] not null default '{telegram,email}',  -- куди слати: telegram, email, in_app
  notified_at   timestamptz,
  snoozed_to    timestamptz,
  completed_at  timestamptz,
  recurrence    text,                                         -- 'daily' | 'weekly' | iCal RRULE
  created_by    uuid references public.team_members(id) on delete set null,
  created_at    timestamptz not null default now()
);
create index if not exists reminders_due_idx on public.reminders (due_at) where status = 'pending';
create index if not exists reminders_assigned_idx on public.reminders (assigned_to, due_at) where status = 'pending';
create index if not exists reminders_deal_idx on public.reminders (deal_id);

-- ----------------------------------------------------------------
-- COMMUNICATIONS — unified inbox для всіх каналів
-- ----------------------------------------------------------------
do $$ begin
  create type comm_channel as enum ('site_chat', 'telegram', 'whatsapp', 'instagram', 'facebook', 'email', 'sms', 'phone', 'manual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type comm_direction as enum ('inbound', 'outbound');
exception when duplicate_object then null; end $$;

create table if not exists public.communications (
  id            bigserial primary key,
  customer_id   uuid references public.customers(id) on delete cascade,
  deal_id       uuid references public.deals(id) on delete set null,
  channel       comm_channel not null,
  direction     comm_direction not null,
  external_id   text,                                          -- ID повідомлення на платформі (telegram message_id, email Message-ID)
  subject       text,
  body          text,
  attachments   jsonb,                                          -- [{name, url, mime, size}]
  read_at       timestamptz,
  replied_at    timestamptz,
  actor_id      uuid references public.team_members(id) on delete set null,
  meta          jsonb,                                          -- raw платформи (для дебагу)
  created_at    timestamptz not null default now()
);
create index if not exists comms_customer_idx on public.communications (customer_id, created_at desc);
create index if not exists comms_deal_idx on public.communications (deal_id, created_at desc);
create index if not exists comms_unread_idx on public.communications (read_at) where read_at is null and direction = 'inbound';
create index if not exists comms_channel_idx on public.communications (channel, created_at desc);

-- ----------------------------------------------------------------
-- DOCUMENTS — згенеровані PDF (договір, прайс, рахунок)
-- ----------------------------------------------------------------
do $$ begin
  create type document_kind as enum ('quote', 'contract', 'invoice', 'receipt', 'act', 'sketch', 'other');
exception when duplicate_object then null; end $$;

create table if not exists public.documents (
  id            uuid primary key default gen_random_uuid(),
  deal_id       uuid references public.deals(id) on delete cascade,
  customer_id   uuid references public.customers(id) on delete cascade,
  kind          document_kind not null,
  number        text,                                           -- "DOG-2026-001247"
  title         text,
  storage_path  text not null,                                  -- шлях у Supabase Storage
  public_url    text,
  size_bytes    int,
  version       int not null default 1,
  signed_at     timestamptz,
  signed_by     text,                                            -- ім'я підписанта
  meta          jsonb,                                            -- snapshot даних з угоди на момент генерації
  created_by    uuid references public.team_members(id) on delete set null,
  created_at    timestamptz not null default now()
);
create index if not exists docs_deal_idx on public.documents (deal_id, created_at desc);
create index if not exists docs_kind_idx on public.documents (kind);

-- ----------------------------------------------------------------
-- PRODUCTION_STAGES — етапи виробництва з фотозвітами
-- ----------------------------------------------------------------
do $$ begin
  create type prod_stage_kind as enum (
    'raw_material',         -- камінь привезено з кар'єру
    'cutting',              -- розпил
    'grinding',             -- шліфування
    'polishing',            -- полірування
    'engraving',            -- гравіювання
    'sealing',              -- герметизація / гідрофобізація
    'qc',                   -- контроль якості
    'packaging',            -- пакування
    'transport',            -- транспорт
    'foundation',           -- залиття фундаменту
    'installation',         -- монтаж на місці
    'cleanup'               -- прибирання території
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type prod_stage_status as enum ('pending', 'in_progress', 'done', 'failed');
exception when duplicate_object then null; end $$;

create table if not exists public.production_stages (
  id            uuid primary key default gen_random_uuid(),
  deal_id       uuid not null references public.deals(id) on delete cascade,
  kind          prod_stage_kind not null,
  status        prod_stage_status not null default 'pending',
  master_id     uuid references public.team_members(id) on delete set null,
  started_at    timestamptz,
  completed_at  timestamptz,
  due_at        timestamptz,
  photos        text[] not null default '{}',                   -- URLs з Supabase Storage
  notes         text,
  position      int not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists prod_stages_deal_idx on public.production_stages (deal_id, position);
create index if not exists prod_stages_master_idx on public.production_stages (master_id, status) where status in ('pending', 'in_progress');

-- ----------------------------------------------------------------
-- PAYMENTS — облік платежів
-- ----------------------------------------------------------------
do $$ begin
  create type payment_kind as enum ('deposit', 'partial', 'balance', 'refund', 'extra');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum ('cash', 'card', 'bank_transfer', 'iban', 'crypto', 'other');
exception when duplicate_object then null; end $$;

create table if not exists public.payments (
  id            uuid primary key default gen_random_uuid(),
  deal_id       uuid not null references public.deals(id) on delete cascade,
  customer_id   uuid not null references public.customers(id) on delete cascade,
  kind          payment_kind not null,
  method        payment_method not null,
  amount_eur    numeric(12,2) not null,
  currency      text not null default 'EUR',                  -- оригінальна валюта
  amount_native numeric(12,2),                                  -- сума в оригінальній валюті
  fx_rate       numeric(10,4),                                  -- курс на момент платежу
  reference     text,                                            -- номер чеку / IBAN-транзакції
  paid_at       timestamptz not null default now(),
  recorded_by   uuid references public.team_members(id) on delete set null,
  notes         text,
  created_at    timestamptz not null default now()
);
create index if not exists payments_deal_idx on public.payments (deal_id, paid_at desc);
create index if not exists payments_paid_idx on public.payments (paid_at desc);

-- Тригер: оновлення deals.paid_eur і deals.deposit_eur
create or replace function public.refresh_deal_payments() returns trigger as $$
declare
  d_id uuid := coalesce(new.deal_id, old.deal_id);
begin
  if d_id is null then return coalesce(new, old); end if;
  update public.deals set
    paid_eur = coalesce((select sum(amount_eur) from public.payments where deal_id = d_id and kind != 'refund'), 0)
              - coalesce((select sum(amount_eur) from public.payments where deal_id = d_id and kind = 'refund'), 0),
    deposit_eur = coalesce((select sum(amount_eur) from public.payments where deal_id = d_id and kind = 'deposit'), 0)
  where id = d_id;
  return coalesce(new, old);
end $$ language plpgsql;

drop trigger if exists payments_refresh_deal on public.payments;
create trigger payments_refresh_deal
  after insert or update or delete on public.payments
  for each row execute function public.refresh_deal_payments();

-- ----------------------------------------------------------------
-- AUDIT_LOG — журнал важливих змін (для звіту перед податковою / safety)
-- ----------------------------------------------------------------
create table if not exists public.audit_log (
  id            bigserial primary key,
  actor_id      uuid references public.team_members(id) on delete set null,
  actor_email   text,
  entity_type   text not null,                                  -- 'deal' | 'payment' | 'customer' | …
  entity_id     text not null,
  action        text not null,                                  -- 'create' | 'update' | 'delete' | 'status_change'
  before        jsonb,
  after         jsonb,
  ip            text,
  user_agent    text,
  created_at    timestamptz not null default now()
);
create index if not exists audit_entity_idx on public.audit_log (entity_type, entity_id, created_at desc);
create index if not exists audit_actor_idx on public.audit_log (actor_id, created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — реальні ролі без localStorage хаків
-- ============================================================

alter table public.customers           enable row level security;
alter table public.deals               enable row level security;
alter table public.deal_items          enable row level security;
alter table public.deal_events         enable row level security;
alter table public.reminders           enable row level security;
alter table public.communications      enable row level security;
alter table public.documents           enable row level security;
alter table public.production_stages   enable row level security;
alter table public.payments            enable row level security;
alter table public.team_members        enable row level security;
alter table public.audit_log           enable row level security;

-- ----------------------------------------------------------------
-- Politики: TEAM_MEMBERS
-- - admin може все
-- - manager/master/sales може читати ВСЮ команду (для assignment), але редагувати лише себе
-- ----------------------------------------------------------------
drop policy if exists team_select on public.team_members;
create policy team_select on public.team_members for select to authenticated
  using (true);

drop policy if exists team_modify_admin on public.team_members;
create policy team_modify_admin on public.team_members for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

drop policy if exists team_self on public.team_members;
create policy team_self on public.team_members for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ----------------------------------------------------------------
-- Policy шаблон для CRM-таблиць:
-- - admin/manager: всі рядки
-- - master: тільки рядки де master_id = current_user
-- - sales: тільки рядки де assigned_to = current_user
-- ----------------------------------------------------------------

-- CUSTOMERS
drop policy if exists customers_admin_all on public.customers;
create policy customers_admin_all on public.customers for all to authenticated
  using (public.current_user_role() in ('admin', 'manager'))
  with check (public.current_user_role() in ('admin', 'manager'));

drop policy if exists customers_assigned_read on public.customers;
create policy customers_assigned_read on public.customers for select to authenticated
  using (
    public.current_user_role() in ('master', 'sales') and
    assigned_to = (select id from public.team_members where user_id = auth.uid() limit 1)
  );

-- DEALS — admin/manager все, master свої виробничі, sales свої продажні
drop policy if exists deals_admin_all on public.deals;
create policy deals_admin_all on public.deals for all to authenticated
  using (public.current_user_role() in ('admin', 'manager'))
  with check (public.current_user_role() in ('admin', 'manager'));

drop policy if exists deals_master_read on public.deals;
create policy deals_master_read on public.deals for select to authenticated
  using (
    public.current_user_role() = 'master' and
    master_id = (select id from public.team_members where user_id = auth.uid() limit 1)
  );

drop policy if exists deals_master_update_status on public.deals;
create policy deals_master_update_status on public.deals for update to authenticated
  using (
    public.current_user_role() = 'master' and
    master_id = (select id from public.team_members where user_id = auth.uid() limit 1)
  )
  with check (
    master_id = (select id from public.team_members where user_id = auth.uid() limit 1)
  );

drop policy if exists deals_sales_assigned on public.deals;
create policy deals_sales_assigned on public.deals for all to authenticated
  using (
    public.current_user_role() = 'sales' and
    assigned_to = (select id from public.team_members where user_id = auth.uid() limit 1)
  )
  with check (
    assigned_to = (select id from public.team_members where user_id = auth.uid() limit 1)
  );

-- DEAL_ITEMS, DEAL_EVENTS, COMMUNICATIONS, DOCUMENTS, PRODUCTION_STAGES, PAYMENTS, REMINDERS:
-- слідують доступу через deal_id (якщо ти можеш бачити deal — можеш бачити все що до нього відноситься)
do $$
declare
  t text;
begin
  foreach t in array array['deal_items', 'deal_events', 'communications', 'documents', 'production_stages', 'payments', 'reminders']
  loop
    execute format($f$
      drop policy if exists %I_admin_all on public.%I;
      create policy %I_admin_all on public.%I for all to authenticated
        using (public.current_user_role() in ('admin', 'manager'))
        with check (public.current_user_role() in ('admin', 'manager'));
    $f$, t, t, t, t);

    execute format($f$
      drop policy if exists %I_via_deal on public.%I;
      create policy %I_via_deal on public.%I for select to authenticated
        using (
          deal_id in (
            select id from public.deals
            where master_id = (select id from public.team_members where user_id = auth.uid() limit 1)
               or assigned_to = (select id from public.team_members where user_id = auth.uid() limit 1)
          )
        );
    $f$, t, t, t, t);
  end loop;
end $$;

-- AUDIT_LOG: лише admin читає
drop policy if exists audit_admin on public.audit_log;
create policy audit_admin on public.audit_log for select to authenticated
  using (public.current_user_role() = 'admin');

-- ============================================================
-- REALTIME publication для CRM
-- ============================================================
do $$
declare t text;
begin
  foreach t in array array['deals', 'deal_events', 'reminders', 'communications', 'payments', 'production_stages']
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- ============================================================
-- Seed первинного admin-користувача (запускається тільки якщо team_members порожня)
-- ============================================================
-- Підказка: після підтвердження email у Supabase Auth — запустити вручну:
-- INSERT INTO public.team_members (user_id, email, display_name, role)
-- VALUES ('<твій-uid>', '<твій-email>', 'Адмін', 'admin');

-- ============================================================
-- ВКЛЮЧЕНО: legacy compat — якщо в orders уже є дані, тригер копіює нові заявки в customers + deals
-- (вмикається опціонально, після основної міграції)
-- ============================================================
create or replace function public.copy_legacy_order_to_deal() returns trigger as $$
declare
  c_id uuid;
  norm text := regexp_replace(coalesce(new.phone, ''), '\D', '', 'g');
begin
  -- Знайти або створити customer по нормалізованому телефону
  select id into c_id from public.customers where phone_norm = norm limit 1;
  if c_id is null then
    insert into public.customers (phone, name, email, locale, source)
    values (new.phone, new.name, new.email, coalesce(new.locale, 'uk'), coalesce(new.source, 'site'))
    returning id into c_id;
  end if;

  insert into public.deals (
    customer_id, status, source, description, amount_eur, category, notes
  ) values (
    c_id,
    case when new.status = 'in_progress' then 'in_production'::deal_status
         when new.status = 'completed' then 'completed'::deal_status
         else 'new'::deal_status end,
    new.source,
    new.message,
    coalesce((select sum((i->>'priceFrom')::numeric) from jsonb_array_elements(coalesce(new.items, '[]'::jsonb)) i), 0),
    -- Always 'memorial': the home & garden line was discontinued. The old
    -- `else 'home'` branch also mislabelled every order that arrived without
    -- items (a plain contact request), because items->0 is NULL there.
    'memorial',
    'Імпортовано з orders'
  );
  return new;
end $$ language plpgsql;

-- Тригер не вмикається автоматично; розкоментувати після того як перевірено:
-- drop trigger if exists orders_copy_to_deal on public.orders;
-- create trigger orders_copy_to_deal after insert on public.orders
--   for each row execute function public.copy_legacy_order_to_deal();

-- ============================================================
-- DONE. Перевірити: select * from team_members;
-- ============================================================
