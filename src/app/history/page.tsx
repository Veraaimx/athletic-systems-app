"use client";

import { useEffect, useState } from "react";
import { CoachSynthesis } from "@/components/CoachSynthesis";

interface LoggedExercise {
  name: string;
  done?: boolean;
  skip_reason?: string;
  notes?: string;
}

interface LogRow {
  id: string;
  rpe: number | null;
  sleep_hours: number | null;
  pain_flags: { notes?: string } | null;
  readiness_notes: string | null;
  actual_performance: { exercises?: LoggedExercise[] } | null;
  created_at: string;
  sessions: { date: string; type: string; week_number: number } | null;
}

export default function HistoryPage() {
  const [logs, setLogs] = useState<LogRow[] | null>(null);
  const [adherencePct, setAdherencePct] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/logs")
      .then((res) => res.json())
      .then(setLogs);

    fetch("/api/stats?period=month")
      .then((res) => res.json())
      .then((s) => setAdherencePct(s?.adherencia?.pct ?? null))
      .catch(() => {});
  }, []);

  if (!logs) return <p className="muted">Cargando historial…</p>;

  return (
    <div>
      {adherencePct != null ? (
        <>
          <div className="heading-impact" style={{ fontSize: "2.4rem", marginBottom: 2 }}>{adherencePct}%</div>
          <p className="muted" style={{ marginBottom: 16 }}>Adherencia del bloque activo</p>
        </>
      ) : (
        <h1 style={{ marginBottom: 16 }}>Historial de sesiones</h1>
      )}

      <CoachSynthesis />

      {logs.length === 0 && <p className="muted">Todavía no hay registros.</p>}
      {logs.map((log) => {
        const exercisesWithNotes = (log.actual_performance?.exercises ?? []).filter((ex) => ex.notes);
        return (
          <div key={log.id} className="card">
            <p className="muted">
              {log.sessions?.date} — Semana {log.sessions?.week_number} — {log.sessions?.type}
            </p>
            <p>
              RPE: {log.rpe ?? "—"} · Sueño: {log.sleep_hours ?? "—"}h
            </p>
            {log.pain_flags?.notes && <p className="muted">Dolor: {log.pain_flags.notes}</p>}
            {log.readiness_notes && <p className="muted">{log.readiness_notes}</p>}
            {exercisesWithNotes.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {exercisesWithNotes.map((ex, i) => (
                  <p key={i} className="muted" style={{ marginTop: 2 }}>
                    <strong>{ex.name}:</strong> {ex.notes}
                  </p>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
