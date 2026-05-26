-- Points forts produit (liste saisie manuellement dans l'admin)
alter table public.products
  add column if not exists highlights jsonb default '[]'::jsonb;
