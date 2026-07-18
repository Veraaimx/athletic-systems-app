"use client";

import { useState, type ReactNode } from "react";

export function Collapsible({
  label,
  children,
  defaultOpen = false,
}: {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="collapsible">
      <button type="button" className="collapsible-trigger" onClick={() => setOpen((o) => !o)}>
        <span>{open ? "▾" : "▸"}</span> {label}
      </button>
      {open && <div className="collapsible-body">{children}</div>}
    </div>
  );
}

export function Badge({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span className="badge">
      {color && <span className="badge-dot" style={{ background: color }} />}
      {children}
    </span>
  );
}

// Paleta de categoría de sesión — deliberadamente separada de la paleta de marca
// (primario ámbar / secundario acero / semántico verde-rojo, ver docs/06-design-system.md
// §2.1) para que una etiqueta de "tipo de sesión" nunca se confunda con un CTA de marca
// o con un juicio de valor positivo/negativo.
export const TYPE_COLORS: Record<string, string> = {
  fuerza: "#64748b",
  running: "#38bdf8",
  yoga: "#a855f7",
  otro: "#2dd4bf",
  descanso: "#475569",
};

export const TYPE_LABELS: Record<string, string> = {
  fuerza: "💪 Fuerza",
  running: "🏃 Running",
  yoga: "🧘 Yoga",
  otro: "⚡ Benchmark",
  descanso: "😴 Descanso",
};
