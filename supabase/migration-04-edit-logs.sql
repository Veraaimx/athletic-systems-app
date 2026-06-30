-- Athletic Systems Training — schema v4: allow editing a session log
-- Run this in the Supabase SQL Editor after migration-03.

-- One log per session — enables upsert-on-edit instead of duplicate rows.
alter table session_logs add constraint session_logs_session_id_unique unique (session_id);
