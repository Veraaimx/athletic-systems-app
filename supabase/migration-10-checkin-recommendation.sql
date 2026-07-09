-- Athletic Systems Training — schema v10: recomendación visible del check-in
-- Run this in the Supabase SQL Editor after migration-09.
--
-- El check-in del día (energía, sueño, dolor, contexto) deja de ajustar
-- automáticamente el volumen/intensidad de la sesión generada; en vez de eso
-- alimenta una recomendación del coach, visible por separado, que el atleta
-- decide si aplicar.

alter table sessions add column if not exists coach_recommendation text;
