-- Table médiathèque — centralise tous les fichiers uploadés
create table if not exists public.media (
  id          uuid primary key default gen_random_uuid(),
  filename    text not null,
  url         text unique not null,
  type        text not null check (type in ('image', 'video')),
  mime_type   text,
  size_bytes  int,
  folder      text not null default 'general',
  alt         text,
  created_at  timestamptz not null default now()
);

create index if not exists media_type_idx    on public.media(type);
create index if not exists media_folder_idx  on public.media(folder);
create index if not exists media_created_idx on public.media(created_at desc);
