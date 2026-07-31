import { addDaysISO, blockPosition, isSunday } from "@/lib/dates";

export interface BlockDaySession {
  day_offset: number;
  type: string;
  summary: string;
}

export interface BlockWeek {
  week_number: number;
  label: string;
  sessions: BlockDaySession[];
}

export interface BlockPlan {
  focus_notes: string;
  weeks: BlockWeek[];
}

export type AdjustmentKind = "movida" | "sustituida" | "saltada" | "extra";

export interface DayAdjustment {
  id?: string;
  date: string;
  kind: AdjustmentKind;
  moved_to_date: string | null;
  note: string | null;
}

export function flattenPlan(plan: BlockPlan | null | undefined): BlockDaySession[] {
  return (plan?.weeks ?? [])
    .filter((w) => Array.isArray(w?.sessions))
    .flatMap((w) => w.sessions.map((s) => ({ ...s, week_number: w.week_number })));
}

export function plannedDayAt(plan: BlockPlan | null | undefined, dayOffset: number) {
  return flattenPlan(plan).find((s) => s.day_offset === dayOffset) ?? null;
}

// Sunday is a structural rest day for this athlete — it is NOT left to whatever
// the model happened to put in `raw_plan`. Two reasons this is enforced at read
// time instead of only at generation time:
//
//   1. Blocks generated before the Sunday rule existed (before 2026-07-18) have a
//      real workout on Sunday. Enforcing here fixes them without rewriting stored
//      plans — the block's original intent stays auditable, the app just refuses
//      to serve a workout on a rest day.
//   2. `enforceWeekStructure` at generation time depends on the model returning a
//      "descanso" session. A structural rule shouldn't have a model call in its
//      critical path.
//
// This is a default, never a lock: the athlete can always override per-day from
// the UI ("entrenar de todos modos"), which records an 'extra' adjustment.
export function isStructuralRestDay(dateISO: string, plannedDay: BlockDaySession | null): boolean {
  return isSunday(dateISO) || plannedDay?.type === "descanso";
}

export interface ResolvedDay {
  date: string;
  dayOffset: number;
  weekNumber: number;
  isInsideBlock: boolean;
  /** The plan entry to actually train on this date, after applying adjustments. */
  plannedDay: BlockDaySession | null;
  /** What the block originally scheduled for this date, before adjustments. */
  originalPlannedDay: BlockDaySession | null;
  /** Set when `plannedDay` was borrowed from another date via a 'movida'. */
  movedFromDate: string | null;
  /** Set when this date's own session was moved away to another date. */
  movedToDate: string | null;
  isRestDay: boolean;
  adjustment: DayAdjustment | null;
}

/**
 * Resolves what the athlete should actually train on `dateISO`, layering the
 * day adjustments on top of the block plan.
 *
 * The plan is never mutated: a 'movida' from Thursday to Friday leaves both
 * days in `raw_plan` untouched and simply makes Friday resolve to Thursday's
 * planned session. That keeps "what was programmed" and "what was executed"
 * as two separate, comparable records — which is exactly what the next block's
 * proposal needs in order to learn the athlete's real availability.
 */
export function resolveDay(
  dateISO: string,
  blockStartISO: string,
  plan: BlockPlan | null | undefined,
  adjustments: DayAdjustment[]
): ResolvedDay {
  const { dayOffset, weekNumber, isInsideBlock } = blockPosition(blockStartISO, dateISO);
  const originalPlannedDay = plannedDayAt(plan, dayOffset);

  const ownAdjustment = adjustments.find((a) => a.date === dateISO) ?? null;
  // A session moved ONTO this date from somewhere else.
  const incoming = adjustments.find((a) => a.kind === "movida" && a.moved_to_date === dateISO) ?? null;
  // This date's own session moved AWAY to another date.
  const outgoing = ownAdjustment?.kind === "movida" ? ownAdjustment : null;

  let plannedDay = originalPlannedDay;
  let movedFromDate: string | null = null;

  if (incoming) {
    const source = blockPosition(blockStartISO, incoming.date);
    plannedDay = plannedDayAt(plan, source.dayOffset);
    movedFromDate = incoming.date;
  } else if (outgoing) {
    // Its session left; nothing scheduled here anymore.
    plannedDay = null;
  }

  // An 'extra' adjustment is the athlete explicitly overriding a rest day.
  const restByDefault = isStructuralRestDay(dateISO, plannedDay);
  const isRestDay = incoming ? false : restByDefault && ownAdjustment?.kind !== "extra";

  return {
    date: dateISO,
    dayOffset,
    weekNumber,
    isInsideBlock,
    plannedDay,
    originalPlannedDay,
    movedFromDate,
    movedToDate: outgoing?.moved_to_date ?? null,
    isRestDay,
    adjustment: ownAdjustment,
  };
}

/** Every calendar date covered by a 4-week block, in order. */
export function blockDates(blockStartISO: string): string[] {
  return Array.from({ length: 28 }, (_, i) => addDaysISO(blockStartISO, i));
}

// Rendered into the engine prompts so the coach reasons about what actually
// happened, not just what was scheduled. Without this the athlete's real
// availability is invisible: a day never trained leaves no trace anywhere.
export function adjustmentsForPrompt(adjustments: DayAdjustment[]): string {
  if (!adjustments.length) {
    return "El atleta no ha registrado ajustes de día en este periodo (el plan se siguió tal cual, o no anotó cambios).";
  }
  const lines = adjustments
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((a) => {
      const what =
        a.kind === "movida"
          ? `sesión movida a ${a.moved_to_date}`
          : a.kind === "sustituida"
          ? "entrenó, pero algo distinto a lo programado"
          : a.kind === "saltada"
          ? "no entrenó y no lo recupera"
          : "entrenó en un día que estaba marcado como descanso";
      return `- ${a.date}: ${what}${a.note ? ` — "${a.note}"` : ""}`;
    });
  return `Ajustes de día registrados por el atleta (la realidad vs. lo programado):\n${lines.join("\n")}`;
}

const SUNDAY_REST_SUMMARY =
  "Descanso completo. Sin entrenamiento programado — la adaptación pasa aquí, no solo bajo la barra.";

// Yoga is a real, non-negotiable weekly commitment (instructor-led class —
// see docs/04-athlete-profile.md) that always falls on Monday and Wednesday,
// regardless of which real weekday the block happens to start on. Sunday is the
// athlete's full rest day, equally non-negotiable. The model reasons about a
// Mon-Sun template but is never told today's actual weekday, so the `day_offset`
// values it proposes can land on any real day. Rather than rely on prompting
// alone for hard constraints, enforce them deterministically: walk each week's
// 7 real calendar days and slot yoga into whichever land on Monday/Wednesday and
// rest onto Sunday, filling the rest with the model's other sessions in their
// original relative order.
//
// Sunday is protected, not merely preferred. An earlier version fell back to
// "put whatever is left here" when the model returned no `descanso` session,
// which silently produced Monday-through-Sunday blocks. Now a missing rest day
// is synthesized and any surplus session is dropped: a 7th session the athlete
// was never going to do is worse than a 6-session week.
export function enforceWeekStructure(plan: BlockPlan, startDateISO: string) {
  const startDow = new Date(startDateISO + "T00:00:00Z").getUTCDay(); // 0=Sun..6=Sat

  for (const week of plan.weeks) {
    if (!Array.isArray(week?.sessions)) continue; // malformed week from the model — skip rather than crash
    const weekStart = (week.week_number - 1) * 7 + 1;
    const sorted = [...week.sessions].sort((a, b) => a.day_offset - b.day_offset);
    const yoga = sorted.filter((s) => s.type === "yoga");
    const rest = sorted.filter((s) => s.type === "descanso");
    const other = sorted.filter((s) => s.type !== "yoga" && s.type !== "descanso");
    const rebuilt: typeof week.sessions = [];

    for (let i = 0; i < 7; i++) {
      const dayOffset = weekStart + i;
      const dow = (startDow + (dayOffset - 1)) % 7;
      const isYogaDay = dow === 1 || dow === 3; // Monday or Wednesday
      const isRestDay = dow === 0; // Sunday — explicit full rest day

      if (isRestDay) {
        // Always rest, whatever the model proposed. Synthesize the entry if it
        // didn't return one so the day is explicit in the plan instead of a hole.
        rebuilt.push(
          rest.length
            ? { ...rest.shift()!, day_offset: dayOffset }
            : { day_offset: dayOffset, type: "descanso", summary: SUNDAY_REST_SUMMARY }
        );
        continue;
      }
      if (isYogaDay && yoga.length) {
        rebuilt.push({ ...yoga.shift()!, day_offset: dayOffset });
      } else if (other.length) {
        rebuilt.push({ ...other.shift()!, day_offset: dayOffset });
      } else if (yoga.length) {
        rebuilt.push({ ...yoga.shift()!, day_offset: dayOffset });
      }
      // Nothing left to place → the day stays free. Better an empty slot than
      // borrowing from Sunday.
    }
    week.sessions = rebuilt;
  }
}
