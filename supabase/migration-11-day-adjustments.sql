-- Athletic Systems Training — schema v11: ajustes de día (la realidad vs. el plan)
-- Run this in the Supabase SQL Editor after migration-10.
--
-- Hasta aquí la app tenía dos conceptos: el PLAN (blocks.raw_plan, la intención)
-- y la REALIDAD (rows en sessions, lo que se generó y registró). Faltaba el
-- tercero: la desviación deliberada — "el jueves no entrené fuerza, me fui a
-- correr, y hago la sesión del jueves el viernes".
--
-- Sin este concepto, un día no entrenado simplemente no existe: no genera row,
-- no baja la adherencia, y no llega al prompt del siguiente bloque. El motor
-- nunca se entera de la disponibilidad real del atleta.
--
-- Un ajuste NO modifica blocks.raw_plan. El plan del bloque queda intacto como
-- la intención original; el ajuste se superpone al leerlo. Esto mantiene la
-- programación auditable (qué se planeó) separada de la ejecución (qué pasó).

create table if not exists day_adjustments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  block_id uuid not null references blocks(id) on delete cascade,

  -- Día del calendario que se está anotando (el día cuyo plan se desvió).
  date date not null,

  -- movida:      la sesión de `date` se hace en `moved_to_date` (intercambio).
  -- sustituida:  se entrenó ese día, pero otra cosa (ej. 5k en vez de fuerza).
  -- saltada:     no se entrenó y no se recupera.
  -- extra:       se entrenó en un día que el plan marcaba como descanso.
  kind text not null check (kind in ('movida', 'sustituida', 'saltada', 'extra')),

  -- Solo para kind='movida': a qué día real se movió la sesión de `date`.
  moved_to_date date,

  -- Qué pasó realmente, en palabras del atleta. Es lo que lee el coach.
  note text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Un solo ajuste por día: volver a anotar el mismo día corrige el anterior en
-- vez de acumular versiones contradictorias que el prompt tendría que desempatar.
create unique index if not exists day_adjustments_user_date_idx
  on day_adjustments(user_id, date);
create index if not exists day_adjustments_block_id_idx on day_adjustments(block_id);
create index if not exists day_adjustments_moved_to_date_idx on day_adjustments(moved_to_date);

-- `moved_to_date` solo tiene sentido para 'movida', y una sesión no puede
-- moverse a su propio día. Se valida aquí y no solo en la API para que un
-- script o una consulta manual no puedan dejar datos que el motor no sepa leer.
alter table day_adjustments drop constraint if exists day_adjustments_moved_to_coherente;
alter table day_adjustments add constraint day_adjustments_moved_to_coherente check (
  (kind = 'movida' and moved_to_date is not null and moved_to_date <> date)
  or (kind <> 'movida' and moved_to_date is null)
);

alter table day_adjustments enable row level security;
drop policy if exists "day_adjustments_select_own" on day_adjustments;
drop policy if exists "day_adjustments_insert_own" on day_adjustments;
drop policy if exists "day_adjustments_update_own" on day_adjustments;
drop policy if exists "day_adjustments_delete_own" on day_adjustments;
create policy "day_adjustments_select_own" on day_adjustments for select using (auth.uid() = user_id);
create policy "day_adjustments_insert_own" on day_adjustments for insert with check (auth.uid() = user_id);
create policy "day_adjustments_update_own" on day_adjustments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "day_adjustments_delete_own" on day_adjustments for delete using (auth.uid() = user_id);
