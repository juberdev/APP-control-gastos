-- =============================================================
-- Catálogos mantenibles: Tipos (formas de pago) y Personas
-- (nombres asociados a un gasto). Cada usuario gestiona los suyos.
-- =============================================================

create table if not exists public.tipos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  nombre      text not null,
  created_at  timestamptz not null default now(),
  unique (user_id, nombre)
);

create table if not exists public.personas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  nombre      text not null,
  created_at  timestamptz not null default now(),
  unique (user_id, nombre)
);

-- Nombre de la persona asociada al gasto (denormalizado, como `metodo`).
alter table public.transactions
  add column if not exists persona text;

-- ---------- Row Level Security: cada usuario solo ve/toca lo suyo ----------
alter table public.tipos    enable row level security;
alter table public.personas enable row level security;

create policy "own rows - all" on public.tipos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows - all" on public.personas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
