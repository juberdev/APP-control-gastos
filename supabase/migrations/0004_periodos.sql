-- =============================================================
-- Periodos: el usuario "apertura" un periodo (fecha inicio) y lo
-- "cierra" (fecha fin). Los gastos registrados mientras está abierto
-- quedan asociados a ese periodo.
-- =============================================================

create table if not exists public.periodos (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  nombre        text,
  fecha_inicio  date not null default current_date,
  fecha_fin     date,                                   -- null mientras está abierto
  estado        text not null default 'abierto',        -- 'abierto' | 'cerrado'
  created_at    timestamptz not null default now()
);

-- Solo puede haber UN periodo abierto por usuario a la vez.
create unique index if not exists idx_periodo_abierto_unico
  on public.periodos (user_id)
  where (estado = 'abierto');

-- Cada gasto puede pertenecer a un periodo.
alter table public.transactions
  add column if not exists periodo_id uuid references public.periodos (id) on delete set null;

-- ---------- Row Level Security ----------
alter table public.periodos enable row level security;

create policy "own rows - all" on public.periodos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
