-- Athletic Systems Training — schema v1
-- Run this in the Supabase SQL Editor (Project > SQL Editor > New query).

create table if not exists athlete_profile (
  id uuid primary key default gen_random_uuid(),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists blocks (
  id uuid primary key default gen_random_uuid(),
  start_date date not null,
  status text not null default 'active' check (status in ('active', 'closed')),
  focus_notes text,
  raw_plan jsonb,
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  block_id uuid references blocks(id) on delete cascade,
  date date not null,
  week_number int not null check (week_number between 1 and 4),
  type text not null check (type in ('fuerza', 'running', 'yoga', 'otro')),
  planned_exercises jsonb not null,
  status text not null default 'planned'
    check (status in ('planned', 'completed', 'skipped', 'modified')),
  justification text,
  created_at timestamptz not null default now()
);

create table if not exists session_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  rpe int check (rpe between 1 and 10),
  pain_flags jsonb,
  sleep_hours numeric,
  readiness_notes text,
  actual_performance jsonb,
  created_at timestamptz not null default now()
);

create index if not exists sessions_block_id_idx on sessions(block_id);
create index if not exists sessions_date_idx on sessions(date);
create index if not exists session_logs_session_id_idx on session_logs(session_id);

-- RLS disabled intentionally: single-user app accessed only via service_role key
-- from server-side API routes. Do not expose these tables to the anon/public key.
