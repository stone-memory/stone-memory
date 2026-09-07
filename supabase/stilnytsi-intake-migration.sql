-- ============================================================
-- Заявки з сайту стільниць (stilnytsi.stonememory.com.ua) + авто-угоди.
--
-- Що робить:
--   1. orders.city — місто клієнта (сайт стільниць його питає).
--   2. deals.order_id — звʼязок угоди із заявкою, щоб синхронізувати статус.
--   3. Тригер після INSERT в orders: створює customer (або знаходить за
--      телефоном) і deal з категорією за джерелом:
--        source = 'stilnytsi' → category 'interior' (Стільниці)
--        інакше                → category 'memorial' (Памʼятники)
--      Місто → deals.install_city, attribution (utm) → deals.utm.
--   4. Тригер після UPDATE статусу заявки на дашборді: тягне угоду вперед.
--        in_progress → contacted   (лише якщо угода ще 'new')
--        completed   → completed   (якщо не cancelled/lost)
--      Назад угоду ніколи не відкочує: воронка — джерело правди про етап.
--
-- Обидва тригери ковтають власні помилки (raise warning) — заявка з сайту
-- має записатись, навіть якщо CRM-частина зламалась.
--
-- Виконати один раз у Supabase → SQL Editor. Повторний запуск безпечний.
-- Після виконання перевірити:  select tgname from pg_trigger
--                              where tgrelid = 'public.orders'::regclass;
-- Має показати orders_copy_to_deal і orders_sync_status_to_deal.
-- ============================================================

-- 1. Місто на заявці
alter table public.orders add column if not exists city text;

-- 2. Звʼязок угоди із заявкою
alter table public.deals
  add column if not exists order_id uuid references public.orders(id) on delete set null;
create index if not exists deals_order_id_idx on public.deals (order_id);

-- 3. Заявка → customer + deal
create or replace function public.copy_legacy_order_to_deal() returns trigger as $$
declare
  c_id uuid;
  norm text := regexp_replace(coalesce(new.phone, ''), '\D', '', 'g');
  cat  text := case when new.source = 'stilnytsi' then 'interior' else 'memorial' end;
  -- через to_jsonb, щоб функція не падала, якщо attribution-migration ще не виконано
  attr jsonb := to_jsonb(new) -> 'attribution';
begin
  if norm = '' then
    return new; -- без телефону клієнта не ідентифікувати; заявка все одно лишається в orders
  end if;

  select id into c_id from public.customers where phone_norm = norm limit 1;
  if c_id is null then
    insert into public.customers (phone, name, email, locale, source, city)
    values (new.phone, new.name, new.email, coalesce(new.locale, 'uk'), coalesce(new.source, 'site'), new.city)
    returning id into c_id;
  else
    update public.customers
       set city = coalesce(city, new.city),
           last_contact_at = now()
     where id = c_id;
  end if;

  insert into public.deals (
    customer_id, status, category, source, description, install_city, utm, amount_eur, order_id, notes
  ) values (
    c_id,
    'new',
    cat,
    coalesce(new.source, 'site'),
    new.message,
    new.city,
    attr,
    coalesce((select sum((i->>'priceFrom')::numeric)
                from jsonb_array_elements(coalesce(new.items, '[]'::jsonb)) i), 0),
    new.id,
    'Створено автоматично із заявки сайту'
  );
  return new;
exception when others then
  raise warning 'copy_legacy_order_to_deal: заявка % — %', new.id, sqlerrm;
  return new;
end $$ language plpgsql;

drop trigger if exists orders_copy_to_deal on public.orders;
create trigger orders_copy_to_deal
  after insert on public.orders
  for each row execute function public.copy_legacy_order_to_deal();

-- 4. Статус заявки на дашборді → етап угоди (лише вперед)
create or replace function public.sync_order_status_to_deal() returns trigger as $$
begin
  if old.status is not distinct from new.status then
    return new;
  end if;
  if new.status = 'in_progress' then
    update public.deals set status = 'contacted'
     where order_id = new.id and status = 'new';
  elsif new.status = 'completed' then
    update public.deals set status = 'completed'
     where order_id = new.id and status not in ('completed', 'cancelled', 'lost');
  end if;
  return new;
exception when others then
  raise warning 'sync_order_status_to_deal: заявка % — %', new.id, sqlerrm;
  return new;
end $$ language plpgsql;

drop trigger if exists orders_sync_status_to_deal on public.orders;
create trigger orders_sync_status_to_deal
  after update of status on public.orders
  for each row execute function public.sync_order_status_to_deal();

-- ------------------------------------------------------------
-- (Опційно) Перенести у воронку заявки, що вже лежать в orders без угоди.
-- Розкоментувати і виконати окремо, якщо треба:
--
-- insert into public.deals (customer_id, status, category, source, description, install_city, order_id, notes)
-- select c.id, 'new', 'memorial', coalesce(o.source, 'site'), o.message, o.city, o.id, 'Перенесено з orders'
--   from public.orders o
--   join public.customers c on c.phone_norm = regexp_replace(coalesce(o.phone, ''), '\D', '', 'g')
--  where not exists (select 1 from public.deals d where d.order_id = o.id);
-- ------------------------------------------------------------
