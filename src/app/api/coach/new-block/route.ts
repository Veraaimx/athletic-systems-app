import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { askEngine, parseJsonResponse } from "@/lib/claude";
import { todayISO } from "@/lib/dates";

interface BlockPlan {
  focus_notes: string;
  weeks: Array<{
    week_number: number;
    label: string;
    sessions: Array<{ day_offset: number; type: string; summary: string }>;
  }>;
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
    blockHistory = {
      focus_notes: lastBlock.focus_notes,
      sessions: sessionsWithLogs ?? [],
    };
  }

  const prompt = `
Genera la propuesta del SIGUIENTE bloque de 4 semanas para este atleta.

Perfil del atleta (JSON):
${JSON.stringify(profile?.data ?? {}, null, 2)}

${activeGoal?.goal_text ? `Meta vigente del atleta (concreta el ciclo actual, no reemplaza los objetivos de vida del perfil): ${activeGoal.goal_text}\n` : "No hay una meta vigente declarada — usa los objetivos de vida del perfil como referencia.\n"}
${goalProgressNote}

Bloque anterior: lo que se planificó, lo que realmente se hizo, y los logs reales
(RPE, dolor, sueño, rendimiento) de cada sesión registrada. Usa esto como evidencia
real para decidir progresión, mantenimiento o regresión de carga — no asumas que el
bloque anterior salió como se planeó si los logs dicen lo contrario:
${JSON.stringify(blockHistory, null, 2)}

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
      "sessions": [{ "day_offset": number, "type": "fuerza"|"running"|"yoga", "summary": string }]
    }
  ]
}
`.trim();

  const raw = await askEngine(prompt, 16000);
  const plan = parseJsonResponse<BlockPlan>(raw);

  // Returned as a proposal, NOT inserted into `blocks` yet.
  return NextResponse.json({ proposal: plan });
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

  await supabase.from("blocks").update({ status: "closed" }).eq("status", "active");

  const { data: block, error } = await supabase
    .from("blocks")
    .insert({
      start_date: todayISO(),
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
