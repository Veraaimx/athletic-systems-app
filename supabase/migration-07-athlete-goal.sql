-- Athletic Systems Training — schema v7: meta vigente del atleta (goal-setting)
-- Run this in the Supabase SQL Editor after migration-06.

create table if not exists athlete_goals (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft' check (status in ('draft', 'active', 'closed')),
  goal_text text,
  conversation jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists athlete_goals_status_idx on athlete_goals(status);
