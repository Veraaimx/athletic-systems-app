"use client";

import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Synthesis {
  id: string;
  created_at: string;
  period_start: string;
  period_end: string;
  findings: string[];
  recommendations: string[];
}

export function CoachSynthesis() {
  const [synthesis, setSynthesis] = useState<Synthesis | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/coach/synthesis")
      .then((r) => r.json())
      .then((d) => setSynthesis(d && Array.isArray(d.findings) ? d : null))
      .catch(() => setSynthesis(null));
  }, []);

  async function generate() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/coach/synthesis", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo generar la síntesis.");
      return;
    }
    setSynthesis(data);
  }

  return (
    <Card>
      <div className="exercise-card-header">
        <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Lightbulb size={17} color="var(--accent-secondary)" /> Síntesis del coach
        </h2>
        <Button onClick={generate} disabled={loading}>
          {loading ? "Generando…" : synthesis ? "Actualizar" : "Generar síntesis"}
        </Button>
      </div>

      {error && <p className="muted">{error}</p>}

      {synthesis === undefined ? (
        <p className="muted">Cargando…</p>
      ) : !synthesis ? (
        <p className="muted">
          Todavía no hay una síntesis generada. Genera una para ver hallazgos y recomendaciones sobre
          tus últimas sesiones.
        </p>
      ) : (
        <>
          <p className="muted" style={{ marginBottom: 8 }}>
            {synthesis.period_start} — {synthesis.period_end}
          </p>

          <h3>Hallazgos</h3>
          {synthesis.findings.length === 0 ? (
            <p className="muted">Sin hallazgos suficientes todavía.</p>
          ) : (
            <ul>
              {synthesis.findings.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          )}

          <h3>Recomendaciones</h3>
          {synthesis.recommendations.length === 0 ? (
            <p className="muted">Sin recomendaciones todavía.</p>
          ) : (
            <ul>
              {synthesis.recommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </Card>
  );
}
