import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { askEngine, parseJsonResponse } from "@/lib/claude";

interface AthleteTurn {
  role: "athlete";
  content: string;
}

interface CoachTurn {
  role: "coach";
  content: string;
  ready_to_finalize: boolean;
  proposed_goal_text: string | null;
}

type ConversationTurn = AthleteTurn | CoachTurn;

interface GoalRow {
  id: string;
  status: "draft" | "active" | "closed";
  goal_text: string | null;
  conversation: ConversationTurn[];
  created_at: string;
  updated_at: string;
}

// Returns the current active goal (if any) and the in-progress draft (if any),
// so the UI can show both: what's vigente today, and what's being refined.
export async function GET() {
  const [{ data: active, error: activeErr }, { data: draft, error: draftErr }] = await Promise.all([
    supabase.from("athlete_goals").select("*").eq("status", "active").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("athlete_goals").select("*").eq("status", "draft").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  if (activeErr || draftErr) {
    return NextResponse.json({ error: (activeErr ?? draftErr)!.message }, { status: 500 });
  }

  return NextResponse.json({ active: active ?? null, draft: draft ?? null });
}

// Appends the athlete's message to the in-progress draft (creating one if none
// exists), asks the coach to respond, and appends the coach's turn. This is a
// turn-by-turn refinement dialogue, not open-ended chat — scoped entirely to
// arriving at a clear, actionable "meta vigente" for the current cycle.
export async function POST(request: Request) {
  const { message } = await request.json();
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const { data: existingDraft } = await supabase
    .from("athlete_goals")
    .select("*")
    .eq("status", "draft")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: activeGoal } = await supabase
    .from("athlete_goals")
    .select("*")
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: profile } = await supabase
    .from("athlete_profile")
    .select("data")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const conversation: ConversationTurn[] = (existingDraft?.conversation as ConversationTurn[] | undefined) ?? [];
  const athleteTurn: AthleteTurn = { role: "athlete", content: message };
  const conversationSoFar = [...conversation, athleteTurn];

  const prompt = `
Estás en una conversación de definición de la meta vigente con el atleta. Sigue la
sección "Meta vigente y su definición colaborativa" de tu comportamiento como coach.

Perfil del atleta (JSON) — incluye los objetivos de vida de largo plazo, que la meta
vigente debe concretar, no reemplazar:
${JSON.stringify(profile?.data ?? {}, null, 2)}

${activeGoal?.goal_text ? `Meta vigente actual (antes de esta conversación): ${activeGoal.goal_text}\n` : "No hay una meta vigente guardada todavía.\n"}

Conversación hasta ahora (turnos previos + el mensaje nuevo del atleta):
${JSON.stringify(conversationSoFar, null, 2)}

Responde con tu siguiente turno como coach: si la meta sigue vaga o hay tensión sin
resolver entre pilares, pregunta específicamente qué falta — no inventes el detalle.
Si ya hay claridad suficiente, propón una formulación concreta y con horizonte de
tiempo, y márcalo como listo para guardar.

Responde SOLO con un JSON con esta forma exacta:
{
  "coach_message": string,
  "ready_to_finalize": boolean,
  "proposed_goal_text": string
}
`.trim();

  const raw = await askEngine(prompt, 2048);
  const parsed = parseJsonResponse<{ coach_message: string; ready_to_finalize: boolean; proposed_goal_text: string | null }>(raw);

  const coachTurn: CoachTurn = {
    role: "coach",
    content: parsed.coach_message,
    ready_to_finalize: !!parsed.ready_to_finalize,
    proposed_goal_text: parsed.proposed_goal_text ?? null,
  };

  const nextConversation = [...conversationSoFar, coachTurn];

  const { data: saved, error } = existingDraft
    ? await supabase
        .from("athlete_goals")
        .update({ conversation: nextConversation, updated_at: new Date().toISOString() })
        .eq("id", existingDraft.id)
        .select()
        .single()
    : await supabase
        .from("athlete_goals")
        .insert({ status: "draft", conversation: nextConversation })
        .select()
        .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(saved as GoalRow);
}

// Finalizes the in-progress draft as the new meta vigente: closes whatever was
// previously active and promotes the draft. Never happens automatically — the
// athlete explicitly accepts (possibly edited) text from the chat.
export async function PUT(request: Request) {
  const { goal_text } = await request.json();
  if (!goal_text || typeof goal_text !== "string") {
    return NextResponse.json({ error: "goal_text is required" }, { status: 400 });
  }

  const { data: draft } = await supabase
    .from("athlete_goals")
    .select("*")
    .eq("status", "draft")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!draft) {
    return NextResponse.json({ error: "No hay una conversación de meta en curso para finalizar." }, { status: 400 });
  }

  await supabase.from("athlete_goals").update({ status: "closed" }).eq("status", "active");

  const { data: saved, error } = await supabase
    .from("athlete_goals")
    .update({ status: "active", goal_text, updated_at: new Date().toISOString() })
    .eq("id", draft.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(saved as GoalRow);
}
