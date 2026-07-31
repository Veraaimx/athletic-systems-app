import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { isValidISODate, blockPosition } from "@/lib/dates";
import type { AdjustmentKind } from "@/lib/blockPlan";

const KINDS: AdjustmentKind[] = ["movida", "sustituida", "saltada", "extra"];

async function activeBlockFor(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase
    .from("blocks")
    .select("id, start_date")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

// All adjustments for the active block — the agenda reads this once and layers
// it over the plan client-side.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const block = await activeBlockFor(supabase);
  if (!block) return NextResponse.json([]);

  const { data, error } = await supabase
    .from("day_adjustments")
    .select("id, date, kind, moved_to_date, note")
    .eq("block_id", block.id)
    .order("date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { date, kind, moved_to_date, note } = body ?? {};

  if (!isValidISODate(date)) {
    return NextResponse.json({ error: "Falta una fecha válida (YYYY-MM-DD)." }, { status: 400 });
  }
  if (!KINDS.includes(kind)) {
    return NextResponse.json(
      { error: `"kind" debe ser uno de: ${KINDS.join(", ")}.` },
      { status: 400 }
    );
  }

  // Mirrors the DB check constraint so the athlete gets a readable message
  // instead of a Postgres constraint violation.
  if (kind === "movida") {
    if (!isValidISODate(moved_to_date)) {
      return NextResponse.json(
        { error: "Una sesión movida necesita la fecha destino (moved_to_date)." },
        { status: 400 }
      );
    }
    if (moved_to_date === date) {
      return NextResponse.json(
        { error: "La fecha destino tiene que ser distinta al día que se está moviendo." },
        { status: 400 }
      );
    }
  }

  const block = await activeBlockFor(supabase);
  if (!block) {
    return NextResponse.json(
      { error: "No hay un bloque activo al cual anotar el ajuste." },
      { status: 400 }
    );
  }

  // Both ends of a swap have to live inside the block: a plan entry outside it
  // doesn't exist, so the move would silently resolve to an empty day.
  const from = blockPosition(block.start_date, date);
  if (!from.isInsideBlock) {
    return NextResponse.json(
      { error: `${date} cae fuera del bloque activo (inició ${block.start_date}).` },
      { status: 400 }
    );
  }
  if (kind === "movida" && !blockPosition(block.start_date, moved_to_date).isInsideBlock) {
    return NextResponse.json(
      { error: `${moved_to_date} cae fuera del bloque activo (inició ${block.start_date}).` },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("day_adjustments")
    .upsert(
      {
        user_id: user.id,
        block_id: block.id,
        date,
        kind,
        moved_to_date: kind === "movida" ? moved_to_date : null,
        note: note?.trim() ? note.trim() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,date" }
    )
    .select("id, date, kind, moved_to_date, note")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Undo an adjustment — the day goes back to whatever the block plan says.
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const date = new URL(request.url).searchParams.get("date");
  if (!isValidISODate(date)) {
    return NextResponse.json({ error: "Falta una fecha válida (YYYY-MM-DD)." }, { status: 400 });
  }

  const { error } = await supabase
    .from("day_adjustments")
    .delete()
    .eq("user_id", user.id)
    .eq("date", date);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
