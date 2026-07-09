import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

const PERIOD_DAYS: Record<string, number> = { day: 1, week: 7, month: 30 };

function cutoffISO(period: string): string {
  const days = PERIOD_DAYS[period] ?? PERIOD_DAYS.week;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function maxWeightOf(sets: Array<{ weight: number }>): number {
  return sets.reduce((max, s) => (s.weight > max ? s.weight : max), 0);
}

function monthOverMonth(
  entries: Array<{ date: string; sets: Array<{ weight: number }> }>
): { change_pct: number | null; this_month_avg: number | null; prev_month_avg: number | null } {
  const byMonth: Record<string, number[]> = {};
  for (const e of entries) {
    const month = e.date.slice(0, 7); // YYYY-MM
    if (!byMonth[month]) byMonth[month] = [];
    byMonth[month].push(maxWeightOf(e.sets));
  }
  const months = Object.keys(byMonth).sort();
  if (months.length === 0) return { change_pct: null, this_month_avg: null, prev_month_avg: null };

  const avg = (nums: number[]) => nums.reduce((a, b) => a + b, 0) / nums.length;
  const currentMonth = months[months.length - 1];
  const thisMonthAvg = avg(byMonth[currentMonth]);

  if (months.length < 2) return { change_pct: null, this_month_avg: thisMonthAvg, prev_month_avg: null };

  const prevMonth = months[months.length - 2];
  const prevMonthAvg = avg(byMonth[prevMonth]);
  const changePct = prevMonthAvg > 0 ? Math.round(((thisMonthAvg - prevMonthAvg) / prevMonthAvg) * 1000) / 10 : null;

  return { change_pct: changePct, this_month_avg: Math.round(thisMonthAvg * 10) / 10, prev_month_avg: Math.round(prevMonthAvg * 10) / 10 };
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const period = new URL(request.url).searchParams.get("period") ?? "week";
  const cutoff = cutoffISO(period);

  const [sessionsRes, logsRes, bodyRes, blockRes] = await Promise.all([
    supabase.from("sessions").select("id, date, type, status, week_number, block_id, planned_exercises"),
    supabase.from("session_logs").select("*, sessions(date, type, week_number)").order("created_at", { ascending: true }),
    supabase.from("body_metrics").select("*").order("date", { ascending: true }),
    supabase.from("blocks").select("id, start_date, status, focus_notes").eq("status", "active").maybeSingle(),
  ]);

  const sessions = sessionsRes.data ?? [];
  const logs = logsRes.data ?? [];
  const bodyMetrics = bodyRes.data ?? [];
  const activeBlock = blockRes.data;

  // Adherencia en el bloque activo
  const blockSessions = activeBlock
    ? sessions.filter((s) => s.block_id === activeBlock.id)
    : sessions;
  const total = blockSessions.length;
  const completed = blockSessions.filter((s) => s.status === "completed").length;
  const skipped = blockSessions.filter((s) => s.status === "skipped").length;
  const adherencia = total > 0 ? Math.round((completed / total) * 100) : null;

  // Tendencia RPE y sueño, filtrada por el periodo seleccionado (día/semana/mes)
  const recentLogs = logs
    .filter((l) => {
      const date = (l.sessions as { date?: string })?.date;
      return date && date >= cutoff;
    })
    .map((l) => ({
      date: (l.sessions as { date?: string })?.date ?? null,
      rpe: l.rpe,
      sleep_hours: l.sleep_hours,
      type: (l.sessions as { type?: string })?.type ?? null,
    }));

  // Progresión de cargas por ejercicio (sesiones de fuerza y el complemento de KB en yoga)
  type LoggedExercise = {
    name: string;
    done?: boolean;
    skip_reason?: string;
    unit?: "kg" | "lbs";
    sets: Array<{ reps: number; weight: number }>;
  };
  const liftProgression: Record<
    string,
    Array<{ date: string; unit?: "kg" | "lbs"; sets: Array<{ reps: number; weight: number }> }>
  > = {};
  const skippedExercises: Array<{ date: string; exercise: string; reason: string }> = [];

  for (const log of logs) {
    const perf = log.actual_performance as { exercises?: LoggedExercise[] } | null;
    if (!perf?.exercises) continue;
    const date = (log.sessions as { date?: string })?.date ?? "?";
    for (const ex of perf.exercises) {
      if (ex.done === false) {
        skippedExercises.push({ date, exercise: ex.name, reason: ex.skip_reason || "sin motivo registrado" });
        continue;
      }
      const sets = (ex.sets ?? []).filter((s) => s.weight > 0);
      if (sets.length === 0) continue;
      if (!liftProgression[ex.name]) liftProgression[ex.name] = [];
      liftProgression[ex.name].push({ date, unit: ex.unit, sets });
    }
  }

  // Benchmarks (otros tipos)
  const benchmarks: Array<{
    date: string;
    name: string;
    result: string;
    notes?: string;
  }> = [];
  for (const log of logs) {
    const perf = log.actual_performance as {
      benchmark_name?: string;
      result?: string;
      notes?: string;
    } | null;
    if (perf?.benchmark_name) {
      benchmarks.push({
        date: (log.sessions as { date?: string })?.date ?? "?",
        name: perf.benchmark_name,
        result: perf.result ?? "—",
        notes: perf.notes,
      });
    }
  }

  // % de cambio mes a mes por ejercicio (siempre con el histórico completo,
  // independiente del filtro día/semana/mes de la vista)
  const liftMonthOverMonth: Record<
    string,
    { change_pct: number | null; this_month_avg: number | null; prev_month_avg: number | null }
  > = {};
  for (const [name, entries] of Object.entries(liftProgression)) {
    liftMonthOverMonth[name] = monthOverMonth(entries);
  }

  // Tendencia de peso
  const weightTrend = bodyMetrics.map((m) => ({
    date: m.date,
    weight_kg: m.weight_kg,
    body_fat_pct: m.body_fat_pct,
  }));

  return NextResponse.json({
    period,
    activeBlock: activeBlock
      ? { id: activeBlock.id, start_date: activeBlock.start_date, focus_notes: activeBlock.focus_notes }
      : null,
    adherencia: { total, completed, skipped, pct: adherencia },
    recentLogs,
    liftProgression,
    liftMonthOverMonth,
    skippedExercises,
    benchmarks,
    weightTrend,
  });
}
