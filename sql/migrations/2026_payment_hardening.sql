-- Payment hardening: idempotence, audit logs, stock reservation, order expiration

-- Idempotence des webhooks FedaPay
create table if not exists public.webhook_events (
  id             uuid primary key default gen_random_uuid(),
  fedapay_tx_id  bigint not null unique,
  order_id       uuid references public.orders(id) on delete set null,
  event_status   text not null,
  processed_at   timestamptz not null default now()
);

create index if not exists webhook_events_tx_idx on public.webhook_events(fedapay_tx_id);

-- Logs d'audit de paiement
create table if not exists public.payment_logs (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid references public.orders(id) on delete set null,
  event_type      text not null,
  status_before   text,
  status_after    text,
  fedapay_tx_id   bigint,
  amount_expected int,
  amount_received int,
  metadata        jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists payment_logs_order_idx   on public.payment_logs(order_id);
create index if not exists payment_logs_created_idx on public.payment_logs(created_at desc);

-- Stock réservé au checkout (évite le double décrémentage dans le webhook)
alter table public.orders add column if not exists stock_reserved boolean not null default false;

-- Raison d'échec de paiement (declined, canceled, failed, amount_mismatch)
alter table public.orders add column if not exists failed_reason text;

-- Expiration des commandes pending (30 min par défaut)
alter table public.orders add column if not exists expires_at timestamptz;
