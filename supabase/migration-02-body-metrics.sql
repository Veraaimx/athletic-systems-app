-- Athletic Systems Training — schema v2: body metrics
-- Run this in the Supabase SQL Editor after migration.sql.

create table if not exists body_metrics (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  weight_kg numeric not null,
  body_fat_pct numeric,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists body_metrics_date_idx on body_metrics(date);
