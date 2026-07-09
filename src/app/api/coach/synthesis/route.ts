import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { askEngine, parseJsonResponse } from "@/lib/claude";
import { todayISO } from "@/lib/dates";

interface SynthesisResult {
  findings: string[];
  recommendations: string[];
}

const PERIOD_DAYS = 30;

// Returns the most recent synthesis on file — cheap, no LLM call.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data, error } = await supabase
    .from("coach_synthesis")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// Generates a fresh synthesis from the last 30 days of logs (including per-exercise
// athlete notes) and persists it. Explicit action, not run automatically on page load,
// since it's an LLM call.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const today = todayISO();
  const periodStart = new Date(Date.now() - PERIOD_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const { data: profile } = await supabase
    .from("athlete_profile")
    .select("data")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: logs } = await supabase
    .from("session_logs")
    .select("*, sessions(date, type, week_number, planned_exercises, justification)")
    .gte("created_at", periodStart)
    .order("created_at", { ascending: true });

  if (!logs || logs.length === 0) {
    return NextResponse.json(
      { error: "No hay suficientes registros en los últimos 30 días para generar una síntesis." },
      { status: 400 }
    );
  }

  const prompt = `
Genera una síntesis del historial reciente de este atleta (últimos ${PERIOD_DAYS} días, hasta ${today}).

Perfil del atleta (JSON):
${JSON.stringify(profile?.data ?? {}, null, 2)}

Logs de sesión del periodo — incluye RPE, sueño, dolor, notas generales de la sesión, y notas que el
atleta dejó por cada ejercicio individual (campo "notes" dentro de cada ejercicio en actual_performance):
${JSON.stringify(logs, null, 2)}

Sigue la sección "Síntesis de hallazgos y recomendaciones" de tu comportamiento como coach. Responde
SOLO con un JSON con esta forma exacta:
{
  "findings": [string],
  "recommendations": [string]
}
`.trim();

  const raw = await askEngine(prompt, 4096);
  const synthesis = parseJsonResponse<SynthesisResult>(raw);

  const { data: saved, error } = await supabase
    .from("coach_synthesis")
    .insert({
      period_start: periodStart,
      period_end: today,
      findings: synthesis.findings,
      recommendations: synthesis.recommendations,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(saved);
}
