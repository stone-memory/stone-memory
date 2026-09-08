-- ============================================================
-- Лічильники сповіщень в адмінці через Supabase Realtime.
--
-- Бічна панель підписується на зміни в orders, deals, reminders,
-- communications, chat_messages і перераховує бейджі за ~0,5 с замість
-- polling раз на 30 с.
--
-- 1) RLS на orders. На цій таблиці його досі не було, а Realtime віддає
--    рядки кожному підписнику, якого пропускає RLS — без політики заявки
--    (імʼя, телефон) отримав би будь-хто з публічним anon-ключем сайту.
--    Читати можуть лише активні члени команди. Сервер працює через
--    service role, якого RLS не стосується: /api/orders як і раніше.
-- 2) Таблиці додаються до публікації supabase_realtime (chat_messages і
--    chat_sessions уже там із schema.sql).
--
-- Виконати один раз у Supabase → SQL Editor. Повторний запуск безпечний.
-- ============================================================

alter table public.orders enable row level security;

drop policy if exists orders_team_read on public.orders;
create policy orders_team_read on public.orders
  for select to authenticated
  using (
    exists (
      select 1 from public.team_members tm
      where tm.user_id = auth.uid() and tm.active
    )
  );

do $$
declare
  t text;
begin
  foreach t in array array['orders', 'deals', 'reminders', 'communications'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- Перевірити: select tablename from pg_publication_tables where pubname = 'supabase_realtime';
-- Має містити orders, deals, reminders, communications, chat_messages.
