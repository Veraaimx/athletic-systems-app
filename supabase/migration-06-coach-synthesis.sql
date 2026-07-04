-- Athletic Systems Training — schema v6: coach synthesis (hallazgos y recomendaciones)
-- Run this in the Supabase SQL Editor after migration-05.

create table if not exists coach_synthesis (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  period_start date not null,
  period_end date not null,
  findings jsonb not null,
  recommendations jsonb not null
);

create index if not exists coach_synthesis_created_at_idx on coach_synthesis(created_at);
