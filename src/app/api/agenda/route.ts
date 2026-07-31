import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { todayISO } from "@/lib/dates";
import { blockDates, resolveDay, type DayAdjustment, type BlockWeek } from "@/lib/blockPlan";

/**
 * Everything the agenda screen needs, in one round trip: the block's 28 days
 * with the plan, the athlete's day adjustments, and the state of each day's
 * session already layered on top.
 *
 * The plan/adjustment resolution lives on the server so `/block`, `/session`
 * and `/api/stats` all agree on what a given date means — three copies of that
 * logic would drift the first time a rule changes.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: block, error } = await supabase
    .from("blocks")
    .select("id, start_date, focus_notes, raw_plan")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!block) return NextResponse.json({ block: null, days: [] });

  const [{ data: sessionRows }, { data: adjustmentRows }] = await Promise.all([
    supabase.from("sessions").select("id, date, type, title, status").eq("block_id", block.id),
    supabase.from("day_adjustments").select("id, date, kind, moved_to_date, note").eq("block_id", block.id),
  ]);

  const adjustments: DayAdjustment[] = (adjustmentRows ?? []).map((a) => ({
    id: a.id,
    date: a.date,
    kind: a.kind,
    moved_to_date: a.moved_to_date ?? null,
    note: a.note ?? null,
  }));

  // Latest row wins if a date somehow has more than one — same rule the day
  // route uses when it reads a session back.
  const sessionByDate = new Map<string, { id: string; type: string; title: string | null; status: string }>();
  for (const s of sessionRows ?? []) sessionByDate.set(s.date, s);

  const weekLabels = new Map<number, string>(
    ((block.raw_plan?.weeks ?? []) as BlockWeek[]).map((w) => [w.week_number, w.label])
  );

  const today = todayISO();
  const days = blockDates(block.start_date).map((date) => {
    const resolved = resolveDay(date, block.start_date, block.raw_plan, adjustments);
    const session = sessionByDate.get(date) ?? null;
    return {
      date,
      dayOffset: resolved.dayOffset,
      weekNumber: resolved.weekNumber,
      weekLabel: weekLabels.get(resolved.weekNumber) ?? "",
      isToday: date === today,
      isPast: date < today,
      isFuture: date > today,
      type: resolved.isRestDay ? "descanso" : resolved.plannedDay?.type ?? null,
      summary: resolved.isRestDay
        ? resolved.plannedDay?.type === "descanso"
          ? resolved.plannedDay.summary
          : "Domingo — descanso completo. Sin entrenamiento programado."
        : resolved.plannedDay?.summary ?? null,
      isRestDay: resolved.isRestDay,
      movedFromDate: resolved.movedFromDate,
      movedToDate: resolved.movedToDate,
      adjustment: resolved.adjustment,
      sessionId: session?.id ?? null,
      sessionTitle: session?.title ?? null,
      // "sin_generar" only means something for a day that already happened —
      // a future day isn't late, it just hasn't arrived.
      sessionStatus: session?.status ?? null,
    };
  });

  return NextResponse.json({
    block: { id: block.id, start_date: block.start_date, focus_notes: block.focus_notes },
    today,
    days,
  });
}
