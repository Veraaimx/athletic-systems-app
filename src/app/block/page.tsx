"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight, ArrowLeftRight, Check, Circle, Moon } from "lucide-react";
import { Collapsible, Badge, TYPE_COLORS, TYPE_LABELS } from "@/components/Collapsible";
import type { AdjustmentKind } from "@/lib/blockPlan";

type View = "day" | "week" | "month";

interface AgendaDay {
  date: string;
  dayOffset: number;
  weekNumber: number;
  weekLabel: string;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  type: string | null;
  summary: string | null;
  isRestDay: boolean;
  movedFromDate: string | null;
  movedToDate: string | null;
  adjustment: { date: string; kind: AdjustmentKind; moved_to_date: string | null; note: string | null } | null;
  sessionId: string | null;
  sessionTitle: string | null;
  sessionStatus: string | null;
}

interface Agenda {
  block: { id: string; start_date: string; focus_notes: string } | null;
  today: string;
  days: AgendaDay[];
}

interface BlockWeek {
  week_number: number;
  label: string;
  sessions: Array<{ day_offset: number; type: string; summary: string }>;
}

interface BlockProposal {
  focus_notes: string;
  weeks: BlockWeek[];
}

const DOW_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function dowLabel(dateISO: string): string {
  return DOW_NAMES[new Date(dateISO + "T00:00:00Z").getUTCDay()];
}

const KIND_LABELS: Record<AdjustmentKind, string> = {
  movida: "Movida a otro día",
  sustituida: "Entrené, pero otra cosa",
  saltada: "No entrené",
  extra: "Entrené en día de descanso",
};

// State of a day at a glance. Only days that have already happened can be
// "late" — a future day is simply not here yet, which is why `isFuture` short
// circuits before the missing-session case.
function dayState(d: AgendaDay): { label: string; icon: typeof Check | null; color: string } {
  if (d.sessionStatus === "completed") return { label: "Completada", icon: Check, color: "#22c55e" };
  if (d.isRestDay) return { label: "Descanso", icon: Moon, color: "#475569" };
  if (d.adjustment?.kind === "saltada") return { label: "No entrenada", icon: null, color: "#ef4444" };
  if (d.adjustment?.kind === "sustituida") return { label: "Sustituida", icon: ArrowLeftRight, color: "#f5a623" };
  if (d.movedToDate) return { label: `Movida a ${d.movedToDate}`, icon: ArrowLeftRight, color: "#f5a623" };
  if (d.sessionId) return { label: "Pendiente de registrar", icon: Circle, color: "#38bdf8" };
  if (d.isFuture) return { label: "Por venir", icon: null, color: "#64748b" };
  if (d.isToday) return { label: "Sin generar", icon: Circle, color: "#f5a623" };
  return { label: "Sin generar", icon: null, color: "#94a3b8" };
}

function AdjustmentForm({
  day,
  allDates,
  onSaved,
  onClose,
}: {
  day: AgendaDay;
  allDates: string[];
  onSaved: () => void;
  onClose: () => void;
}) {
  const [kind, setKind] = useState<AdjustmentKind>(day.adjustment?.kind ?? (day.isRestDay ? "extra" : "movida"));
  const [movedTo, setMovedTo] = useState(day.adjustment?.moved_to_date ?? "");
  const [note, setNote] = useState(day.adjustment?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/day-adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: day.date,
          kind,
          moved_to_date: kind === "movida" ? movedTo : null,
          note,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar el ajuste.");
        return;
      }
      onSaved();
      onClose();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setSaving(true);
    await fetch(`/api/day-adjustments?date=${day.date}`, { method: "DELETE" });
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
      <label className="muted" style={{ fontSize: "0.8rem" }}>¿Qué pasó este día?</label>
      <select
        value={kind}
        onChange={(e) => setKind(e.target.value as AdjustmentKind)}
        style={{ width: "100%", marginTop: 4, marginBottom: 10 }}
      >
        {(Object.keys(KIND_LABELS) as AdjustmentKind[]).map((k) => (
          <option key={k} value={k}>
            {KIND_LABELS[k]}
          </option>
        ))}
      </select>

      {kind === "movida" && (
        <>
          <label className="muted" style={{ fontSize: "0.8rem" }}>¿A qué día la haces?</label>
          <select
            value={movedTo}
            onChange={(e) => setMovedTo(e.target.value)}
            style={{ width: "100%", marginTop: 4, marginBottom: 10 }}
          >
            <option value="">Elige un día…</option>
            {allDates
              .filter((d) => d !== day.date)
              .map((d) => (
                <option key={d} value={d}>
                  {dowLabel(d)} {d}
                </option>
              ))}
          </select>
        </>
      )}

      <label className="muted" style={{ fontSize: "0.8rem" }}>Nota para el coach (opcional)</label>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Ej: me fui a correr 5k"
        style={{ width: "100%", marginTop: 4, marginBottom: 10 }}
      />

      {error && <p className="muted" style={{ color: "#ef4444", marginBottom: 8 }}>⚠️ {error}</p>}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={save} disabled={saving || (kind === "movida" && !movedTo)}>
          {saving ? "Guardando…" : "Guardar"}
        </button>
        <button onClick={onClose} disabled={saving}>Cancelar</button>
        {day.adjustment && (
          <button onClick={remove} disabled={saving}>Quitar ajuste</button>
        )}
      </div>
    </div>
  );
}

function DayCard({ day, allDates, onChanged }: { day: AgendaDay; allDates: string[]; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const state = dayState(day);
  const StateIcon = state.icon;
  const type = day.type ?? "otro";
  // Nothing to open on a day that hasn't arrived: the engine builds the session
  // from the most recent logs, so it can only be generated on the day or after.
  const openable = !day.isFuture;

  const header = (
    <>
      <div className="exercise-card-header">
        <Badge color={TYPE_COLORS[type]}>{TYPE_LABELS[type] ?? type}</Badge>
        <span className="muted" style={{ fontSize: "0.8rem" }}>
          {dowLabel(day.date)} {day.date}
          {day.isToday && " · hoy"}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "6px 0" }}>
        {StateIcon && <StateIcon size={13} style={{ color: state.color }} />}
        <span style={{ color: state.color, fontSize: "0.78rem", fontWeight: 600 }}>{state.label}</span>
        {day.movedFromDate && (
          <span className="muted" style={{ fontSize: "0.78rem" }}>· traída del {day.movedFromDate}</span>
        )}
      </div>

      {day.summary && (
        day.summary.length > 70 ? (
          <Collapsible label="ver detalle">
            <p>{day.summary}</p>
          </Collapsible>
        ) : (
          <p className="muted" style={{ marginTop: 4 }}>{day.summary}</p>
        )
      )}

      {day.adjustment?.note && (
        <p className="muted" style={{ marginTop: 6, fontStyle: "italic" }}>
          “{day.adjustment.note}”
        </p>
      )}
    </>
  );

  return (
    <div className="exercise-card">
      {openable ? (
        <Link href={`/session?date=${day.date}`} style={{ display: "block", color: "inherit", textDecoration: "none" }}>
          {header}
        </Link>
      ) : (
        header
      )}

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
        {openable && (
          <Link
            href={`/session?date=${day.date}`}
            className="muted"
            style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.8rem" }}
          >
            {day.sessionId ? "Abrir sesión" : day.isRestDay ? "Ver día" : "Generar sesión"}
            <ChevronRight size={13} />
          </Link>
        )}
        <button
          onClick={() => setEditing((v) => !v)}
          style={{ marginLeft: "auto", fontSize: "0.78rem", padding: "4px 10px" }}
        >
          <ArrowLeftRight size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
          {day.adjustment ? "Editar cambio" : "Cambiar día"}
        </button>
      </div>

      {editing && (
        <AdjustmentForm day={day} allDates={allDates} onSaved={onChanged} onClose={() => setEditing(false)} />
      )}
    </div>
  );
}

export default function BlockPage() {
  return (
    <Suspense fallback={<p className="muted">Cargando…</p>}>
      <BlockPageContent />
    </Suspense>
  );
}

function BlockPageContent() {
  const searchParams = useSearchParams();
  const [agenda, setAgenda] = useState<Agenda | null | undefined>(undefined);
  const [view, setView] = useState<View>(searchParams.get("propose") ? "month" : "week");
  const [proposal, setProposal] = useState<BlockProposal | null>(null);
  const [proposalStartDate, setProposalStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [activated, setActivated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAgenda = useCallback(() => {
    fetch("/api/agenda")
      .then((r) => r.json())
      .then((a: Agenda) => setAgenda(a))
      .catch(() => setAgenda(null));
  }, []);

  const generateProposal = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActivated(false);
    try {
      const res = await fetch("/api/coach/new-block", { method: "POST" });
      const text = await res.text();
      let data: { proposal?: BlockProposal; assumedStartDate?: string; error?: string };
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
      if (data.assumedStartDate) setProposalStartDate(data.assumedStartDate);
    } catch {
      setError("No se pudo conectar con el servidor. Verifica que esté corriendo e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAgenda();
    // Coming from the goal page's "generar propuesta con esta meta" CTA —
    // skip the extra click, the athlete already asked for this explicitly there.
    if (searchParams.get("propose")) generateProposal();
  }, [loadAgenda, generateProposal, searchParams]);

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
      loadAgenda();
    }
  }

  const days = agenda?.days ?? [];
  const allDates = days.map((d) => d.date);
  const currentWeek = days.find((d) => d.isToday)?.weekNumber ?? 1;
  const weekNumbers = [...new Set(days.map((d) => d.weekNumber))];

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

      {agenda === undefined && <p className="muted">Cargando bloque activo…</p>}
      {agenda && !agenda.block && (
        <p className="muted">No hay un bloque activo todavía. Genera una propuesta abajo.</p>
      )}

      {agenda?.block && (
        <div className="card">
          {view === "month" && (
            <>
              <p className="muted">Bloque desde {agenda.block.start_date}</p>
              <Collapsible label="Enfoque del bloque">
                <p>{agenda.block.focus_notes}</p>
              </Collapsible>
              <div style={{ marginTop: 12 }}>
                {weekNumbers.map((wn) => {
                  const weekDays = days.filter((d) => d.weekNumber === wn);
                  return (
                    <Collapsible
                      key={wn}
                      defaultOpen={wn === currentWeek}
                      label={`Semana ${wn} — ${weekDays[0]?.weekLabel ?? ""}${wn === currentWeek ? " (actual)" : ""}`}
                    >
                      {weekDays.map((d) => (
                        <DayCard key={d.date} day={d} allDates={allDates} onChanged={loadAgenda} />
                      ))}
                    </Collapsible>
                  );
                })}
              </div>
            </>
          )}

          {view === "week" && (
            <>
              <p className="muted" style={{ marginBottom: 10 }}>
                Semana {currentWeek} — {days.find((d) => d.weekNumber === currentWeek)?.weekLabel ?? ""}
              </p>
              {days
                .filter((d) => d.weekNumber === currentWeek)
                .map((d) => (
                  <DayCard key={d.date} day={d} allDates={allDates} onChanged={loadAgenda} />
                ))}
            </>
          )}

          {view === "day" && (
            <>
              {days
                .filter((d) => d.isToday)
                .map((d) => (
                  <DayCard key={d.date} day={d} allDates={allDates} onChanged={loadAgenda} />
                ))}
              {!days.some((d) => d.isToday) && (
                <p className="muted">Hoy cae fuera del bloque activo.</p>
              )}
            </>
          )}
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
              {proposal.weeks.map((week) => (
                <Collapsible
                  key={week.week_number}
                  defaultOpen={week.week_number === 1}
                  label={`Semana ${week.week_number} — ${week.label}`}
                >
                  {week.sessions.map((s, i) => {
                    const d = new Date(proposalStartDate + "T00:00:00Z");
                    d.setUTCDate(d.getUTCDate() + (s.day_offset - 1));
                    const iso = d.toISOString().slice(0, 10);
                    return (
                      <div className="exercise-card" key={i}>
                        <div className="exercise-card-header">
                          <Badge color={TYPE_COLORS[s.type]}>{TYPE_LABELS[s.type] ?? s.type}</Badge>
                          <span className="muted">{dowLabel(iso)} {iso}</span>
                        </div>
                        <p className="muted" style={{ marginTop: 4 }}>{s.summary}</p>
                      </div>
                    );
                  })}
                </Collapsible>
              ))}

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
