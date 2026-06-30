"use client";

import { useEffect, useState } from "react";

interface LogRow {
  id: string;
  rpe: number | null;
  sleep_hours: number | null;
  pain_flags: { notes?: string } | null;
  readiness_notes: string | null;
  created_at: string;
  sessions: { date: string; type: string; week_number: number } | null;
}

export default function HistoryPage() {
  const [logs, setLogs] = useState<LogRow[] | null>(null);

  useEffect(() => {
    fetch("/api/logs")
      .then((res) => res.json())
      .then(setLogs);
  }, []);

  if (!logs) return <p className="muted">Cargando historial…</p>;

  return (
    <div>
      <h1>Historial de sesiones</h1>
      {logs.length === 0 && <p className="muted">Todavía no hay registros.</p>}
      {logs.map((log) => (
        <div key={log.id} className="card">
          <p className="muted">
            {log.sessions?.date} — Semana {log.sessions?.week_number} — {log.sessions?.type}
          </p>
          <p>
            RPE: {log.rpe ?? "—"} · Sueño: {log.sleep_hours ?? "—"}h
          </p>
          {log.pain_flags?.notes && <p className="muted">Dolor: {log.pain_flags.notes}</p>}
          {log.readiness_notes && <p className="muted">{log.readiness_notes}</p>}
        </div>
      ))}
    </div>
  );
}
