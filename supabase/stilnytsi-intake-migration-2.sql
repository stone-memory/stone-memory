-- ============================================================
-- Заявка → угода, версія 2: позиції та опис.
--
-- Проблема v1: угода з заявки отримувала лише текст повідомлення, а обрані
-- на сайті камені (orders.items) губились. На сторінці угоди «Позиції угоди»
-- були порожні, на картці в канбані нічого не ідентифікувало угоду.
--
-- Що робить:
--   1. Тригер orders → deals тепер копіює orders.items у deal_items
--      (назва, ціна, фото в meta) і, якщо повідомлення порожнє, складає опис
--      «Обрано на сайті: …» з назв позицій. Сума угоди — з обраної ціни
--      (selectedPrice), а не лише з priceFrom.
--   2. Бекфіл: угодам, які вже створені із заявок, але без позицій,
--      додає позиції та опис. Безпечно запускати повторно.
--
-- Виконати ПІСЛЯ stilnytsi-intake-migration.sql у Supabase → SQL Editor.
-- ============================================================

create or replace function public.copy_legacy_order_to_deal() returns trigger as $$
declare
  c_id  uuid;
  d_id  uuid;
  norm  text  := regexp_replace(coalesce(new.phone, ''), '\D', '', 'g');
  cat   text  := case when new.source = 'stilnytsi' then 'interior' else 'memorial' end;
  attr  jsonb := to_jsonb(new) -> 'attribution';
  items jsonb := case when jsonb_typeof(new.items) = 'array' then new.items else '[]'::jsonb end;
  descr text  := nullif(btrim(coalesce(new.message, '')), '');
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

  -- Опис-фолбек: без повідомлення — перелік обраних позицій.
  if descr is null and jsonb_array_length(items) > 0 then
    select 'Обрано на сайті: ' || string_agg(
             coalesce(nullif(i->>'name', ''), '№ ' || coalesce(i->>'code', i->>'id')), ', ')
      into descr
      from jsonb_array_elements(items) i;
  end if;

  insert into public.deals (
    customer_id, status, category, source, description, install_city, utm, amount_eur, order_id, notes
  ) values (
    c_id,
    'new',
    cat,
    coalesce(new.source, 'site'),
    descr,
    new.city,
    attr,
    coalesce((select sum(coalesce(nullif(i->>'selectedPrice', '')::numeric, nullif(i->>'priceFrom', '')::numeric, 0))
                from jsonb_array_elements(items) i), 0),
    new.id,
    'Створено автоматично із заявки сайту'
  )
  returning id into d_id;

  -- Обрані на сайті камені → позиції угоди.
  insert into public.deal_items (deal_id, kind, ref_id, title, qty, unit_price_eur, meta, position)
  select d_id,
         'stone',
         i->>'id',
         coalesce(nullif(i->>'name', ''), '№ ' || coalesce(i->>'code', i->>'id')),
         1,
         coalesce(nullif(i->>'selectedPrice', '')::numeric, nullif(i->>'priceFrom', '')::numeric, 0),
         jsonb_strip_nulls(jsonb_build_object(
           'imagePath', i->>'imagePath',
           'code', i->>'code',
           'slug', i->>'slug',
           'selectedMaterial', i->>'selectedMaterial'
         )),
         ord - 1
    from jsonb_array_elements(items) with ordinality as t(i, ord);

  return new;
exception when others then
  raise warning 'copy_legacy_order_to_deal: заявка % — %', new.id, sqlerrm;
  return new;
end $$ language plpgsql;

-- ------------------------------------------------------------
-- Бекфіл для вже створених угод (без позицій)
-- ------------------------------------------------------------
insert into public.deal_items (deal_id, kind, ref_id, title, qty, unit_price_eur, meta, position)
select d.id,
       'stone',
       i->>'id',
       coalesce(nullif(i->>'name', ''), '№ ' || coalesce(i->>'code', i->>'id')),
       1,
       coalesce(nullif(i->>'selectedPrice', '')::numeric, nullif(i->>'priceFrom', '')::numeric, 0),
       jsonb_strip_nulls(jsonb_build_object(
         'imagePath', i->>'imagePath',
         'code', i->>'code',
         'slug', i->>'slug',
         'selectedMaterial', i->>'selectedMaterial'
       )),
       ord - 1
  from public.deals d
  join public.orders o on o.id = d.order_id
  cross join lateral jsonb_array_elements(
         case when jsonb_typeof(o.items) = 'array' then o.items else '[]'::jsonb end
       ) with ordinality as t(i, ord)
 where not exists (select 1 from public.deal_items di where di.deal_id = d.id);

update public.deals d
   set description = sub.descr
  from (
    select d2.id,
           'Обрано на сайті: ' || string_agg(
             coalesce(nullif(i->>'name', ''), '№ ' || coalesce(i->>'code', i->>'id')), ', ') as descr
      from public.deals d2
      join public.orders o on o.id = d2.order_id
      cross join lateral jsonb_array_elements(
             case when jsonb_typeof(o.items) = 'array' then o.items else '[]'::jsonb end
           ) i
     where d2.description is null
     group by d2.id
  ) sub
 where sub.id = d.id;

-- ------------------------------------------------------------
-- (Опційно) Заявки, що лежать в orders БЕЗ угоди (створені до v1), теж
-- перенести у воронку. Розкоментувати і виконати окремо, якщо треба.
-- Тестові заявки з дашборда після цього доведеться видалити з «Угод» руками.
--
-- insert into public.deals (customer_id, status, category, source, description, install_city, order_id, notes)
-- select c.id, 'new', case when o.source = 'stilnytsi' then 'interior' else 'memorial' end,
--        coalesce(o.source, 'site'), o.message, o.city, o.id, 'Перенесено з orders'
--   from public.orders o
--   join public.customers c on c.phone_norm = regexp_replace(coalesce(o.phone, ''), '\D', '', 'g')
--  where not exists (select 1 from public.deals d where d.order_id = o.id);
-- -- після цього ще раз виконати два бекфіли вище, щоб з'явились позиції й опис.
-- ------------------------------------------------------------
