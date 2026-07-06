"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ListChecks, Activity, Moon } from "lucide-react";
import { Badge, TYPE_COLORS, TYPE_LABELS } from "@/components/Collapsible";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { HintBanner } from "@/components/ui/HintBanner";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ProgressRingTiles, ProgressRingTile } from "@/components/ui/ProgressRing";

interface Exercise {
  name: string;
  sets?: number;
  reps?: string;
  notes?: string;
}

interface Session {
  id: string;
  date: string;
  week_number: number;
  type: string;
  title?: string | null;
  planned_exercises: Exercise[];
  status: string;
}

interface WeekSummary {
  adherencia: { pct: number | null; completed: number; total: number };
  avgRpe: number | null;
  avgSleep: number | null;
}

const QUOTES = [
  "Hoy construyes el atleta de mañana.",
  "La consistencia gana, no la intensidad de un solo día.",
  "Cada sesión es un depósito en tu longevidad articular.",
  "Progreso sostenible, no entrenamientos heroicos.",
  "Tu cuerpo se adapta a lo que repites, no a lo que haces una vez.",
  "Movilidad, fuerza, resistencia — hoy le toca a una de las tres.",
  "El descanso también es parte del entrenamiento.",
  "Lo que no se mide, no se ajusta.",
  "El descanso de hoy es la fuerza de la próxima semana.",
];

function quoteOfDay(): string {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}

function avgOf(vals: (number | null | undefined)[]) {
  const nums = vals.filter((v): v is number => v != null);
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

function estimateMinutes(session: Session): number {
  const count = session.planned_exercises.length;
  if (session.type === "running") return 30;
  if (session.type === "yoga") return 45 + count * 5;
  return Math.max(20, count * 8);
}

const ENERGY_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({ value: n, label: n }));

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weekSummary, setWeekSummary] = useState<WeekSummary | null>(null);

  // Pre-session check-in
  const [energy, setEnergy] = useState(3);
  const [checkinSleep, setCheckinSleep] = useState("7");
  const [sorenessPain, setSorenessPain] = useState("");
  const [specialContext, setSpecialContext] = useState("");
  const [trendHint, setTrendHint] = useState<string | null>(null);

  const [weightKg, setWeightKg] = useState("");
  const [weightSaved, setWeightSaved] = useState(false);

  useEffect(() => {
    fetch("/api/coach/today")
      .then((r) => r.json())
      .then((d) => setSession(d ?? null));

    fetch("/api/profile")
      .then((r) => r.json())
      .then((row) => setName(row?.data?.datos_generales?.nombre ?? null));

    fetch("/api/stats?period=week")
      .then((r) => r.json())
      .then((s) => {
        setWeekSummary({
          adherencia: s.adherencia,
          avgRpe: avgOf((s.recentLogs ?? []).map((l: { rpe: number | null }) => l.rpe)),
          avgSleep: avgOf((s.recentLogs ?? []).map((l: { sleep_hours: number | null }) => l.sleep_hours)),
        });
        const recent = (s.recentLogs ?? []).slice(-3);
        if (recent.length === 3 && recent.every((l: { rpe: number | null }) => (l.rpe ?? 0) >= 8)) {
          setTrendHint("Llevas 3 sesiones seguidas con RPE alto (8+) — dinos cómo te sientes hoy.");
        }
      })
      .catch(() => {});
  }, []);

  async function generateToday() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/coach/today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkin: {
            energy,
            sleep_hours: Number(checkinSleep),
            soreness_pain: sorenessPain,
            special_context: specialContext,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error generando la sesión");
        return;
      }
      setSession(data);
    } finally {
      setGenerating(false);
    }
  }

  async function logWeight() {
    if (!weightKg) return;
    setWeightSaved(false);
    const res = await fetch("/api/body-metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weight_kg: Number(weightKg) }),
    });
    if (res.ok) {
      setWeightSaved(true);
      setWeightKg("");
    }
  }

  if (session === undefined) return <p className="muted">Cargando…</p>;

  return (
    <div>
      <div className="hero-header">
        <div className="heading-impact" style={{ fontSize: "2.3rem" }}>Hola, {name ?? "👋"}</div>
        <p className="hero-quote">{quoteOfDay()}</p>
      </div>

      {error && <p className="card">⚠️ {error}</p>}

      {!session && (
        <Card>
          <h2>¿Cómo te sientes hoy?</h2>
          {trendHint && <HintBanner>{trendHint}</HintBanner>}

          <Field label="Energía">
            <SegmentedControl options={ENERGY_OPTIONS} value={energy} onChange={setEnergy} />
          </Field>
          {energy <= 2 && (
            <p className="muted" style={{ marginTop: -8, marginBottom: 14 }}>
              Energía baja hoy. No es debilidad, es información — el plan de hoy pesa menos.
            </p>
          )}
          <Field label="Horas de sueño anoche">
            <input type="number" value={checkinSleep} onChange={(e) => setCheckinSleep(e.target.value)} min={0} max={14} />
          </Field>
          <Field label="Dolor / molestias ahora (opcional)">
            <input value={sorenessPain} onChange={(e) => setSorenessPain(e.target.value)} placeholder="Ej: rodilla un poco sensible" />
          </Field>
          {sorenessPain.trim() && (
            <p className="muted" style={{ marginTop: -8, marginBottom: 14 }}>
              Anotado. El plan de hoy se ajusta a eso, no al calendario.
            </p>
          )}
          <Field label="Contexto especial (opcional)">
            <input
              value={specialContext}
              onChange={(e) => setSpecialContext(e.target.value)}
              placeholder="Ej: solo tengo 30 min, me perdí la clase de yoga…"
            />
          </Field>
          {specialContext.trim() && (
            <p className="muted" style={{ marginTop: -8, marginBottom: 14 }}>
              Contexto anotado. Hoy el sistema entrena con lo que tienes, no con lo que tendrías en un día perfecto.
            </p>
          )}

          <Button variant="primary" onClick={generateToday} disabled={generating} style={{ marginTop: 8 }}>
            {generating ? "Generando…" : "Generar sesión de hoy"}
          </Button>
        </Card>
      )}

      {session && (
        <Card onClick={() => router.push("/session")}>
          <div className="exercise-card-header" style={{ marginBottom: 6 }}>
            <span className="muted">Entrenamiento de hoy</span>
            <Badge color={TYPE_COLORS[session.type]}>{TYPE_LABELS[session.type] ?? session.type}</Badge>
          </div>
          <h2 style={{ fontSize: "1.3rem" }}>{session.title || TYPE_LABELS[session.type]}</h2>
          <p className="muted" style={{ marginTop: 4 }}>
            {session.planned_exercises.length} ejercicios · ~{estimateMinutes(session)} min
          </p>
          <Button variant="primary" style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
            {session.status === "completed" ? "Ver / editar" : "Empezar entrenamiento"} <ChevronRight size={16} />
          </Button>
        </Card>
      )}

      {weekSummary && (
        <Card href="/stats">
          <div className="exercise-card-header" style={{ marginBottom: 10 }}>
            <h2>Mi actividad</h2>
            <span className="muted" style={{ display: "flex", alignItems: "center", gap: 2 }}>
              esta semana <ChevronRight size={14} />
            </span>
          </div>
          <ProgressRingTiles>
            <ProgressRingTile icon={ListChecks} value={`${weekSummary.adherencia.pct ?? "—"}%`} label="adherencia" />
            <ProgressRingTile icon={Activity} value={weekSummary.avgRpe ?? "—"} label="RPE prom." />
            <ProgressRingTile icon={Moon} value={`${weekSummary.avgSleep ?? "—"}h`} label="sueño prom." />
          </ProgressRingTiles>
        </Card>
      )}

      <Card>
        <h2>Registrar peso</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <Field label="Peso hoy (kg)" style={{ flex: 1, marginBottom: 0 }}>
            <input value={weightKg} onChange={(e) => setWeightKg(e.target.value)} type="number" step="0.1" placeholder="91.0" />
          </Field>
          <Button onClick={logWeight} disabled={!weightKg}>
            Guardar
          </Button>
        </div>
        {weightSaved && <p className="muted" style={{ marginTop: 6 }}>Peso guardado ✓</p>}
      </Card>
    </div>
  );
}
