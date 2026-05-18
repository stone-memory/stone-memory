-- Fix: deals_log_status_change was a BEFORE INSERT trigger that tried to
-- insert into deal_events with deal_id = new.id — but BEFORE INSERT means
-- the deal row doesn't exist yet, so the FK constraint deal_events_deal_id_fkey fails.
--
-- Solution: split into two triggers:
--   1. BEFORE UPDATE only  — sets prev_status and auto-timestamps (needs to modify NEW)
--   2. AFTER INSERT OR UPDATE — logs to deal_events (deal row now exists)

-- ── Step 1: drop the broken trigger ─────────────────────────────────────────
drop trigger if exists deals_log_status_change on public.deals;

-- ── Step 2: BEFORE UPDATE — set prev_status + auto-timestamps ───────────────
create or replace function public.set_deal_timestamps() returns trigger as $$
begin
  if old.status is distinct from new.status then
    new.prev_status := old.status;
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

drop trigger if exists deals_set_timestamps on public.deals;
create trigger deals_set_timestamps
  before update on public.deals
  for each row execute function public.set_deal_timestamps();

-- ── Step 3: AFTER INSERT OR UPDATE — log to deal_events (deal row exists now) ─
create or replace function public.log_deal_status_change() returns trigger as $$
begin
  if tg_op = 'INSERT' then
    insert into public.deal_events (deal_id, kind, to_status, message)
    values (new.id, 'status_change', new.status, 'Угода створена');
    return new;
  end if;
  if old.status is distinct from new.status then
    insert into public.deal_events (deal_id, kind, from_status, to_status)
    values (new.id, 'status_change', old.status, new.status);
  end if;
  return new;
end $$ language plpgsql;

drop trigger if exists deals_log_status_change on public.deals;
create trigger deals_log_status_change
  after insert or update on public.deals
  for each row execute function public.log_deal_status_change();
