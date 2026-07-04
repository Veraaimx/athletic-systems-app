"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import { Scale, Target, Activity, Moon, Dumbbell } from "lucide-react";
import { Collapsible } from "@/components/Collapsible";
import { CoachSynthesis } from "@/components/CoachSynthesis";

type Period = "day" | "week" | "month";

interface StatsData {
  activeBlock: { start_date: string; focus_notes: string } | null;
  adherencia: { total: number; completed: number; skipped: number; pct: number | null };
  recentLogs: Array<{ date: string | null; rpe: number | null; sleep_hours: number | null; type: string | null }>;
  liftProgression: Record<
    string,
    Array<{ date: string; unit?: "kg" | "lbs"; sets: Array<{ reps: number; weight: number }> }>
  >;
  liftMonthOverMonth: Record<
    string,
    { change_pct: number | null; this_month_avg: number | null; prev_month_avg: number | null }
  >;
  skippedExercises: Array<{ date: string; exercise: string; reason: string }>;
  benchmarks: Array<{ date: string; name: string; result: string; notes?: string }>;
  weightTrend: Array<{ date: string; weight_kg: number; body_fat_pct?: number }>;
}

function avgOf(vals: (number | null | undefined)[]) {
  const nums = vals.filter((v): v is number => v != null);
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

function Sparkline({ data, dataKey, color }: { data: object[]; dataKey: string; color: string }) {
  if (data.length < 2) return null;
  return (
    <div style={{ height: 36, marginTop: 8 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`spark-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#spark-${dataKey})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function AdherenceRing({ pct }: { pct: number }) {
  const data = [{ value: pct, fill: "var(--accent-primary)" }];
  return (
    <div style={{ width: 56, height: 56, position: "relative" }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          width={56}
          height={56}
          innerRadius="70%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar dataKey="value" background={{ fill: "var(--surface-2)" }} cornerRadius={8} isAnimationActive={false} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.78rem",
          fontWeight: 700,
        }}
      >
        {pct}%
      </div>
    </div>
  );
}

function KpiTile({
  icon: Icon,
  iconColor,
  value,
  label,
  sub,
  subColor,
  sparkData,
  sparkKey,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  iconColor: string;
  value: string;
  label: string;
  sub?: string;
  subColor?: string;
  sparkData?: object[];
  sparkKey?: string;
}) {
  return (
    <div className="kpi-tile">
      <div className="kpi-icon" style={{ background: `${iconColor}22` }}>
        <Icon size={17} color={iconColor} />
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
      {sub && (
        <div className="kpi-sub" style={{ color: subColor ?? "var(--muted)" }}>
          {sub}
        </div>
      )}
      {sparkData && sparkKey && <Sparkline data={sparkData} dataKey={sparkKey} color={iconColor} />}
    </div>
  );
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [period, setPeriod] = useState<Period>("week");

  useEffect(() => {
    fetch(`/api/stats?period=${period}`)
      .then((r) => r.json())
      .then(setStats);
  }, [period]);

  if (!stats) return <p className="muted">Cargando estadísticas…</p>;

  const { adherencia, recentLogs, liftProgression, liftMonthOverMonth, skippedExercises, benchmarks, weightTrend, activeBlock } = stats;

  const latestWeight = weightTrend.at(-1);
  const firstWeight = weightTrend.at(0);
  const weightDelta =
    latestWeight && firstWeight && latestWeight !== firstWeight
      ? +(latestWeight.weight_kg - firstWeight.weight_kg).toFixed(1)
      : null;
  const kgToGoal = latestWeight ? +(latestWeight.weight_kg - 85).toFixed(1) : null;

  const avgRpe = avgOf(recentLogs.map((l) => l.rpe));
  const avgSleep = avgOf(recentLogs.map((l) => l.sleep_hours));

  const weightSparkData = weightTrend.map((w) => ({ v: w.weight_kg }));
  const rpeSparkData = recentLogs.filter((l) => l.rpe != null).map((l) => ({ v: l.rpe }));
  const sleepSparkData = recentLogs.filter((l) => l.sleep_hours != null).map((l) => ({ v: l.sleep_hours }));

  return (
    <div>
      <div className="exercise-card-header" style={{ marginBottom: 4 }}>
        <h1>Estadísticas</h1>
        <div className="energy-picker" style={{ maxWidth: 220 }}>
          {(["day", "week", "month"] as Period[]).map((p) => (
            <button key={p} className={period === p ? "selected" : ""} onClick={() => setPeriod(p)}>
              {p === "day" ? "Día" : p === "week" ? "Semana" : "Mes"}
            </button>
          ))}
        </div>
      </div>
      {activeBlock && (
        <p className="muted" style={{ marginBottom: 16 }}>
          Bloque activo desde {activeBlock.start_date}
        </p>
      )}

      {/* KPI row */}
      <div className="kpi-grid">
        <KpiTile
          icon={Scale}
          iconColor="var(--accent-teal)"
          value={latestWeight ? `${latestWeight.weight_kg}` : "—"}
          label="Peso (kg) · meta 85"
          sub={weightDelta != null ? `${weightDelta > 0 ? "+" : ""}${weightDelta} kg total` : undefined}
          subColor={weightDelta != null ? (weightDelta < 0 ? "var(--accent-green)" : "var(--accent-amber)") : undefined}
          sparkData={weightSparkData.length > 1 ? weightSparkData : undefined}
          sparkKey="v"
        />

        <div className="kpi-tile" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div className="kpi-icon" style={{ background: "var(--accent-primary)22" }}>
            <Target size={17} color="var(--accent-primary)" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 2 }}>
            {adherencia.pct != null ? (
              <AdherenceRing pct={adherencia.pct} />
            ) : (
              <div className="kpi-value">—</div>
            )}
            <div>
              <div className="kpi-label">Adherencia</div>
              <div className="kpi-sub muted">
                {adherencia.completed}/{adherencia.total} sesiones
              </div>
            </div>
          </div>
        </div>

        <KpiTile
          icon={Activity}
          iconColor="var(--accent-pink)"
          value={avgRpe != null ? `${avgRpe}` : "—"}
          label={`RPE promedio · últimos ${recentLogs.length}`}
          sparkData={rpeSparkData.length > 1 ? rpeSparkData : undefined}
          sparkKey="v"
        />

        <KpiTile
          icon={Moon}
          iconColor="var(--accent-blue)"
          value={avgSleep != null ? `${avgSleep}h` : "—"}
          label="Sueño promedio"
          sub={avgSleep != null ? (avgSleep < 7 ? "por debajo de lo ideal" : "bien") : undefined}
          subColor={avgSleep != null && avgSleep < 7 ? "var(--accent-amber)" : "var(--accent-green)"}
          sparkData={sleepSparkData.length > 1 ? sleepSparkData : undefined}
          sparkKey="v"
        />
      </div>

      <CoachSynthesis />

      {/* Peso detalle */}
      <div className="card">
        <h2>Peso</h2>
        {weightTrend.length === 0 ? (
          <p className="muted">Sin datos aún. Registra tu peso en el dashboard.</p>
        ) : (
          <Collapsible label={`Ver historial (${weightTrend.length} registros)`}>
            {weightTrend
              .slice()
              .reverse()
              .map((w) => (
                <div key={w.date} className="exercise-row">
                  <span className="muted">{w.date}</span> — {w.weight_kg} kg
                  {w.body_fat_pct ? ` · ${w.body_fat_pct}% grasa` : ""}
                </div>
              ))}
          </Collapsible>
        )}
      </div>

      {/* Progresión de cargas */}
      <div className="card">
        <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Dumbbell size={17} color="var(--accent-amber)" /> Progresión de cargas
        </h2>
        {Object.keys(liftProgression).length === 0 ? (
          <p className="muted" style={{ marginTop: 8 }}>
            Sin datos aún. Marca lo que hiciste en cada sesión para ver tu progreso aquí.
          </p>
        ) : (
          Object.entries(liftProgression).map(([name, entries]) => {
            const lastEntry = entries[entries.length - 1];
            const lastMax = Math.max(...lastEntry.sets.map((s) => s.weight), 0);
            const liftSpark = entries.map((e) => ({ v: Math.max(...e.sets.map((s) => s.weight)) }));
            const mom = liftMonthOverMonth[name];
            return (
              <div key={name} style={{ marginTop: 12 }}>
                <div className="exercise-card-header">
                  <strong>{name}</strong>
                  <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {mom?.change_pct != null && (
                      <span
                        className="chip"
                        style={{
                          color: mom.change_pct >= 0 ? "var(--accent-green)" : "var(--accent-pink)",
                          fontWeight: 600,
                        }}
                      >
                        {mom.change_pct > 0 ? "↑" : mom.change_pct < 0 ? "↓" : "→"} {Math.abs(mom.change_pct)}% vs mes anterior
                      </span>
                    )}
                    <span className="chip">
                      {lastMax}
                      {lastEntry.unit ?? "kg"} · {entries.length} sesiones
                    </span>
                  </span>
                </div>
                {liftSpark.length > 1 && <Sparkline data={liftSpark} dataKey="v" color="var(--accent-amber)" />}
                <Collapsible label="Ver historial">
                  {entries.map((entry, i) => (
                    <div key={i} className="exercise-row">
                      <span className="muted">{entry.date}</span> —{" "}
                      {entry.sets.map((s) => `${s.weight}${entry.unit ?? "kg"}×${s.reps}`).join(", ")}
                    </div>
                  ))}
                </Collapsible>
              </div>
            );
          })
        )}
      </div>

      {/* Ejercicios saltados */}
      {skippedExercises.length > 0 && (
        <div className="card">
          <h2>Ejercicios que no hiciste</h2>
          <Collapsible label={`Ver detalle (${skippedExercises.length})`}>
            {skippedExercises
              .slice()
              .reverse()
              .map((s, i) => (
                <div key={i} className="exercise-row">
                  <span className="muted">{s.date}</span> — <strong>{s.exercise}</strong>: {s.reason}
                </div>
              ))}
          </Collapsible>
        </div>
      )}

      {/* Benchmarks */}
      {benchmarks.length > 0 && (
        <div className="card">
          <h2>Benchmarks / WODs</h2>
          {benchmarks.map((b, i) => (
            <div key={i} className="exercise-row">
              <p>
                <strong>{b.name}</strong> — {b.result}
              </p>
              <p className="muted">{b.date}{b.notes ? ` · ${b.notes}` : ""}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
