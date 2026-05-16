-- ============================================================
-- STONE MEMORY CRM — channel integrations migration
-- Запустити ПІСЛЯ crm-migration.sql.
-- Idempotent.
--
-- Що додаємо:
--   • customers.channels jsonb — telegram_user_id, instagram_psid, whatsapp_phone тощо
--   • communications.thread_key — для групування у conversations
--   • integrations table — статус і токени каналів
-- ============================================================

-- 1. Канальні ідентифікатори клієнта
alter table public.customers
  add column if not exists channels jsonb not null default '{}'::jsonb;

create index if not exists customers_channels_telegram_idx
  on public.customers ((channels->>'telegram_user_id'))
  where channels ? 'telegram_user_id';

create index if not exists customers_channels_instagram_idx
  on public.customers ((channels->>'instagram_psid'))
  where channels ? 'instagram_psid';

-- 2. Thread key для conversations
-- Формат: <channel>:<external_thread_id>
-- Для Telegram: "telegram:<chat_id>"
-- Для WhatsApp: "whatsapp:<wa_id>"
-- Для Email: "email:<thread_id>" (Message-ID першого листа)
-- Для site_chat: "site_chat:<session_id>"
alter table public.communications
  add column if not exists thread_key text;

create index if not exists comms_thread_idx
  on public.communications (thread_key, created_at desc)
  where thread_key is not null;

-- 3. Інтеграційні налаштування (на випадок якщо хочеш керувати через UI)
create table if not exists public.integrations (
  id          text primary key,                              -- 'telegram' | 'whatsapp' | 'instagram' | 'email_inbound' | 'twilio_sms'
  enabled     boolean not null default false,
  config      jsonb not null default '{}'::jsonb,            -- API tokens, phone_number_id тощо
  last_event_at timestamptz,
  last_error  text,
  updated_at  timestamptz not null default now()
);

-- Initial rows
insert into public.integrations (id, enabled) values
  ('telegram', false),
  ('whatsapp', false),
  ('instagram', false),
  ('email_inbound', false),
  ('twilio_sms', false)
on conflict (id) do nothing;

alter table public.integrations enable row level security;

drop policy if exists integrations_admin on public.integrations;
create policy integrations_admin on public.integrations for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');
