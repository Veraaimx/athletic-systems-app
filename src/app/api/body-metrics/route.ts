import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("body_metrics")
    .select("*")
    .order("date", { ascending: false })
    .limit(30);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { weight_kg, body_fat_pct, notes, date } = body;

  if (!weight_kg) {
    return NextResponse.json({ error: "weight_kg is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("body_metrics")
    .insert({ weight_kg, body_fat_pct: body_fat_pct ?? null, notes: notes ?? null, date: date ?? undefined })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
