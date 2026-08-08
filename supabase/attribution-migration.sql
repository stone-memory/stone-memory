-- ============================================================
-- Traffic attribution — де взявся лід
--
-- Заявка приходить із мітками кампанії, які рекламний кабінет дописав
-- у посилання (?utm_source=…&gclid=…). Клієнтський код ловить їх на
-- ПЕРШОМУ візиті (див. lib/attribution.ts), бо далі вони зникають з адреси.
--
-- Зберігаємо в двох нових місцях, і це навмисно:
--   orders.attribution     — на кожній заявці, «звідки прийшла ця заявка»
--   customers.attribution  — first-touch на клієнті, «яка кампанія його привела»
--
-- Друге важливіше: угоди створюються з клієнта вручну, тож саме на картці
-- клієнта менеджер бачить джерело, коли працює з угодою. Перезапису немає —
-- повторна заявка не затирає кампанію, яка привела людину вперше.
--
-- Третє місце вже існує: deals.utm (crm-migration.sql) було створене саме під
-- це й досі не заповнювалось. Тепер POST /api/crm/deals копіює туди
-- attribution клієнта у момент створення угоди — щоб дохід можна було
-- згрупувати за кампанією без join. Міграції для нього не треба.
--
-- jsonb, а не окремі колонки: набір міток різний для різних майданчиків
-- (gclid лише в Google, fbclid у Meta, ttclid у TikTok). Новий канал
-- не потребуватиме ще однієї міграції.
--
-- Обидві операції ідемпотентні — файл можна виконати повторно.
-- ============================================================

alter table public.orders
  add column if not exists attribution jsonb;

alter table public.customers
  add column if not exists attribution jsonb;

comment on column public.orders.attribution is
  'First-touch мітки кампанії на момент заявки: utm_*, gclid/fbclid/ttclid, referrer, landing, first_seen.';

comment on column public.customers.attribution is
  'First-touch мітки кампанії, зафіксовані при створенні клієнта. Не перезаписується.';

-- Часткові індекси: рядків без атрибуції буде багато (прямі заходи,
-- заявки з месенджерів), і в індексі вони лише займали б місце.
create index if not exists orders_attribution_source_idx
  on public.orders ((attribution->>'utm_source'))
  where attribution is not null;

create index if not exists customers_attribution_source_idx
  on public.customers ((attribution->>'utm_source'))
  where attribution is not null;

create index if not exists customers_attribution_campaign_idx
  on public.customers ((attribution->>'utm_campaign'))
  where attribution is not null;

-- ============================================================
-- Перевірка після виконання:
--
--   select attribution->>'utm_source'   as source,
--          attribution->>'utm_campaign' as campaign,
--          count(*)
--     from public.orders
--    where attribution is not null
--    group by 1, 2
--    order by 3 desc;
--
-- Коли назбираються угоди — дохід за кампаніями:
--
--   select c.attribution->>'utm_campaign' as campaign,
--          count(distinct d.id)           as deals,
--          sum(d.amount_eur)              as revenue_eur
--     from public.deals d
--     join public.customers c on c.id = d.customer_id
--    where c.attribution is not null
--    group by 1
--    order by revenue_eur desc nulls last;
-- ============================================================
