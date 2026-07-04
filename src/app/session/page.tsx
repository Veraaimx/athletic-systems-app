"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Flame, Clock, Activity, PlayCircle, Timer } from "lucide-react";
import { Collapsible, Badge, TYPE_COLORS, TYPE_LABELS } from "@/components/Collapsible";

type Unit = "kg" | "lbs";
type Measure = "reps" | "time" | "distance";

interface Exercise {
  name: string;
  measure?: Measure;
  sets?: number;
  reps?: string;
  time_seconds?: number;
  distance_m?: number;
  rest_seconds?: number;
  notes?: string;
}

interface Session {
  id: string;
  date: string;
  week_number: number;
  type: string;
  title?: string | null;
  planned_exercises: Exercise[];
  justification: string;
  status: string;
}

interface SetEntry {
  reps: number;
  weight: number;
}

interface PerformanceExercise {
  name: string;
  done: boolean;
  skip_reason?: string;
  notes?: string;
  unit: Unit;
  sets: SetEntry[];
}

interface RunningPerformance {
  distance_km?: number;
}

interface ExistingLog {
  id: string;
  rpe: number | null;
  sleep_hours: number | null;
  pain_flags: { notes?: string } | null;
  readiness_notes: string | null;
  actual_performance:
    | ({ exercises?: PerformanceExercise[] } & RunningPerformance & {
        benchmark_name?: string;
        result?: string;
        notes?: string;
      })
    | null;
  duration_min: number | null;
  calories: number | null;
}

interface StatsData {
  liftProgression: Record<string, Array<{ date: string; unit?: Unit; sets: SetEntry[] }>>;
}

function defaultUnitFor(name: string): Unit {
  return /kettlebell|\bkb\b/i.test(name) ? "kg" : "lbs";
}

function lastEntryFor(stats: StatsData | null, exerciseName: string) {
  const entries = stats?.liftProgression[exerciseName];
  if (!entries || entries.length === 0) return null;
  const last = entries[entries.length - 1];
  const maxSet = last.sets.reduce((max, s) => (s.weight > max ? s.weight : max), 0);
  if (!maxSet) return null;
  return { weight: maxSet, unit: last.unit ?? defaultUnitFor(exerciseName) };
}

function valueLabelFor(measure: Measure): string {
  return measure === "time" ? "seg" : measure === "distance" ? "m" : "reps";
}

function targetLabelFor(ex: Exercise): string | null {
  if (!ex.sets) return null;
  const measure = ex.measure ?? "reps";
  if (measure === "time" && ex.time_seconds) return `${ex.sets} × ${ex.time_seconds}s`;
  if (measure === "distance" && ex.distance_m) return `${ex.sets} × ${ex.distance_m}m`;
  if (ex.reps) return `${ex.sets} × ${ex.reps}`;
  return `${ex.sets} series`;
}

function tutorialUrlFor(name: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${name} tecnica ejercicio`)}`;
}

function EditableTitle({ title, onSave }: { title: string; onSave: (next: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);

  if (editing) {
    return (
      <div className="title-edit">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setEditing(false);
              onSave(value);
            }
          }}
        />
        <button
          onClick={() => {
            setEditing(false);
            onSave(value);
          }}
        >
          ✓
        </button>
      </div>
    );
  }

  return (
    <button className="title-edit-trigger" onClick={() => setEditing(true)}>
      {title} <Pencil size={14} style={{ verticalAlign: "middle", opacity: 0.5 }} />
    </button>
  );
}

function ExerciseCard({
  ex,
  stats,
  perf,
  onPatch,
  onUpdateSet,
}: {
  ex: Exercise;
  stats: StatsData | null;
  perf?: PerformanceExercise;
  onPatch?: (patch: Partial<PerformanceExercise>) => void;
  onUpdateSet?: (setIdx: number, field: keyof SetEntry, value: number) => void;
}) {
  const measure = ex.measure ?? "reps";
  const hasDetail = !!ex.notes && ex.notes.length > 60;
  const loggable = typeof ex.sets === "number" && !!perf && !!onPatch && !!onUpdateSet;
  const last = lastEntryFor(stats, ex.name);
  const target = targetLabelFor(ex);

  return (
    <div className="exercise-card">
      <div className="exercise-card-header">
        <label style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 0 }}>
          {loggable && (
            <input
              type="checkbox"
              checked={perf!.done}
              onChange={(e) => onPatch!({ done: e.target.checked })}
              style={{ width: "auto" }}
            />
          )}
          <strong>{ex.name}</strong>
        </label>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          {target && <span className="chip">{target}</span>}
          {ex.rest_seconds ? (
            <span className="chip">
              <Timer size={11} style={{ verticalAlign: "middle", marginRight: 3 }} />
              {ex.rest_seconds}s descanso
            </span>
          ) : null}
          {loggable && perf!.done && last != null && (
            <span className="chip">
              última vez: {last.weight}
              {last.unit}
            </span>
          )}
        </div>
      </div>

      <a
        href={tutorialUrlFor(ex.name)}
        target="_blank"
        rel="noopener noreferrer"
        className="muted"
        style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.8rem", marginTop: 4 }}
      >
        <PlayCircle size={13} /> Ver tutorial
      </a>

      {ex.notes &&
        (hasDetail ? (
          <Collapsible label="Leer más">
            <p>{ex.notes}</p>
          </Collapsible>
        ) : (
          <p className="muted" style={{ marginTop: 4 }}>
            {ex.notes}
          </p>
        ))}

      {loggable &&
        (!perf!.done ? (
          <input
            placeholder="¿Por qué no lo hiciste? (opcional)"
            value={perf!.skip_reason ?? ""}
            onChange={(e) => onPatch!({ skip_reason: e.target.value })}
            style={{ marginTop: 8 }}
          />
        ) : (
          <div style={{ marginTop: 8 }}>
            <div className="energy-picker" style={{ marginBottom: 6, maxWidth: 140 }}>
              {(["kg", "lbs"] as Unit[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  className={perf!.unit === u ? "selected" : ""}
                  onClick={() => onPatch!({ unit: u })}
                >
                  {u}
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {perf!.sets.map((s, setIdx) => (
                <div key={setIdx} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <span className="muted" style={{ width: 32 }}>
                    S{setIdx + 1}
                  </span>
                  <input
                    type="number"
                    placeholder={perf!.unit}
                    value={s.weight || ""}
                    onChange={(e) => onUpdateSet!(setIdx, "weight", Number(e.target.value))}
                    style={{ width: 60 }}
                  />
                  <span className="muted">×</span>
                  <input
                    type="number"
                    placeholder={valueLabelFor(measure)}
                    value={s.reps || ""}
                    onChange={(e) => onUpdateSet!(setIdx, "reps", Number(e.target.value))}
                    style={{ width: 55 }}
                  />
                </div>
              ))}
            </div>
            <input
              placeholder="Notas de este ejercicio (opcional): cómo se sintió, técnica, dolor puntual…"
              value={perf!.notes ?? ""}
              onChange={(e) => onPatch!({ notes: e.target.value })}
              style={{ marginTop: 8 }}
            />
          </div>
        ))}
    </div>
  );
}

export default function SessionPage() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [existingLog, setExistingLog] = useState<ExistingLog | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [editingLog, setEditingLog] = useState(false);

  const [rpe, setRpe] = useState("7");
  const [sleepHours, setSleepHours] = useState("7");
  const [painNotes, setPainNotes] = useState("");
  const [readinessNotes, setReadinessNotes] = useState("");
  const [perfData, setPerfData] = useState<PerformanceExercise[]>([]);
  const [benchmarkName, setBenchmarkName] = useState("");
  const [benchmarkResult, setBenchmarkResult] = useState("");
  const [benchmarkNotes, setBenchmarkNotes] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [calories, setCalories] = useState("");
  const [logSaved, setLogSaved] = useState(false);

  useEffect(() => {
    fetch("/api/coach/today")
      .then((r) => r.json())
      .then((d) => setSession(d ?? null));
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!session) return;
    const loggable = session.planned_exercises.filter((ex) => typeof ex.sets === "number");
    setPerfData(
      loggable.map((ex) => {
        const last = lastEntryFor(stats, ex.name);
        return {
          name: ex.name,
          done: true,
          unit: last?.unit ?? defaultUnitFor(ex.name),
          sets: Array.from({ length: ex.sets ?? 3 }, () => ({ reps: 0, weight: last?.weight ?? 0 })),
        };
      })
    );

    fetch(`/api/logs?session_id=${session.id}`)
      .then((r) => r.json())
      .then((log: ExistingLog | null) => {
        if (!log) return;
        setExistingLog(log);
        setRpe(String(log.rpe ?? 7));
        setSleepHours(String(log.sleep_hours ?? 7));
        setPainNotes(log.pain_flags?.notes ?? "");
        setReadinessNotes(log.readiness_notes ?? "");
        setDurationMin(log.duration_min != null ? String(log.duration_min) : "");
        setCalories(log.calories != null ? String(log.calories) : "");
        if (log.actual_performance?.exercises) setPerfData(log.actual_performance.exercises);
        if (log.actual_performance?.distance_km != null) setDistanceKm(String(log.actual_performance.distance_km));
        if (log.actual_performance?.benchmark_name) {
          setBenchmarkName(log.actual_performance.benchmark_name);
          setBenchmarkResult(log.actual_performance.result ?? "");
          setBenchmarkNotes(log.actual_performance.notes ?? "");
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id]);

  function patchExercise(name: string, patch: Partial<PerformanceExercise>) {
    setPerfData((prev) => prev.map((ex) => (ex.name !== name ? ex : { ...ex, ...patch })));
  }

  function updateExerciseSet(name: string, setIdx: number, field: keyof SetEntry, value: number) {
    setPerfData((prev) =>
      prev.map((ex) =>
        ex.name !== name ? ex : { ...ex, sets: ex.sets.map((s, j) => (j !== setIdx ? s : { ...s, [field]: value })) }
      )
    );
  }

  async function renameSession(title: string) {
    if (!session) return;
    setSession({ ...session, title });
    await fetch("/api/coach/today", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: session.id, title }),
    });
  }

  const hasLoggableExercises = perfData.length > 0;

  function buildPerformance(): object | null {
    const parts: Record<string, unknown> = {};
    if (hasLoggableExercises) parts.exercises = perfData;
    if (session?.type === "running" && distanceKm) parts.distance_km = Number(distanceKm);
    if (session?.type === "otro" && benchmarkName) {
      parts.benchmark_name = benchmarkName;
      parts.result = benchmarkResult;
      parts.notes = benchmarkNotes;
    }
    return Object.keys(parts).length ? parts : null;
  }

  async function submitLog() {
    if (!session) return;
    setLogSaved(false);
    const res = await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: session.id,
        rpe: Number(rpe),
        sleep_hours: Number(sleepHours),
        pain_flags: painNotes ? { notes: painNotes } : null,
        readiness_notes: readinessNotes,
        actual_performance: buildPerformance(),
        duration_min: durationMin ? Number(durationMin) : null,
        calories: calories ? Number(calories) : null,
      }),
    });
    if (res.ok) {
      setLogSaved(true);
      setEditingLog(false);
      setSession({ ...session, status: "completed" });
    }
  }

  if (session === undefined) return <p className="muted">Cargando…</p>;

  if (session === null) {
    return (
      <div>
        <Link href="/" className="muted" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
          <ArrowLeft size={16} /> Volver
        </Link>
        <p className="muted">Todavía no has generado la sesión de hoy. Vuelve al inicio para generarla.</p>
      </div>
    );
  }

  const showLogForm = session.status !== "completed" || editingLog;

  return (
    <div>
      <Link href="/" className="muted" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
        <ArrowLeft size={16} /> Volver
      </Link>

      <div className="card progress-ring-card" style={{ flexDirection: "column", alignItems: "stretch" }}>
        <div className="exercise-card-header" style={{ marginBottom: 0 }}>
          <EditableTitle title={session.title || TYPE_LABELS[session.type] || session.type} onSave={renameSession} />
          <Badge color={TYPE_COLORS[session.type]}>{TYPE_LABELS[session.type] ?? session.type}</Badge>
        </div>
        <p className="muted" style={{ marginTop: 2 }}>
          {session.date} · Semana {session.week_number}
        </p>

        <div className="progress-ring-tiles">
          <div className="progress-ring-tile">
            <div className="progress-ring-tile-value">
              <Flame size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
              {existingLog?.calories ?? "—"}
            </div>
            <div className="progress-ring-tile-label">kcal</div>
          </div>
          <div className="progress-ring-tile">
            <div className="progress-ring-tile-value">
              <Clock size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
              {existingLog?.duration_min ?? "—"}
            </div>
            <div className="progress-ring-tile-label">min</div>
          </div>
          <div className="progress-ring-tile">
            <div className="progress-ring-tile-value">
              <Activity size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
              {existingLog?.rpe ?? "—"}
            </div>
            <div className="progress-ring-tile-label">RPE</div>
          </div>
        </div>
      </div>

      <div className="card">
        <p className="muted" style={{ marginBottom: 8 }}>
          Marca lo que sí hiciste y captura el peso/tiempo/distancia real. Lo que no hiciste, déjalo sin marcar.
        </p>
        {session.planned_exercises.map((ex, i) => {
          const perf = perfData.find((p) => p.name === ex.name);
          return (
            <ExerciseCard
              key={i}
              ex={ex}
              stats={stats}
              perf={perf}
              onPatch={perf ? (patch) => patchExercise(ex.name, patch) : undefined}
              onUpdateSet={perf ? (setIdx, field, value) => updateExerciseSet(ex.name, setIdx, field, value) : undefined}
            />
          );
        })}
        <Collapsible label="¿Por qué esta sesión?">
          <p className="muted">{session.justification}</p>
        </Collapsible>
      </div>

      {session.status === "completed" && !editingLog && (
        <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p className="muted">Sesión completada y registrada. ¡Buen trabajo!</p>
          <button onClick={() => setEditingLog(true)}>Editar registro</button>
        </div>
      )}

      {showLogForm && (
        <div className="card">
          <h2>{editingLog ? "Editar registro" : "Registrar sesión"}</h2>

          {session.type === "running" && (
            <div className="field">
              <label>Distancia (km)</label>
              <input type="number" step="0.1" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} placeholder="5.0" />
            </div>
          )}

          {session.type === "otro" && (
            <div style={{ marginBottom: 16 }}>
              <div className="field">
                <label>Nombre del benchmark / WOD</label>
                <input value={benchmarkName} onChange={(e) => setBenchmarkName(e.target.value)} placeholder="Ej: Fran, AMRAP 20…" />
              </div>
              <div className="field">
                <label>Resultado</label>
                <input value={benchmarkResult} onChange={(e) => setBenchmarkResult(e.target.value)} placeholder="Ej: 4:32, 12+7" />
              </div>
              <div className="field">
                <label>Notas</label>
                <textarea value={benchmarkNotes} onChange={(e) => setBenchmarkNotes(e.target.value)} rows={2} />
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className="field">
              <label>Duración (min)</label>
              <input type="number" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} placeholder="45" />
            </div>
            <div className="field">
              <label>Calorías (opcional)</label>
              <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="350" />
            </div>
          </div>

          <div className="field">
            <label>RPE (1-10)</label>
            <input value={rpe} onChange={(e) => setRpe(e.target.value)} type="number" min={1} max={10} />
          </div>
          <div className="field">
            <label>Horas de sueño anoche</label>
            <input value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} type="number" min={0} max={14} />
          </div>
          <div className="field">
            <label>Dolor / molestias (opcional)</label>
            <textarea value={painNotes} onChange={(e) => setPainNotes(e.target.value)} rows={2} />
          </div>
          <div className="field">
            <label>Notas (opcional)</label>
            <textarea value={readinessNotes} onChange={(e) => setReadinessNotes(e.target.value)} rows={2} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" onClick={submitLog}>
              {editingLog ? "Actualizar registro" : "Guardar registro"}
            </button>
            {editingLog && <button onClick={() => setEditingLog(false)}>Cancelar</button>}
          </div>
          {logSaved && <p className="muted">Guardado ✓</p>}
        </div>
      )}
    </div>
  );
}
