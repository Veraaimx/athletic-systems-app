-- Athletic Systems Training — schema v3: pre-session check-in
-- Run this in the Supabase SQL Editor after migration-02.

alter table sessions add column if not exists checkin jsonb;
