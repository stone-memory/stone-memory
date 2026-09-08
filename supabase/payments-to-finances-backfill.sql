-- ============================================================
-- Перенести платежі з угод, внесені ДО дзеркала у «Фінанси», в transactions.
-- Ідемпотентно: платіж, який уже є (id = 'pay-<payment id>'), пропускається.
-- Виконати один раз у Supabase → SQL Editor.
-- ============================================================
insert into public.transactions (id, data, kind, amount, occurred_at)
select
  'pay-' || p.id,
  jsonb_build_object(
    'id', 'pay-' || p.id,
    'kind', case when p.kind = 'refund' then 'expense' else 'income' end,
    'category', 'order',
    'amount', p.amount_eur,
    'date', (extract(epoch from p.paid_at) * 1000)::bigint,
    'note', (case when p.kind = 'refund' then 'Повернення' else 'Оплата' end)
            || ' по угоді ' || coalesce(d.reference, p.deal_id::text)
            || coalesce(' · ' || nullif(p.reference, ''), ''),
    'relatedOrderId', p.deal_id
  ),
  case when p.kind = 'refund' then 'expense' else 'income' end,
  p.amount_eur,
  p.paid_at
from public.payments p
join public.deals d on d.id = p.deal_id
where not exists (select 1 from public.transactions t where t.id = 'pay-' || p.id);
