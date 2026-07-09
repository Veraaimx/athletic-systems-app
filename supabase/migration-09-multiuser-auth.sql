-- Athletic Systems Training — schema v9: multi-user auth (Supabase Auth + RLS)
-- Run this in the Supabase SQL Editor after migration-08.
--
-- ORDER MATTERS:
--   1. Sign in once at /login with your magic link (this creates your row in
--      auth.users). Do this BEFORE running this script.
--   2. Then run this whole script in one go.
--
-- What this does: adds a user_id column to every athlete-owned table, backfills
-- all existing rows (created before multi-user existed) to your account, then
-- locks the tables down with Row Level Security so each user can only ever see
-- their own data.
--
-- Note: body_metrics and coach_synthesis are not explicitly named in the
-- session's entregable (which listed sessions/blocks/logs/profile/goal), but
-- both hold per-athlete data surfaced through /api/stats and /api/coach/synthesis
-- — leaving them un-isolated would leak one user's weight history and AI-generated
-- synthesis to every other user. Included here for that reason.

-- Guard: abort with a clear message instead of a cryptic NOT NULL failure below
-- if you haven't signed in yet.
do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = 'ja.sarmientocampos@gmail.com';
  if v_user_id is null then
    raise exception 'No existe un usuario en auth.users con ese email todavía. Entra una vez con magic link en /login antes de correr esta migración.';
  end if;
end $$;

-- ── athlete_profile ─────────────────────────────────────────────────────────
alter table athlete_profile add column if not exists user_id uuid;
update athlete_profile set user_id = (select id from auth.users where email = 'ja.sarmientocampos@gmail.com') where user_id is null;
alter table athlete_profile alter column user_id set not null;
alter table athlete_profile add constraint athlete_profile_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;
create index if not exists athlete_profile_user_id_idx on athlete_profile(user_id);
alter table athlete_profile enable row level security;
create policy "athlete_profile_select_own" on athlete_profile for select using (auth.uid() = user_id);
create policy "athlete_profile_insert_own" on athlete_profile for insert with check (auth.uid() = user_id);
create policy "athlete_profile_update_own" on athlete_profile for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "athlete_profile_delete_own" on athlete_profile for delete using (auth.uid() = user_id);

-- ── blocks ───────────────────────────────────────────────────────────────────
alter table blocks add column if not exists user_id uuid;
update blocks set user_id = (select id from auth.users where email = 'ja.sarmientocampos@gmail.com') where user_id is null;
alter table blocks alter column user_id set not null;
alter table blocks add constraint blocks_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;
create index if not exists blocks_user_id_idx on blocks(user_id);
alter table blocks enable row level security;
create policy "blocks_select_own" on blocks for select using (auth.uid() = user_id);
create policy "blocks_insert_own" on blocks for insert with check (auth.uid() = user_id);
create policy "blocks_update_own" on blocks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "blocks_delete_own" on blocks for delete using (auth.uid() = user_id);

-- ── sessions ─────────────────────────────────────────────────────────────────
alter table sessions add column if not exists user_id uuid;
update sessions set user_id = (select id from auth.users where email = 'ja.sarmientocampos@gmail.com') where user_id is null;
alter table sessions alter column user_id set not null;
alter table sessions add constraint sessions_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;
create index if not exists sessions_user_id_idx on sessions(user_id);
alter table sessions enable row level security;
create policy "sessions_select_own" on sessions for select using (auth.uid() = user_id);
create policy "sessions_insert_own" on sessions for insert with check (auth.uid() = user_id);
create policy "sessions_update_own" on sessions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sessions_delete_own" on sessions for delete using (auth.uid() = user_id);

-- ── session_logs ─────────────────────────────────────────────────────────────
alter table session_logs add column if not exists user_id uuid;
update session_logs set user_id = (select id from auth.users where email = 'ja.sarmientocampos@gmail.com') where user_id is null;
alter table session_logs alter column user_id set not null;
alter table session_logs add constraint session_logs_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;
create index if not exists session_logs_user_id_idx on session_logs(user_id);
alter table session_logs enable row level security;
create policy "session_logs_select_own" on session_logs for select using (auth.uid() = user_id);
create policy "session_logs_insert_own" on session_logs for insert with check (auth.uid() = user_id);
create policy "session_logs_update_own" on session_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "session_logs_delete_own" on session_logs for delete using (auth.uid() = user_id);

-- ── athlete_goals ────────────────────────────────────────────────────────────
alter table athlete_goals add column if not exists user_id uuid;
update athlete_goals set user_id = (select id from auth.users where email = 'ja.sarmientocampos@gmail.com') where user_id is null;
alter table athlete_goals alter column user_id set not null;
alter table athlete_goals add constraint athlete_goals_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;
create index if not exists athlete_goals_user_id_idx on athlete_goals(user_id);
alter table athlete_goals enable row level security;
create policy "athlete_goals_select_own" on athlete_goals for select using (auth.uid() = user_id);
create policy "athlete_goals_insert_own" on athlete_goals for insert with check (auth.uid() = user_id);
create policy "athlete_goals_update_own" on athlete_goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "athlete_goals_delete_own" on athlete_goals for delete using (auth.uid() = user_id);

-- ── body_metrics ─────────────────────────────────────────────────────────────
alter table body_metrics add column if not exists user_id uuid;
update body_metrics set user_id = (select id from auth.users where email = 'ja.sarmientocampos@gmail.com') where user_id is null;
alter table body_metrics alter column user_id set not null;
alter table body_metrics add constraint body_metrics_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;
create index if not exists body_metrics_user_id_idx on body_metrics(user_id);
alter table body_metrics enable row level security;
create policy "body_metrics_select_own" on body_metrics for select using (auth.uid() = user_id);
create policy "body_metrics_insert_own" on body_metrics for insert with check (auth.uid() = user_id);
create policy "body_metrics_update_own" on body_metrics for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "body_metrics_delete_own" on body_metrics for delete using (auth.uid() = user_id);

-- ── coach_synthesis ──────────────────────────────────────────────────────────
alter table coach_synthesis add column if not exists user_id uuid;
update coach_synthesis set user_id = (select id from auth.users where email = 'ja.sarmientocampos@gmail.com') where user_id is null;
alter table coach_synthesis alter column user_id set not null;
alter table coach_synthesis add constraint coach_synthesis_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;
create index if not exists coach_synthesis_user_id_idx on coach_synthesis(user_id);
alter table coach_synthesis enable row level security;
create policy "coach_synthesis_select_own" on coach_synthesis for select using (auth.uid() = user_id);
create policy "coach_synthesis_insert_own" on coach_synthesis for insert with check (auth.uid() = user_id);
create policy "coach_synthesis_update_own" on coach_synthesis for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "coach_synthesis_delete_own" on coach_synthesis for delete using (auth.uid() = user_id);

-- ── usage_tracking (new) ─────────────────────────────────────────────────────
-- Tracks per-user Anthropic API usage (the coach's LLM calls), so a future
-- billing/rate-limit layer has something to read from once the app has more
-- than one paying user. Not wired into any endpoint yet — this session only
-- lays down the table + isolation.
create table if not exists usage_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  model text,
  input_tokens int,
  output_tokens int,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index if not exists usage_tracking_user_id_idx on usage_tracking(user_id);
create index if not exists usage_tracking_created_at_idx on usage_tracking(created_at);
alter table usage_tracking enable row level security;
create policy "usage_tracking_select_own" on usage_tracking for select using (auth.uid() = user_id);
create policy "usage_tracking_insert_own" on usage_tracking for insert with check (auth.uid() = user_id);
