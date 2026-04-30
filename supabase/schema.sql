-- ============================================================
-- STONE MEMORY  —  CMS content tables
-- Run this in Supabase SQL Editor once. Idempotent.
-- Existing "orders" table is left alone.
-- ============================================================

-- ----- stones (catalog) -----
create table if not exists public.stones (
  id          text primary key,
  data        jsonb not null,
  position    int not null default 0,
  hidden      boolean not null default false,
  updated_at  timestamptz not null default now()
);
create index if not exists stones_position_idx on public.stones (position asc);
create index if not exists stones_hidden_idx   on public.stones (hidden);

-- ----- services -----
create table if not exists public.services (
  slug        text primary key,
  data        jsonb not null,
  position    int not null default 0,
  hidden      boolean not null default false,
  updated_at  timestamptz not null default now()
);
create index if not exists services_position_idx on public.services (position asc);

-- ----- projects -----
create table if not exists public.projects (
  slug        text primary key,
  data        jsonb not null,
  position    int not null default 0,
  hidden      boolean not null default false,
  updated_at  timestamptz not null default now()
);
create index if not exists projects_position_idx on public.projects (position asc);

-- ----- articles (blog posts) -----
create table if not exists public.articles (
  slug        text primary key,
  data        jsonb not null,
  position    int not null default 0,
  hidden      boolean not null default false,
  updated_at  timestamptz not null default now()
);
create index if not exists articles_position_idx on public.articles (position asc);

-- ----- reviews -----
create table if not exists public.reviews (
  id          text primary key,
  data        jsonb not null,
  placement   text not null default 'home',      -- 'home' | 'all' | 'hidden'
  "order"     int not null default 99,
  updated_at  timestamptz not null default now()
);
create index if not exists reviews_placement_order_idx on public.reviews (placement, "order");

-- ----- faq -----
create table if not exists public.faq_items (
  id          text primary key,
  data        jsonb not null,
  "order"     int not null default 0,
  hidden      boolean not null default false,
  updated_at  timestamptz not null default now()
);
create index if not exists faq_items_order_idx on public.faq_items ("order");

-- ----- featured stones (ordered list of ids) -----
create table if not exists public.featured_stones (
  stone_id    text primary key,
  position    int not null default 0
);
create index if not exists featured_stones_position_idx on public.featured_stones (position);

-- ----- project hidden categories -----
create table if not exists public.project_hidden_categories (
  category    text primary key
);

-- ----- singleton site content (about per-locale, business profile, blog config) -----
create table if not exists public.site_content (
  key         text primary key,                  -- e.g. 'about_uk', 'business_profile', 'blog_config'
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

-- ----- newsletter subscribers -----
create table if not exists public.subscribers (
  id                 uuid primary key default gen_random_uuid(),
  email              text not null,
  locale             text not null default 'uk',
  status             text not null default 'active',  -- 'active' | 'unsubscribed'
  unsubscribe_token  uuid not null default gen_random_uuid(),
  consent_at         timestamptz not null default now(),
  unsubscribed_at    timestamptz null,
  created_at         timestamptz not null default now()
);
create unique index if not exists subscribers_email_unique_idx on public.subscribers (lower(email));
create index if not exists subscribers_status_idx on public.subscribers (status);
create unique index if not exists subscribers_token_idx on public.subscribers (unsubscribe_token);

-- ==========================================================
-- CRM-only tables: tasks, transactions, internal messages
-- ==========================================================

create table if not exists public.tasks (
  id          text primary key,
  data        jsonb not null,
  status      text not null default 'open',       -- 'open' | 'done' | 'archived'
  updated_at  timestamptz not null default now()
);
create index if not exists tasks_status_idx on public.tasks (status);
create index if not exists tasks_updated_at_idx on public.tasks (updated_at desc);

create table if not exists public.transactions (
  id            text primary key,
  data          jsonb not null,
  kind          text not null default 'expense',  -- 'income' | 'expense'
  amount        numeric not null default 0,
  occurred_at   timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists transactions_occurred_at_idx on public.transactions (occurred_at desc);
create index if not exists transactions_kind_idx on public.transactions (kind);

create table if not exists public.crm_messages (
  id            text primary key,
  data          jsonb not null,
  status        text not null default 'new',      -- 'new' | 'read' | 'replied' | 'archived'
  channel       text,
  received_at   timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists crm_messages_status_idx on public.crm_messages (status);
create index if not exists crm_messages_received_at_idx on public.crm_messages (received_at desc);

-- ----- live chat history -----
create table if not exists public.chat_sessions (
  id                text primary key,
  name              text,
  phone             text,
  locale            text not null default 'uk',
  first_seen_at     timestamptz not null default now(),
  last_activity_at  timestamptz not null default now()
);
create index if not exists chat_sessions_last_activity_idx on public.chat_sessions (last_activity_at desc);

create table if not exists public.chat_messages (
  id          bigserial primary key,
  session_id  text not null references public.chat_sessions(id) on delete cascade,
  from_role   text not null,                          -- 'user' | 'operator'
  text        text not null,
  created_at  timestamptz not null default now()
);
create index if not exists chat_messages_session_idx on public.chat_messages (session_id, created_at);

-- Chat RLS: only authenticated users (admins) can SELECT via Realtime/anon.
-- Server-side writes go through service_role and bypass RLS.
alter table public.chat_sessions  enable row level security;
alter table public.chat_messages  enable row level security;

do $$ begin
  if not exists (select 1 from pg_policy where polname = 'chat_sessions admin read') then
    create policy "chat_sessions admin read"
      on public.chat_sessions for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policy where polname = 'chat_messages admin read') then
    create policy "chat_messages admin read"
      on public.chat_messages for select to authenticated using (true);
  end if;
end $$;

-- Add chat tables to the Realtime publication so admin CRM can subscribe
-- to INSERTs in real time. No-op if already added.
do $$ begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_messages'
  ) then
    execute 'alter publication supabase_realtime add table public.chat_messages';
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_sessions'
  ) then
    execute 'alter publication supabase_realtime add table public.chat_sessions';
  end if;
end $$;

-- ----- scheduled broadcasts (queue) -----
create table if not exists public.scheduled_emails (
  id         uuid primary key default gen_random_uuid(),
  subject    text not null,
  html       text,                                      -- for 'html' kind
  template   text,                                      -- for 'template' kind (e.g. 'marketing')
  fields     jsonb,                                     -- template-specific fields
  target     jsonb not null,                            -- { kind: 'subscribers' | 'clients' | 'specific', emails?: [] }
  send_at    timestamptz not null,
  status     text not null default 'pending',           -- 'pending' | 'sent' | 'failed' | 'cancelled'
  sent_count int not null default 0,
  failed_count int not null default 0,
  error      text,
  created_at timestamptz not null default now(),
  sent_at    timestamptz null
);
create index if not exists scheduled_emails_due_idx on public.scheduled_emails (send_at) where status = 'pending';
-- If you already created this table before, run: alter table public.scheduled_emails add column if not exists template text, add column if not exists fields jsonb;

-- ==========================================================
-- Storage bucket policies  —  stone-images (public read)
-- Uploads/deletes go through server-side API with service_role,
-- which bypasses RLS. We only need a SELECT policy for public reads
-- (so next/image and browsers can fetch the file URLs).
-- Marks the bucket as "public" via its own RLS; you ALSO need the
-- bucket itself to be public in the Supabase Dashboard.
-- ==========================================================

do $$ begin
  -- enable RLS on storage.objects if not already (Supabase has it on by default).
  perform 1 from pg_policy where polname = 'Public read stone-images';
  if not found then
    create policy "Public read stone-images"
      on storage.objects for select
      to public
      using (bucket_id = 'stone-images');
  end if;
end $$;

-- ----- email send log -----
create table if not exists public.email_log (
  id         uuid primary key default gen_random_uuid(),
  recipient  text not null,
  subject    text not null,
  body       text not null,
  scope      text,                                -- 'broadcast' | 'individual' | 'transactional'
  resend_id  text,
  error      text,
  sent_at    timestamptz not null default now()
);
create index if not exists email_log_sent_at_idx on public.email_log (sent_at desc);
