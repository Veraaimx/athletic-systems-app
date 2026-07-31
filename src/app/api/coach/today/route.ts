import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { askEngine, parseJsonResponse } from "@/lib/claude";
import { todayISO, isValidISODate, addDaysISO, weekdayName, dayOfWeek } from "@/lib/dates";
import {
  resolveDay,
  adjustmentsForPrompt,
  type DayAdjustment,
  type ResolvedDay,
} from "@/lib/blockPlan";

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

// Generating a session for a day other than today is a deliberate catch-up (the
// athlete missed Thursday and is doing it Friday), so the prompt has to say so —
// otherwise the model reasons as if the date were today and mis-frames recovery,
// weekday-specific work, and its own justification.
function catchUpBlock(resolved: ResolvedDay, targetDate: string, today: string): string {
  const parts: string[] = [];
  if (targetDate !== today) {
    parts.push(
      `NOTA: esta sesión corresponde al ${weekdayName(targetDate)} ${targetDate}, pero se está generando el ${today} — el atleta la está recuperando fuera de su día original. Tómalo en cuenta para la recuperación (qué entrenó realmente en los días intermedios, según los logs y los ajustes de abajo), no para cambiar el contenido programado del día.`
    );
  }
  if (resolved.movedFromDate) {
    parts.push(
      `El atleta movió a propósito la sesión del ${resolved.movedFromDate} a este día (${targetDate}). Genera la sesión que le tocaba el ${resolved.movedFromDate}, no la que el calendario marcaba para hoy.`
    );
  }
  return parts.join("\n");
}

interface BlockDaySessionRef {
  day_offset: number;
  type: string;
  summary: string;
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

// Shared by POST and GET: resolves which date the caller is asking about and
// checks it's one we're willing to serve.
function resolveTargetDate(raw: unknown): { date: string } | { error: string; status: number } {
  const today = todayISO();
  if (raw == null || raw === "") return { date: today };
  if (!isValidISODate(raw)) {
    return { error: "Fecha inválida — usa el formato YYYY-MM-DD.", status: 400 };
  }
  // Future days are deliberately not generatable. The engine calibrates on the
  // logs of the last 14 days, so generating next Tuesday today would bake in
  // stale evidence and then present it as the plan. Upcoming days stay visible
  // as the block's summary in /block, which is the right level of detail for
  // something that hasn't happened yet.
  if (raw > today) {
    return {
      error: "Todavía no puedes generar una sesión a futuro — el coach la arma con tus registros más recientes. Puedes ver el resumen del día en Workouts.",
      status: 400,
    };
  }
  return { date: raw };
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
  // Explicit opt-in to train on a structural rest day. Recorded as an 'extra'
  // adjustment by the client so the coach sees it in the next block.
  const force: boolean = body?.force === true;

  const target = resolveTargetDate(body?.date);
  if ("error" in target) {
    return NextResponse.json({ error: target.error }, { status: target.status });
  }
  const targetDate = target.date;

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

  // Idempotent: a date that already has a session returns it instead of burning
  // another engine call and leaving a duplicate row that shadows the first.
  const { data: existing } = await supabase
    .from("sessions")
    .select("*")
    .eq("date", targetDate)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existing) return NextResponse.json(existing);

  const { data: adjustmentRows } = await supabase
    .from("day_adjustments")
    .select("id, date, kind, moved_to_date, note")
    .eq("block_id", block.id);
  const adjustments: DayAdjustment[] = adjustmentRows ?? [];

  const resolved = resolveDay(targetDate, block.start_date, block.raw_plan, adjustments);

  if (!resolved.isInsideBlock) {
    return NextResponse.json(
      { error: `${targetDate} cae fuera del bloque activo (inició ${block.start_date}).` },
      { status: 400 }
    );
  }

  // Rest day: no engine call at all. Returning early is the whole point — the
  // previous version fell through to the generic branch and produced a full
  // workout on a day the plan marked as rest.
  if (resolved.isRestDay && !force) {
    return NextResponse.json({
      rest_day: true,
      date: targetDate,
      week_number: resolved.weekNumber,
      summary:
        resolved.plannedDay?.summary ??
        "Domingo — descanso completo. Sin entrenamiento programado.",
    });
  }

  const { data: profile } = await supabase
    .from("athlete_profile")
    .select("data")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Window starts 14 days before the session being generated rather than before
  // "now", so a catch-up looks at the training that actually preceded that day.
  // It stays open-ended at the top on purpose: when recovering Thursday on
  // Friday, what the athlete did Thursday (the 5k) is real evidence about
  // recovery and the coach should see it.
  const windowStart = addDaysISO(targetDate, -14);

  const { data: recentLogs } = await supabase
    .from("session_logs")
    .select("*, sessions(date, type, week_number, planned_exercises)")
    .gte("created_at", windowStart)
    .order("created_at", { ascending: false });

  const recentAdjustments = adjustments.filter((a) => a.date >= windowStart && a.date <= targetDate);

  const plannedDay: BlockDaySessionRef | null = resolved.plannedDay;
  const dayOffset = resolved.dayOffset;
  const weekNumber = resolved.weekNumber;
  const catchUp = catchUpBlock(resolved, targetDate, today);

  let planned: PlannedSession;

  if (plannedDay?.type === "yoga") {
    // Yoga itself is instructor-led — never scripted. But every yoga day also
    // gets a short Kettlebell Flow / mobility-strength-endurance complement
    // generated by the engine (athlete request: standing structural rule, not
    // a one-off — covers both "went to class, want more" and "missed class").
    const prompt = `
Esta sesión es del ${weekdayName(targetDate)} ${targetDate} (día ${dayOffset}, semana ${weekNumber}) — día de
yoga con instructora según el bloque activo: ${plannedDay.summary}

${catchUp}

La yoga NO se programa (es instructor-led). Genera el complemento post-clase de este mismo día,
que tiene DOS partes y un tope total de 25 minutos (ver "Yoga" en el perfil del atleta y en la
metodología de programación):

PARTE 1 — Flow KB compacto (~12 min): movilidad-fuerza-resistencia de baja-media fatiga (no compite
con los días de fuerza pesada). Toma los movimientos del "Banco de vocabulario de movimiento" de tu
metodología, priorizando las categorías de rotación de torso y core/control lumbar. NO te limites a
los movimientos que ya aparecen en los logs: los días de yoga son de baja fatiga sistémica y son el
lugar más seguro del bloque para introducir vocabulario nuevo. Si un movimiento no es de nombre
universalmente conocido, incluye en sus "notes" 1-2 líneas de cómo ejecutarlo (posición inicial →
acción → qué cuidar) — el atleta ya reportó no poder encontrar uno en video.

PARTE 2 — Hipertrofia dirigida (~10-12 min): objetivo estético secundario declarado del atleta.
Si el día es LUNES: hombros (ej. Lateral Raise, Rear Delt Fly) + tríceps. Si el día es MIÉRCOLES: pecho
(ej. Incline DB Press o push-up con carga) + bíceps. Dosis corta, 2-3 ejercicios, rango 10-15 reps —
es remate estético sobre el volumen indirecto que ya existe (OHP, push-ups, plyo), no bodybuilding.
Esta parte NO cuenta contra la cuota de "máximo 2 ejercicios de bíceps" que aplica a las sesiones
de fuerza.

El complemento completo funciona también como el entrenamiento principal del día si el atleta se
pierde la clase de yoga.

${checkinBlock(checkin)}

Perfil del atleta (JSON):
${JSON.stringify(profile?.data ?? {}, null, 2)}

Logs de los últimos 14 días (RPE, dolor, sueño, rendimiento real):
${JSON.stringify(recentLogs ?? [], null, 2)}

${adjustmentsForPrompt(recentAdjustments)}

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

Responde SOLO con un JSON con esta forma exacta (5-8 ejercicios en total entre las dos partes;
usa "notes" para indicar a qué parte pertenece cada uno):
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
      week_number: weekNumber,
      exercises: [yogaPlaceholderExercise(plannedDay.summary), ...kbFlow.exercises],
      justification: `Día de yoga con instructora (no se programa). Complemento de Kettlebell Flow generado para este día: ${kbFlow.justification}`,
      checkin_recommendation: kbFlow.checkin_recommendation ?? null,
    };
  } else {
    // Friday with no planned session → athletic/conditioning day (structural rule).
    const isFriday = dayOfWeek(targetDate) === 5;
    const isAthleticDay = !plannedDay && isFriday;

    const sessionContext = isAthleticDay
      ? `Esta sesión es del ${targetDate} (día ${dayOffset}, semana ${weekNumber}), un VIERNES — día atlético/conditioning/flow según la estructura semanal del atleta. No hay fuerza pesada. Genera una sesión de tipo "atletico": warm up de movilidad (5-10 min) → bloque principal de 20-25 min (KB flow, movimientos atléticos, trabajo explosivo de bajo impacto, o capacidad aeróbica corta) → cooldown. RPE objetivo: 6-7.`
      : plannedDay
      ? `El bloque activo indica que este día (día ${dayOffset}, semana ${weekNumber}) es una sesión de tipo "${plannedDay.type}": ${plannedDay.summary}`
      : `No hay un día exacto definido en el bloque para esta fecha; usa el contexto general del bloque y la semana ${weekNumber}.`;

    const fuerzaKbReminder =
      plannedDay?.type === "fuerza" || (!plannedDay && !isFriday)
        ? `
REGLA INNEGOCIABLE — MOVIMIENTOS ANCLA: los 5 movimientos ancla del atleta (Front Squat, Romanian
Deadlift, Bulgarian Split Squat, Pull-Up, Overhead Press) son la columna vertebral del programa y
NUNCA se omiten, sustituyen ni rotan por variedad — su consistencia es lo único que permite medir
progreso real de fuerza bloque a bloque. Día de fuerza INFERIOR: deben aparecer Front Squat,
Romanian Deadlift y Bulgarian Split Squat. Día de fuerza SUPERIOR: deben aparecer Pull-Up y
Overhead Press. Front Squat además es el principal estímulo de core bajo carga axial del atleta, y
el Bulgarian Split Squat es su fuente principal de hipertrofia de cuádriceps: eliminarlos deja dos
huecos que ningún accesorio cubre.

ORDEN DE RECORTE SI LA SESIÓN SE ALARGA: si el tiempo total no alcanza, recorta en este orden —
(1) ejercicios de warm-up, (2) accesorios secundarios, (3) tamaño del finisher de conditioning,
(4) series de los ancla. Los movimientos ancla se recortan en volumen, nunca se eliminan.

REGLA ESTRUCTURAL — DÍAS DE FUERZA: toda sesión de fuerza incluye obligatoriamente un bloque final
de KB conditioning (10-15 min): KB flow, EMOM, circuit corto, o carry work. Nunca omitir. En semana
de deload reducir a 1-2 movimientos ligeros.

REGLA DE SESIÓN — SIN EJERCICIOS REPETIDOS: antes de responder, revisa tu lista completa de
ejercicios y verifica que ningún nombre aparezca dos veces, sin importar la pieza (warm-up, bloque
principal, finisher, cooldown). Si un movimiento ya está en el warm-up, NO puede volver a aparecer
en el bloque principal ni en el conditioning: elige otro que cubra esa función. Repetir es volumen
duplicado sin propósito.

REGLA — DÍA DE FUERZA INFERIOR: cierra con 2 accesorios de hipertrofia dirigida de pierna (~5-6 min,
10-15 reps): isquio por flexión de rodilla (Leg Curl o Nordic asistido) y pantorrilla (Calf Raise,
alternando de pie/sentado entre bloques). Son de fatiga sistémica baja y cubren dos huecos reales
que los compuestos del día no tocan. No los conviertas en un bloque extenso.
`
        : "";

    const prompt = `
Genera la sesión de entrenamiento del ${weekdayName(targetDate)} ${targetDate} para este atleta.

${sessionContext}
${catchUp}
${fuerzaKbReminder}
${checkinBlock(checkin)}

Perfil del atleta (JSON):
${JSON.stringify(profile?.data ?? {}, null, 2)}

Bloque activo completo (inició ${block.start_date}):
${JSON.stringify(block.raw_plan ?? {}, null, 2)}

Logs de los últimos 14 días (RPE, dolor, sueño, rendimiento real):
${JSON.stringify(recentLogs ?? [], null, 2)}

${adjustmentsForPrompt(recentAdjustments)}

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
        { error: `No se pudo generar la sesión — respuesta inválida o incompleta del modelo (${message}). Intenta de nuevo.` },
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
      date: targetDate,
      // Trust the resolved calendar position over the model's echo: on a moved
      // session the model sees the source day's context and can report its week.
      week_number: weekNumber,
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

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const requested = new URL(request.url).searchParams.get("date");
  const target = resolveTargetDate(requested);
  if ("error" in target) {
    return NextResponse.json({ error: target.error }, { status: target.status });
  }

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("date", target.date)
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
