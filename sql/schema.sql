-- SILVIO STORE — Schéma Postgres pour la base `store`
-- À exécuter dans la base locale `store` (utilisateur postgres).

create extension if not exists "pgcrypto";

-- =========================================================================
-- UTILISATEURS
-- =========================================================================
create table if not exists public.users (
    id             uuid primary key default gen_random_uuid(),
    email          text unique not null,
    password_hash  text not null,
    full_name      text,
    phone          text,
    role           text not null default 'customer' check (role in ('customer','admin')),
    created_at     timestamptz not null default now()
);

create index if not exists users_email_idx on public.users(email);

-- =========================================================================
-- REINITIALISATION MOT DE PASSE
-- =========================================================================
create table if not exists public.password_reset_tokens (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references public.users(id) on delete cascade,
    token_hash  text unique not null,
    expires_at  timestamptz not null,
    used_at     timestamptz,
    created_at  timestamptz not null default now()
);

create index if not exists password_reset_tokens_user_idx on public.password_reset_tokens(user_id);
create index if not exists password_reset_tokens_expires_idx on public.password_reset_tokens(expires_at);

-- =========================================================================
-- CATEGORIES
-- =========================================================================
create table if not exists public.categories (
    id          uuid primary key default gen_random_uuid(),
    slug        text unique not null,
    name        text not null,
    description text,
    image_url   text,
    sort_order  int  not null default 0,
    created_at  timestamptz not null default now()
);

-- =========================================================================
-- PRODUITS
-- =========================================================================
create table if not exists public.products (
    id               uuid primary key default gen_random_uuid(),
    slug             text unique not null,
    name             text not null,
    description      text,
    long_description text,
    brand            text,
    category_id      uuid references public.categories(id) on delete set null,
    price            int  not null check (price >= 0),
    compare_at_price int  check (compare_at_price is null or compare_at_price >= 0),
    stock            int  not null default 0 check (stock >= 0),
    sku              text,
    is_active        boolean not null default true,
    is_featured      boolean not null default false,
    images           text[] not null default '{}',
    variants         jsonb,
    specifications   jsonb,
    faq              jsonb,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
);

alter table public.products add column if not exists long_description text;
alter table public.products add column if not exists specifications   jsonb;
alter table public.products add column if not exists faq              jsonb;

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_brand_idx    on public.products(brand);
create index if not exists products_active_idx   on public.products(is_active);
create index if not exists products_featured_idx on public.products(is_featured);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
    for each row execute function public.set_updated_at();

-- =========================================================================
-- ADRESSES
-- =========================================================================
create table if not exists public.addresses (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references public.users(id) on delete cascade,
    full_name   text not null,
    phone       text not null,
    country     text not null,
    city        text not null,
    district    text,
    details     text not null,
    is_default  boolean not null default false,
    created_at  timestamptz not null default now()
);

create index if not exists addresses_user_idx on public.addresses(user_id);

-- =========================================================================
-- COMMANDES
-- =========================================================================
create table if not exists public.orders (
    id                 uuid primary key default gen_random_uuid(),
    reference          text unique not null,
    user_id            uuid references public.users(id) on delete set null,
    status             text not null default 'pending'
                       check (status in ('pending','paid','preparing','shipped','delivered','cancelled')),
    subtotal           int  not null,
    shipping_cost      int  not null default 0,
    total              int  not null,
    customer_name      text not null,
    customer_phone     text not null,
    customer_email     text,
    shipping_address   text not null,
    shipping_country   text not null,
    shipping_city      text not null,
    payment_provider   text check (payment_provider in ('fedapay')),
    payment_reference  text,
    paid_at            timestamptz,
    created_at         timestamptz not null default now()
);

create index if not exists orders_user_idx       on public.orders(user_id);
create index if not exists orders_status_idx     on public.orders(status);
create index if not exists orders_reference_idx  on public.orders(reference);

create table if not exists public.order_items (
    id              uuid primary key default gen_random_uuid(),
    order_id        uuid not null references public.orders(id) on delete cascade,
    product_id      uuid references public.products(id) on delete set null,
    product_name    text not null,
    unit_price      int  not null,
    quantity        int  not null check (quantity > 0),
    variant_label   text
);

create index if not exists order_items_order_idx on public.order_items(order_id);

-- =========================================================================
-- PARAMÈTRES DU SITE (clé/valeur JSONB)
-- =========================================================================
create table if not exists public.settings (
    key         text primary key,
    value       jsonb not null,
    updated_at  timestamptz not null default now()
);

-- =========================================================================
-- MARQUES
-- =========================================================================
create table if not exists public.brands (
    id          uuid primary key default gen_random_uuid(),
    slug        text unique not null,
    name        text not null,
    logo_url    text,
    sort_order  int  not null default 0,
    is_active   boolean not null default true,
    created_at  timestamptz not null default now()
);

create index if not exists brands_active_idx on public.brands(is_active, sort_order);

-- =========================================================================
-- BANNIÈRES / PUBLICITÉS
-- =========================================================================
create table if not exists public.banners (
    id          uuid primary key default gen_random_uuid(),
    title       text not null,
    subtitle    text,
    image_url   text,
    link_url    text,
    cta_label   text,
    position    text not null default 'home_hero'
                check (position in ('home_hero','home_mid','catalogue_top','header_strip')),
    sort_order  int  not null default 0,
    is_active   boolean not null default true,
    starts_at   timestamptz,
    ends_at     timestamptz,
    created_at  timestamptz not null default now()
);

create index if not exists banners_position_idx on public.banners(position, is_active, sort_order);

-- =========================================================================
-- CODES PROMO
-- =========================================================================
create table if not exists public.promotions (
    id              uuid primary key default gen_random_uuid(),
    code            text unique not null,
    description     text,
    discount_type   text not null check (discount_type in ('percent','amount')),
    discount_value  int  not null check (discount_value >= 0),
    min_order       int  not null default 0,
    max_uses        int,
    used_count      int  not null default 0,
    starts_at       timestamptz,
    ends_at         timestamptz,
    is_active       boolean not null default true,
    created_at      timestamptz not null default now()
);

create index if not exists promotions_code_idx on public.promotions(code);
create index if not exists promotions_active_idx on public.promotions(is_active);

-- =========================================================================
-- Colonnes promo sur les commandes
-- =========================================================================
alter table public.orders add column if not exists promo_code text;
alter table public.orders add column if not exists discount_amount int not null default 0;

-- =========================================================================
-- AVIS PRODUITS
-- =========================================================================
create table if not exists public.product_reviews (
    id                   uuid primary key default gen_random_uuid(),
    product_id           uuid not null references public.products(id) on delete cascade,
    user_id              uuid references public.users(id) on delete set null,
    author_name          text not null,
    rating               int not null check (rating between 1 and 5),
    comment              text,
    is_verified_purchase boolean not null default false,
    is_approved          boolean not null default true,
    created_at           timestamptz not null default now()
);

create unique index if not exists product_reviews_user_product_uq
  on public.product_reviews(user_id, product_id)
  where user_id is not null;
create index if not exists product_reviews_product_idx
  on public.product_reviews(product_id, is_approved, created_at desc);
