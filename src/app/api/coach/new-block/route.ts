import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { askEngine, parseJsonResponse } from "@/lib/claude";
import { todayISO, nextMonday } from "@/lib/dates";
import { adjustmentsForPrompt, enforceWeekStructure, type BlockPlan } from "@/lib/blockPlan";

interface SessionLogRow {
  rpe: number | null;
  pain_flags: unknown;
  readiness_notes: string | null;
}

interface SessionHistoryRow {
  date: string;
  week_number: number;
  type: string;
  status: string;
  justification: string | null;
  session_logs: SessionLogRow[] | null;
}

// Yoga sessions are where the KB complement kept repeating the exact same
// movements block after block — even after an explicit "use more variety"
// instruction in the docs canon. The specific exercise-by-exercise prose in
// `justification` (e.g. "TGU 3x2 @16kg, Windmill 3x5 @16kg...") anchors the
// model far more strongly than an abstract vocabulary list ever could, because
// it's concrete, recent, and framed as "evidence to use for continuity."
// Strength/running sessions keep full detail — that's where real load-
// progression evidence matters. Yoga sessions are reduced to adherence/RPE/
// pain only, with the movement-by-movement text removed, so there's nothing
// left in the prompt to anchor the KB complement's exercise selection to.
function curateSessionsForPrompt(sessions: SessionHistoryRow[]): unknown[] {
  return sessions.map((s) => {
    if (s.type !== "yoga") return s;
    const logs = Array.isArray(s.session_logs) ? s.session_logs : s.session_logs ? [s.session_logs] : [];
    const rpes = logs.map((l) => l.rpe).filter((r): r is number => r != null);
    const painFlags = logs.flatMap((l) => (l.pain_flags ? [l.pain_flags] : []));
    return {
      date: s.date,
      week_number: s.week_number,
      type: s.type,
      status: s.status,
      summary:
        `Complemento KB completado. RPE: ${rpes.length ? rpes.join(", ") : "sin registro"}.` +
        (painFlags.length ? ` Molestias reportadas: ${JSON.stringify(painFlags)}.` : "") +
        " (Detalle de movimientos omitido a propósito — ver nota en el prompt.)",
    };
  });
}

// Returns the currently active block, if any — so /block can always show the
// full 4-week plan, not just whatever proposal happened to be in memory.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: block, error } = await supabase
    .from("blocks")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(block);
}

// Generates a *proposal* for the next block. Does not activate it —
// the athlete confirms via PUT /api/coach/new-block before it goes live,
// matching the "recommendation, athlete decides" rule in the engine docs.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("athlete_profile")
    .select("data")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: lastBlock } = await supabase
    .from("blocks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: activeGoal } = await supabase
    .from("athlete_goals")
    .select("goal_text, suggested_program_weeks, program_weeks_reasoning, created_at")
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Informational only — lets the engine mention where this block sits within
  // the goal's suggested horizon (e.g. "bloque 2 de 2"), no rigid scheduler.
  let goalProgressNote = "";
  if (activeGoal?.suggested_program_weeks) {
    const { count } = await supabase
      .from("blocks")
      .select("id", { count: "exact", head: true })
      .gte("start_date", activeGoal.created_at.slice(0, 10));
    const totalBlocks = activeGoal.suggested_program_weeks / 4;
    const blockNumber = (count ?? 0) + 1;
    goalProgressNote = `Este sería el bloque ${blockNumber} de ~${totalBlocks} sugeridos para esta meta (duración sugerida: ${activeGoal.suggested_program_weeks} semanas — ${activeGoal.program_weeks_reasoning ?? "sin razonamiento adicional guardado"}). Es una referencia orientativa, no una cuenta rígida — ajusta según la evidencia real de progreso.`;
  }

  // What the athlete actually did vs. what was scheduled. This is the only
  // signal the engine has about real availability — a day never trained leaves
  // no session row, so without these adjustments it's invisible and the next
  // block gets planned against a week the athlete doesn't actually have.
  let adjustmentsNote = "El atleta no registró ajustes de día en el bloque anterior.";
  if (lastBlock) {
    const { data: adjustmentRows } = await supabase
      .from("day_adjustments")
      .select("date, kind, moved_to_date, note")
      .eq("block_id", lastBlock.id)
      .order("date", { ascending: true });
    adjustmentsNote = adjustmentsForPrompt(
      (adjustmentRows ?? []).map((a) => ({ ...a, moved_to_date: a.moved_to_date ?? null, note: a.note ?? null }))
    );
  }

  // Pull every real session + log from the block that's closing, so the proposal
  // is grounded in what actually happened (RPE, dolor, sueño, rendimiento real),
  // not just the plan that was originally drawn up.
  let blockHistory: unknown = "No hay bloque anterior, este es el primero.";
  if (lastBlock) {
    const { data: sessionsWithLogs } = await supabase
      .from("sessions")
      .select("date, week_number, type, status, justification, session_logs(*)")
      .eq("block_id", lastBlock.id)
      .order("date", { ascending: true });
    let curatedSessions: unknown[];
    try {
      curatedSessions = curateSessionsForPrompt((sessionsWithLogs ?? []) as unknown as SessionHistoryRow[]);
    } catch {
      // Curation is a nice-to-have (removes the yoga anchor bias) — if the data
      // shape is unexpected, fall back to raw sessions rather than failing the
      // whole proposal over it.
      curatedSessions = sessionsWithLogs ?? [];
    }
    blockHistory = {
      focus_notes: lastBlock.focus_notes,
      sessions: curatedSessions,
    };
  }

  // Blocks always start on Monday — keeps "Semana N" as a clean Mon-Sun calendar
  // week instead of a partial week anchored to whatever day it's activated on.
  const assumedStartDate = nextMonday(todayISO());

  const prompt = `
Genera la propuesta del SIGUIENTE bloque de 4 semanas para este atleta.

El bloque arranca el ${assumedStartDate} (lunes). "day_offset: 1" de la
Semana 1 corresponde a ese lunes. Nota:
el día exacto en que caen las sesiones de yoga se corrige automáticamente después
de tu respuesta (siempre caen en lunes/miércoles reales, sin importar qué day_offset
les asignes), así que no necesitas hacer ese cálculo de calendario tú mismo — solo
incluye 2 sesiones de yoga por semana en el orden que tengan sentido dentro de tu plan.
Incluye también 1 sesión type "descanso" por semana (cae automáticamente en domingo):
su summary es breve — descanso completo, sin entrenamiento programado. El domingo es
descanso innegociable: nunca propongas 7 días de entrenamiento en una semana. Marca además
1-2 sesiones de la semana como flexibles en su summary (candidatas a saltarse sin
penalidad si la semana real solo da para 4-5 días — la disponibilidad real del atleta).

Perfil del atleta (JSON):
${JSON.stringify(profile?.data ?? {}, null, 2)}

${activeGoal?.goal_text ? `Meta vigente del atleta (concreta el ciclo actual, no reemplaza los objetivos de vida del perfil): ${activeGoal.goal_text}\n` : "No hay una meta vigente declarada — usa los objetivos de vida del perfil como referencia.\n"}
${goalProgressNote}

Bloque anterior: lo que se planificó, lo que realmente se hizo, y los logs reales
(RPE, dolor, sueño, rendimiento) de cada sesión registrada. Usa esto como evidencia
real para decidir progresión, mantenimiento o regresión de carga — no asumas que el
bloque anterior salió como se planeó si los logs dicen lo contrario:
${JSON.stringify(blockHistory, null, 2)}

${adjustmentsNote}

Los ajustes de arriba son la disponibilidad REAL del atleta, no una falla de adherencia que haya que
regañar. Léelos como patrón, no como incidentes: si un mismo día de la semana aparece repetidamente
movido, sustituido o saltado, ese día no existe en su vida real — reacomoda el plan alrededor de eso
(menos días, o el trabajo pesado en los días que sí sostiene) en vez de reprogramar lo mismo esperando
un resultado distinto. Si el atleta sustituyó sesiones por correr, cuenta esa carga como carga real al
decidir volumen y recuperación. Menciona en "focus_notes" cualquier cambio de estructura que hagas por
esta razón.

Nota sobre las sesiones de yoga en el historial de arriba: el detalle
movimiento-por-movimiento del complemento KB fue omitido a propósito, no es un
error de datos. Los días de yoga son de baja fatiga sistémica (movilidad/
respiración, no un WOD) y son el lugar más seguro del bloque para introducir
vocabulario nuevo del banco de movimiento — no compites por recuperación con
nada ahí. No repitas por inercia los mismos movimientos KB de bloques
anteriores en estos días: usa esta oportunidad para explorar categorías del
banco poco usadas, en especial rotación de torso y core/control lumbar (la
prioridad #1 declarada del atleta es estabilidad lumbar). La cuota mínima de
variedad del bloque (3-4 movimientos nuevos, ver metodología) debe cumplirse
principalmente aquí, no solo en el conditioning de fuerza/atlético.

Antes de fijar la Semana 1, sigue la sección "Cuándo la Semana 1 no es Reentrada" de
tu metodología de programación: evalúa con la evidencia de arriba (adherencia, dolor
pendiente, tendencia de RPE, experiencia del atleta) Y con la meta vigente si existe
(si la meta pide maximizar algo concreto en este ciclo, eso pesa a favor de saltar
Reentrada cuando el resto de la evidencia lo permite) si la Semana 1 debe ser
Reentrada o si hay evidencia suficiente para proponer que empiece en nivel de Carga.
Cualquiera que sea tu decisión, explica en "focus_notes" la evidencia concreta que la
sostiene — esto se le muestra al atleta como propuesta antes de que decida activarla.
Sé concreto y conciso (máximo ~200 palabras): evidencia y decisión, no un ensayo — el
resto del presupuesto de la respuesta es para las 4 semanas completas de sesiones.

Responde SOLO con un JSON con esta forma exacta:
{
  "focus_notes": string,
  "weeks": [
    {
      "week_number": 1,
      "label": "Reentrada" | "Carga" | "Intensificación" | "Deload Inteligente",
      "sessions": [{ "day_offset": number, "type": "fuerza"|"running"|"yoga"|"descanso", "summary": string }]
    }
  ]
}
`.trim();

  let plan: BlockPlan;
  try {
    // 4 semanas completas con sesiones muy detalladas (sets, pesos, rehab por
    // ejercicio) pueden acercarse o superar el límite anterior de 16000 tokens,
    // truncando el JSON a la mitad — 32000 da margen real.
    const raw = await askEngine(prompt, 32000);
    plan = parseJsonResponse<BlockPlan>(raw);
    if (!plan?.weeks?.length) {
      throw new Error("La respuesta no incluyó las semanas del bloque.");
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `No se pudo generar la propuesta — respuesta inválida o incompleta del modelo (${message}). Intenta de nuevo.` },
      { status: 502 }
    );
  }

  try {
    enforceWeekStructure(plan, assumedStartDate);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `No se pudo generar la propuesta — error ajustando la estructura de la semana (${message}). Intenta de nuevo.` },
      { status: 500 }
    );
  }

  // Returned as a proposal, NOT inserted into `blocks` yet.
  return NextResponse.json({ proposal: plan, assumedStartDate });
}

// Activates a confirmed block proposal: closes the current active block (if any)
// and creates the new one starting today.
export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { proposal } = await request.json();
  const startDate = nextMonday(todayISO());
  // Re-run in case the proposal was generated on a different day than it's being
  // activated on — keeps yoga on real Monday/Wednesday and Sunday on rest either way.
  enforceWeekStructure(proposal, startDate);

  await supabase.from("blocks").update({ status: "closed" }).eq("status", "active");

  const { data: block, error } = await supabase
    .from("blocks")
    .insert({
      start_date: startDate,
      status: "active",
      focus_notes: proposal.focus_notes,
      raw_plan: proposal,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(block);
}
