import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
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

Bloque anterior: lo que se planificó, lo que realmente se hizo, y los logs reales
(RPE, dolor, sueño, rendimiento) de cada sesión registrada. Usa esto como evidencia
real para decidir progresión, mantenimiento o regresión de carga — no asumas que el
bloque anterior salió como se planeó si los logs dicen lo contrario:
${JSON.stringify(blockHistory, null, 2)}

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

  const raw = await askEngine(prompt, 8192);
  const plan = parseJsonResponse<BlockPlan>(raw);

  // Returned as a proposal, NOT inserted into `blocks` yet.
  return NextResponse.json({ proposal: plan });
}

// Activates a confirmed block proposal: closes the current active block (if any)
// and creates the new one starting today.
export async function PUT(request: Request) {
  const { proposal } = await request.json();

  await supabase.from("blocks").update({ status: "closed" }).eq("status", "active");

  const { data: block, error } = await supabase
    .from("blocks")
    .insert({
      start_date: todayISO(),
      status: "active",
      focus_notes: proposal.focus_notes,
      raw_plan: proposal,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(block);
}
