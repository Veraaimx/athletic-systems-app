"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Collapsible, Badge, TYPE_COLORS, TYPE_LABELS } from "@/components/Collapsible";

type View = "day" | "week" | "month";

interface BlockSession {
  day_offset: number;
  type: string;
  summary: string;
}

interface BlockWeek {
  week_number: number;
  label: string;
  sessions: BlockSession[];
}

interface BlockProposal {
  focus_notes: string;
  weeks: BlockWeek[];
}

interface ActiveBlock {
  id: string;
  start_date: string;
  focus_notes: string;
  raw_plan: BlockProposal;
}

const DOW_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function dateForDayOffset(startDate: string, dayOffset: number): string {
  const d = new Date(startDate + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + (dayOffset - 1));
  const iso = d.toISOString().slice(0, 10);
  return `${DOW_NAMES[d.getUTCDay()]} ${iso}`;
}

function todayDayOffset(startDate: string): number {
  const today = new Date().toISOString().slice(0, 10);
  return Math.floor((Date.parse(today) - Date.parse(startDate)) / (24 * 60 * 60 * 1000)) + 1;
}

function currentWeekNumber(startDate: string): number {
  const diffDays = todayDayOffset(startDate) - 1;
  return Math.min(4, Math.max(1, Math.floor(diffDays / 7) + 1));
}

function DaySessionCard({ s, startDate }: { s: BlockSession; startDate: string }) {
  const long = s.summary.length > 70;
  return (
    <div className="exercise-card">
      <div className="exercise-card-header">
        <Badge color={TYPE_COLORS[s.type]}>{TYPE_LABELS[s.type] ?? s.type}</Badge>
        <span className="muted">{dateForDayOffset(startDate, s.day_offset)}</span>
      </div>
      {long ? (
        <Collapsible label="ver detalle">
          <p>{s.summary}</p>
        </Collapsible>
      ) : (
        <p className="muted" style={{ marginTop: 4 }}>{s.summary}</p>
      )}
    </div>
  );
}

function MonthView({ weeks, startDate }: { weeks: BlockWeek[]; startDate: string }) {
  const activeWeek = currentWeekNumber(startDate);
  return (
    <>
      {weeks.map((week) => (
        <Collapsible
          key={week.week_number}
          defaultOpen={week.week_number === activeWeek}
          label={`Semana ${week.week_number} — ${week.label}${week.week_number === activeWeek ? " (actual)" : ""}`}
        >
          {week.sessions.map((s, i) => (
            <DaySessionCard key={i} s={s} startDate={startDate} />
          ))}
        </Collapsible>
      ))}
    </>
  );
}

function WeekView({ weeks, startDate }: { weeks: BlockWeek[]; startDate: string }) {
  const activeWeek = currentWeekNumber(startDate);
  const week = weeks.find((w) => w.week_number === activeWeek);
  if (!week) return <p className="muted">No hay datos para esta semana.</p>;
  return (
    <>
      <p className="muted" style={{ marginBottom: 10 }}>
        Semana {week.week_number} — {week.label}
      </p>
      {week.sessions.map((s, i) => (
        <DaySessionCard key={i} s={s} startDate={startDate} />
      ))}
    </>
  );
}

function DayView({ weeks, startDate }: { weeks: BlockWeek[]; startDate: string }) {
  const offset = todayDayOffset(startDate);
  const today = weeks.flatMap((w) => w.sessions).find((s) => s.day_offset === offset);
  if (!today) {
    return <p className="muted">Hoy no hay un día planificado explícito en el bloque (posible descanso).</p>;
  }
  return (
    <div>
      <DaySessionCard s={today} startDate={startDate} />
      <Link href="/session" className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Ir a la sesión de hoy</span>
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}

export default function BlockPage() {
  const [activeBlock, setActiveBlock] = useState<ActiveBlock | null | undefined>(undefined);
  const [view, setView] = useState<View>("week");
  const [proposal, setProposal] = useState<BlockProposal | null>(null);
  const [loading, setLoading] = useState(false);
  const [activated, setActivated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadActiveBlock() {
    fetch("/api/coach/new-block")
      .then((r) => r.json())
      .then((b) => setActiveBlock(b ?? null));
  }

  useEffect(() => {
    loadActiveBlock();
  }, []);

  async function generateProposal() {
    setLoading(true);
    setError(null);
    setActivated(false);
    try {
      const res = await fetch("/api/coach/new-block", { method: "POST" });
      const text = await res.text();
      let data: { proposal?: BlockProposal; error?: string };
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        setError("El servidor no respondió correctamente (puede ser un corte temporal). Intenta de nuevo.");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Error generando la propuesta de bloque");
        return;
      }
      if (data.proposal) setProposal(data.proposal);
    } catch {
      setError("No se pudo conectar con el servidor. Verifica que esté corriendo e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function activate() {
    if (!proposal) return;
    const res = await fetch("/api/coach/new-block", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposal }),
    });
    if (res.ok) {
      setActivated(true);
      setProposal(null);
      loadActiveBlock();
    }
  }

  return (
    <div>
      <div className="exercise-card-header" style={{ marginBottom: 4 }}>
        <h1>Workouts</h1>
        <div className="energy-picker" style={{ maxWidth: 220 }}>
          {(["day", "week", "month"] as View[]).map((v) => (
            <button key={v} className={view === v ? "selected" : ""} onClick={() => setView(v)}>
              {v === "day" ? "Día" : v === "week" ? "Semana" : "Mes"}
            </button>
          ))}
        </div>
      </div>

      {activeBlock === undefined && <p className="muted">Cargando bloque activo…</p>}
      {activeBlock === null && <p className="muted">No hay un bloque activo todavía. Genera una propuesta abajo.</p>}

      {activeBlock && (
        <div className="card">
          {view === "month" && (
            <>
              <p className="muted">Bloque desde {activeBlock.start_date}</p>
              <Collapsible label="Enfoque del bloque">
                <p>{activeBlock.focus_notes}</p>
              </Collapsible>
              <div style={{ marginTop: 12 }}>
                <MonthView weeks={activeBlock.raw_plan.weeks} startDate={activeBlock.start_date} />
              </div>
            </>
          )}
          {view === "week" && <WeekView weeks={activeBlock.raw_plan.weeks} startDate={activeBlock.start_date} />}
          {view === "day" && <DayView weeks={activeBlock.raw_plan.weeks} startDate={activeBlock.start_date} />}
        </div>
      )}

      {view === "month" && (
        <div className="card" style={{ marginTop: 24 }}>
          <h2>Generar el siguiente bloque</h2>
          <p className="muted">
            Genera una propuesta y revísala antes de activarla — el sistema recomienda, tú decides.
            Al activarla, reemplaza el bloque activo actual.
          </p>

          <button onClick={generateProposal} disabled={loading} style={{ marginTop: 12 }}>
            {loading ? "Generando…" : "Generar propuesta de bloque"}
          </button>

          {error && <p className="card">⚠️ {error}</p>}

          {proposal && (
            <div style={{ marginTop: 16 }}>
              <h3>Propuesta (sin activar)</h3>
              <p className="muted">{proposal.focus_notes}</p>
              <MonthView weeks={proposal.weeks} startDate={new Date().toISOString().slice(0, 10)} />

              <button onClick={activate} style={{ marginTop: 16 }}>
                Activar este bloque
              </button>
            </div>
          )}

          {activated && (
            <p className="muted" style={{ marginTop: 16 }}>
              Bloque activado ✓
            </p>
          )}
        </div>
      )}
    </div>
  );
}
