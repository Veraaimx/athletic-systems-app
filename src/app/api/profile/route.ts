import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { ATHLETE_PROFILE_SEED } from "@/lib/profileSeed";

export async function GET() {
  const { data, error } = await supabase
    .from("athlete_profile")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    // Seed the row with a structured profile the first time the app runs.
    const { data: inserted, error: insertError } = await supabase
      .from("athlete_profile")
      .insert({ data: ATHLETE_PROFILE_SEED })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    return NextResponse.json(inserted);
  }

  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const body = await request.json();

  const { data: existing } = await supabase
    .from("athlete_profile")
    .select("id")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!existing) {
    const { data, error } = await supabase
      .from("athlete_profile")
      .insert({ data: body })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from("athlete_profile")
    .update({ data: body, updated_at: new Date().toISOString() })
    .eq("id", existing.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
