-- Athletic Systems Training — schema v8: duración de programa sugerida por meta
-- Run this in the Supabase SQL Editor after migration-07.

alter table athlete_goals add column if not exists suggested_program_weeks int
  check (suggested_program_weeks in (4, 8, 12));
alter table athlete_goals add column if not exists program_weeks_reasoning text;
