import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    session_id,
    rpe,
    pain_flags,
    sleep_hours,
    readiness_notes,
    actual_performance,
    duration_min,
    calories,
  } = body;

  if (!session_id) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 });
  }

  // Upsert on session_id: resubmitting the form for the same session edits the
  // existing log instead of creating a duplicate.
  const { data: log, error } = await supabase
    .from("session_logs")
    .upsert(
      {
        session_id,
        rpe,
        pain_flags,
        sleep_hours,
        readiness_notes,
        actual_performance,
        duration_min: duration_min ?? null,
        calories: calories ?? null,
      },
      { onConflict: "session_id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("sessions").update({ status: "completed" }).eq("id", session_id);

  return NextResponse.json(log);
}

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");

  if (sessionId) {
    const { data, error } = await supabase
      .from("session_logs")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from("session_logs")
    .select("*, sessions(date, type, week_number)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
