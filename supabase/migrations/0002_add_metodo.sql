-- Agrega el "tipo/método" de pago a las transacciones
-- (BCP, Interbank, BBVA, Yape, ...). La descripción reutiliza `comercio`.
alter table public.transactions
  add column if not exists metodo text;
