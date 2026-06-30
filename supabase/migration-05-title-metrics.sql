-- Athletic Systems Training — schema v5: custom session title + duration/calories
-- Run this in the Supabase SQL Editor after migration-04.

alter table sessions add column if not exists title text;
alter table session_logs add column if not exists duration_min numeric;
alter table session_logs add column if not exists calories numeric;
