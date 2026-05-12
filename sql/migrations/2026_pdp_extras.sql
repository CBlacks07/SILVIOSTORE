-- Adds PDP content columns (long description, specifications, FAQ).
alter table public.products add column if not exists long_description text;
alter table public.products add column if not exists specifications   jsonb;
alter table public.products add column if not exists faq              jsonb;
