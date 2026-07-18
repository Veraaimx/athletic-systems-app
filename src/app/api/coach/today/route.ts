import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { askEngine, parseJsonResponse } from "@/lib/claude";
import { todayISO } from "@/lib/dates";

interface PlannedExercise {
  name: string;
  measure?: "reps" | "time" | "distance";
  load_type?: "weighted" | "bodyweight" | "band";
  sets?: number;
  reps?: string;
  time_seconds?: number;
  distance_m?: number;
  rest_seconds?: number;
  notes?: string;
}

interface PlannedSession {
  type: "fuerza" | "running" | "yoga" | "otro" | "atletico";
  week_number: number;
  exercises: PlannedExercise[];
  justification: string;
  checkin_recommendation: string | null;
}

interface CheckIn {
  energy: number; // 1-5
  sleep_hours: number;
  soreness_pain: string;
  special_context: string;
}

// The check-in is informational, not a lever on the generated session: it never
// changes volume/intensity/exercise selection by itself (that stays driven by the
// block plan + the real logs of the last 14 days). Instead it feeds a separate,
// visible "checkin_recommendation" the athlete can choose to act on.
function checkinBlock(checkin: CheckIn | null): string {
  if (!checkin) return "El atleta no llenó el check-in de hoy — usa el historial reciente como referencia.";
  return `
Check-in de HOY que el atleta acaba de llenar (informativo — ver regla abajo):
- Energía hoy (1-5, 1=muy bajo): ${checkin.energy}
- Horas de sueño anoche: ${checkin.sleep_hours}
- Dolor/molestias ahora mismo: ${checkin.soreness_pain || "ninguna reportada"}
- Contexto especial de hoy (tiempo disponible, eventos, etc.): ${checkin.special_context || "ninguno"}

REGLA — no uses este check-in de hoy para subir, mantener o bajar automáticamente el volumen,
intensidad o selección de ejercicios de la sesión: eso lo sigue definiendo el plan del bloque activo,
ajustado solo por lo que el HISTORIAL de logs recientes (rendimiento real, no una sola variable del día)
indique que hace falta. En vez de eso, usa el check-in de hoy para escribir "checkin_recommendation":
una recomendación breve, específica y accionable para el atleta (ej. bajar el peso puntualmente en sus
series, poner atención extra a la técnica, priorizar dormir esta noche, vigilar una molestia concreta,
o ninguna si el check-in no amerita una) que el atleta decide si aplicar — nunca la apliques tú a los
ejercicios planeados. Si el check-in no tiene nada que amerite recomendación, responde null en ese campo.
`.trim();
}

interface BlockDaySession {
  day_offset: number;
  type: string;
  summary: string;
}

interface BlockWeek {
  week_number: number;
  label: string;
  sessions: BlockDaySession[];
}

// Yoga is instructor-led at the gym — the engine doesn't script the class itself,
// it just registers that it happened (or not) for fatigue/mobility context.
function yogaPlaceholderExercise(daySummary: string | undefined): PlannedSession["exercises"][number] {
  return {
    name: "Clase de yoga con instructora",
    notes:
      daySummary ??
      "Sesión guiada en el gimnasio. El motor no programa el contenido; solo la registra como recuperación activa/movilidad para efectos de fatiga del bloque.",
  };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const today = todayISO();
  const body = await request.json().catch(() => ({}));
  const checkin: CheckIn | null = body?.checkin ?? null;

  const { data: block } = await supabase
    .from("blocks")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!block) {
    return NextResponse.json(
      { error: "No hay un bloque activo. Genera uno primero en /block." },
      { status: 400 }
    );
  }

  const { data: profile } = await supabase
    .from("athlete_profile")
    .select("data")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const { data: recentLogs } = await supabase
    .from("session_logs")
    .select("*, sessions(date, type, week_number, planned_exercises)")
    .gte("created_at", twoWeeksAgo)
    .order("created_at", { ascending: false });

  // Diff two date-only strings (both parsed as UTC midnight) so this is immune
  // to server timezone — only `today` (already in the athlete's timezone) matters.
  const daysIntoBlock = Math.floor(
    (Date.parse(today) - Date.parse(block.start_date)) / (24 * 60 * 60 * 1000)
  );
  const dayOffset = daysIntoBlock + 1;
  const weekNumber = Math.min(4, Math.floor(daysIntoBlock / 7) + 1);

  const weeks: BlockWeek[] = block.raw_plan?.weeks ?? [];
  const plannedDay = weeks
    .flatMap((w) => w.sessions.map((s) => ({ ...s, week_number: w.week_number })))
    .find((s) => s.day_offset === dayOffset);

  let planned: PlannedSession;

  if (plannedDay?.type === "yoga") {
    // Yoga itself is instructor-led — never scripted. But every yoga day also
    // gets a short Kettlebell Flow / mobility-strength-endurance complement
    // generated by the engine (athlete request: standing structural rule, not
    // a one-off — covers both "went to class, want more" and "missed class").
    const prompt = `
Hoy (${today}, día ${dayOffset}, semana ${plannedDay.week_number}) es un día de yoga con instructora
según el bloque activo: ${plannedDay.summary}

La yoga NO se programa (es instructor-led). Genera SOLO un complemento corto de Kettlebell Flow /
movilidad-fuerza-resistencia de 15-25 minutos para este mismo día. Es un complemento de baja-media
fatiga (no debe competir con los días de fuerza pesada), enfocado en desarrollar capacidad atlética:
coordinación, control corporal, movilidad, resistencia, fuerza ligera. Prioriza movimientos de la
progresión de kettlebell que el atleta quiere desarrollar (Turkish Get-Up, carries, flows, windmills,
etc. según su nivel — empieza simple si es de las primeras veces) y sus áreas de debilidad (tobillos,
unilateral, core). Funciona también como el entrenamiento principal del día si el atleta se pierde la
clase de yoga.

${checkinBlock(checkin)}

Perfil del atleta (JSON):
${JSON.stringify(profile?.data ?? {}, null, 2)}

Logs de los últimos 14 días (RPE, dolor, sueño, rendimiento real):
${JSON.stringify(recentLogs ?? [], null, 2)}

Para cada ejercicio indica también el tiempo de descanso entre series (rest_seconds) y la forma en que
se mide (measure: "reps" para repeticiones, "time" para tiempo sostenido como planchas/holds, "distance"
para carries/desplazamientos). Usa el campo correspondiente a esa medida (reps, time_seconds o
distance_m) y omite los otros dos.

Indica también load_type según cómo se resiste el ejercicio — esto determina si la app le pide al
atleta un peso o no al registrar:
- "weighted": barra, mancuerna, kettlebell, máquina — el atleta registra el peso de trabajo.
- "bodyweight": el cuerpo es la resistencia principal (pull-up, push-up, dip, plancha) — la app no pide
  peso por defecto; solo permite registrar peso EXTRA opcional (cinto, chaleco, mancuerna colgada).
- "band": banda elástica u otra resistencia no cuantificable en kg/lbs (band pull-apart, band rotation,
  band-resisted row) — la app no pide ningún peso, solo reps/tiempo/distancia.

El campo "name" de cada ejercicio va siempre en su término original en inglés (ej. "Back Squat",
"Turkish Get-Up"), nunca traducido al español — el resto de los campos (notes, justification) sí va
en español.

Responde SOLO con un JSON con esta forma exacta (3-5 ejercicios):
{
  "exercises": [{
    "name": string,
    "sets": number,
    "measure": "reps" | "time" | "distance",
    "load_type": "weighted" | "bodyweight" | "band",
    "reps": string,
    "time_seconds": number,
    "distance_m": number,
    "rest_seconds": number,
    "notes": string
  }],
  "justification": string,
  "checkin_recommendation": string | null
}
`.trim();

    let kbFlow: {
      exercises: PlannedSession["exercises"];
      justification: string;
      checkin_recommendation: string | null;
    };
    try {
      // Default 4096 max_tokens truncated responses once session detail grew
      // (same failure mode already fixed in new-block) — give real headroom.
      const raw = await askEngine(prompt, 8000);
      kbFlow = parseJsonResponse(raw);
      if (!kbFlow?.exercises?.length) throw new Error("La respuesta no incluyó ejercicios.");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        { error: `No se pudo generar el complemento del día — respuesta inválida o incompleta del modelo (${message}). Intenta de nuevo.` },
        { status: 502 }
      );
    }

    planned = {
      type: "yoga",
      week_number: plannedDay.week_number,
      exercises: [yogaPlaceholderExercise(plannedDay.summary), ...kbFlow.exercises],
      justification: `Día de yoga con instructora (no se programa). Complemento de Kettlebell Flow generado para hoy: ${kbFlow.justification}`,
      checkin_recommendation: kbFlow.checkin_recommendation ?? null,
    };
  } else {
    // Friday with no planned session → athletic/conditioning day (structural rule).
    const isFriday = new Date(today + "T12:00:00Z").getUTCDay() === 5;
    const isAthleticDay = !plannedDay && isFriday;

    const sessionContext = isAthleticDay
      ? `Hoy (${today}, día ${dayOffset}, semana ${weekNumber}) es VIERNES — día atlético/conditioning/flow según la estructura semanal del atleta. No hay fuerza pesada. Genera una sesión de tipo "atletico": warm up de movilidad (5-10 min) → bloque principal de 20-25 min (KB flow, movimientos atléticos, trabajo explosivo de bajo impacto, o capacidad aeróbica corta) → cooldown. RPE objetivo: 6-7.`
      : plannedDay
      ? `El bloque activo indica que hoy (día ${dayOffset}, semana ${plannedDay.week_number}) es una sesión de tipo "${plannedDay.type}": ${plannedDay.summary}`
      : `No hay un día exacto definido en el bloque para hoy; usa el contexto general del bloque y la semana ${weekNumber}.`;

    const fuerzaKbReminder =
      plannedDay?.type === "fuerza" || (!plannedDay && !isFriday)
        ? `\nREGLA ESTRUCTURAL — DÍAS DE FUERZA: toda sesión de fuerza incluye obligatoriamente un bloque final de KB conditioning (10-15 min): KB flow, EMOM, circuit corto, o carry work. Nunca omitir. En semana de deload reducir a 1-2 movimientos ligeros.\n`
        : "";

    const prompt = `
Genera la sesión de entrenamiento de HOY (${today}) para este atleta.

${sessionContext}
${fuerzaKbReminder}
${checkinBlock(checkin)}

Perfil del atleta (JSON):
${JSON.stringify(profile?.data ?? {}, null, 2)}

Bloque activo completo (inició ${block.start_date}):
${JSON.stringify(block.raw_plan ?? {}, null, 2)}

Logs de los últimos 14 días (RPE, dolor, sueño, rendimiento real):
${JSON.stringify(recentLogs ?? [], null, 2)}

Genera el detalle de ejercicios para sesiones de tipo "fuerza" y "atletico". Running puede llevar
indicaciones de ritmo/atención articular en lugar de lista de ejercicios.

Para cada ejercicio indica también el tiempo de descanso entre series (rest_seconds) y la forma en que
se mide (measure: "reps" para repeticiones, "time" para tiempo sostenido como planchas/holds, "distance"
para carries/desplazamientos). Usa el campo correspondiente a esa medida (reps, time_seconds o
distance_m) y omite los otros dos.

Indica también load_type según cómo se resiste el ejercicio — esto determina si la app le pide al
atleta un peso o no al registrar:
- "weighted": barra, mancuerna, kettlebell, máquina — el atleta registra el peso de trabajo.
- "bodyweight": el cuerpo es la resistencia principal (pull-up, push-up, dip, plancha) — la app no pide
  peso por defecto; solo permite registrar peso EXTRA opcional (cinto, chaleco, mancuerna colgada).
- "band": banda elástica u otra resistencia no cuantificable en kg/lbs (band pull-apart, band rotation,
  band-resisted row) — la app no pide ningún peso, solo reps/tiempo/distancia.

El campo "name" de cada ejercicio va siempre en su término original en inglés (ej. "Back Squat",
"Romanian Deadlift"), nunca traducido al español — el resto de los campos (notes, justification) sí
va en español.

Antes de escribir "justification", compara lo planeado en el bloque contra lo que los logs recientes
dicen que realmente pasó (RPE, notas por ejercicio, dolor, sensación reportada) y decide explícitamente
si esta sesión mantiene el plan del bloque intacto o si ajusta algo puntual (peso, volumen, ejercicio) —
di cuál de las dos y por qué, con evidencia concreta de los logs, no una frase genérica.

Responde SOLO con un JSON con esta forma exacta:
{
  "type": "fuerza" | "running" | "atletico" | "otro",
  "week_number": number,
  "exercises": [{
    "name": string,
    "sets": number,
    "measure": "reps" | "time" | "distance",
    "load_type": "weighted" | "bodyweight" | "band",
    "reps": string,
    "time_seconds": number,
    "distance_m": number,
    "rest_seconds": number,
    "notes": string
  }],
  "justification": string,
  "checkin_recommendation": string | null
}
`.trim();

    try {
      // Same headroom rationale as the KB-flow branch: the prompt now carries the
      // full (much more detailed) block plan, and detailed sessions can overflow
      // the 4096-token default, truncating the JSON mid-response.
      const raw = await askEngine(prompt, 12000);
      planned = parseJsonResponse<PlannedSession>(raw);
      if (!planned?.exercises?.length && planned?.type !== "running") {
        throw new Error("La respuesta no incluyó ejercicios.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        { error: `No se pudo generar la sesión de hoy — respuesta inválida o incompleta del modelo (${message}). Intenta de nuevo.` },
        { status: 502 }
      );
    }
  }

  // "atletico" is a semantic label from the engine; DB constraint only allows the 4 canonical types.
  const dbType = planned.type === "atletico" ? "otro" : planned.type;

  const { data: session, error } = await supabase
    .from("sessions")
    .insert({
      block_id: block.id,
      date: today,
      week_number: planned.week_number,
      type: dbType,
      title: defaultTitleFor(planned.type),
      planned_exercises: planned.exercises,
      justification: planned.justification,
      coach_recommendation: planned.checkin_recommendation ?? null,
      status: "planned",
      checkin,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(session);
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const today = todayISO();
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("date", today)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

function defaultTitleFor(type: string): string {
  switch (type) {
    case "fuerza":
      return "Fuerza del día";
    case "running":
      return "Running";
    case "yoga":
      return "Yoga + Kettlebell Flow";
    case "atletico":
      return "Día Atlético";
    default:
      return "Sesión del día";
  }
}

// Rename the day's session — purely cosmetic, doesn't affect engine logic.
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { session_id, title } = await request.json();
  if (!session_id || !title) {
    return NextResponse.json({ error: "session_id and title are required" }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("sessions")
    .update({ title })
    .eq("id", session_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
