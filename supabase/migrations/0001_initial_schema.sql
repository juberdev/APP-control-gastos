-- =============================================================
-- Esquema inicial — App de seguimiento de gastos (Perú)
-- Stack: Supabase (Postgres + Auth + RLS)
-- Fuentes de datos: correos del banco (Gmail) + Yape + manual
-- =============================================================

-- ---------- Perfiles de usuario ----------
-- Se crea automáticamente al registrarse (ver trigger al final).
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  created_at  timestamptz not null default now()
);

-- ---------- Conexión de Gmail por usuario ----------
-- Guardamos el refresh_token CIFRADO. Para producción usa Supabase Vault
-- o cifrado a nivel de columna; aquí dejamos la columna lista.
create table if not exists public.gmail_connections (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade,
  google_email       text not null,
  refresh_token_enc  text not null,           -- token cifrado, nunca en claro
  last_history_id    text,                     -- para sync incremental de Gmail
  last_synced_at     timestamptz,
  created_at         timestamptz not null default now(),
  unique (user_id, google_email)
);

-- ---------- Tarjetas (detectadas desde los correos) ----------
create table if not exists public.cards (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  banco       text not null,                   -- 'BCP', 'Interbank', ...
  last4       text not null,                   -- últimos 4 dígitos
  alias       text,                            -- nombre que le pone el usuario
  created_at  timestamptz not null default now(),
  unique (user_id, banco, last4)
);

-- ---------- Categorías de gasto ----------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  nombre      text not null,
  color       text default '#6366f1',
  created_at  timestamptz not null default now()
);

-- ---------- Transacciones ----------
create type public.txn_origen as enum ('gmail', 'yape', 'manual');

create table if not exists public.transactions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  origen        public.txn_origen not null,
  card_id       uuid references public.cards (id) on delete set null,
  category_id   uuid references public.categories (id) on delete set null,
  monto         numeric(12,2) not null,
  moneda        text not null default 'PEN',   -- PEN / USD
  comercio      text,
  fecha         timestamptz not null,
  -- Huella única para deduplicar (p.ej. el messageId de Gmail).
  dedupe_key    text,
  raw_json      jsonb,                         -- payload original para auditar
  created_at    timestamptz not null default now(),
  unique (user_id, dedupe_key)
);

create index if not exists idx_txn_user_fecha on public.transactions (user_id, fecha desc);

-- =============================================================
-- Row Level Security: cada usuario SOLO ve y toca sus filas
-- =============================================================
alter table public.profiles          enable row level security;
alter table public.gmail_connections enable row level security;
alter table public.cards             enable row level security;
alter table public.categories        enable row level security;
alter table public.transactions      enable row level security;

-- profiles
create policy "own profile - select" on public.profiles
  for select using (auth.uid() = id);
create policy "own profile - update" on public.profiles
  for update using (auth.uid() = id);

-- patrón reutilizable: dueño = user_id (select/insert/update/delete)
create policy "own rows - all" on public.cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows - all" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows - all" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- gmail_connections: el usuario puede ver/borrar su conexión, pero el
-- refresh_token lo escribe el backend (service_role salta RLS).
create policy "own gmail - select" on public.gmail_connections
  for select using (auth.uid() = user_id);
create policy "own gmail - delete" on public.gmail_connections
  for delete using (auth.uid() = user_id);

-- =============================================================
-- Trigger: crear profile al registrarse un usuario
-- =============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
