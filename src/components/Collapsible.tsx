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
    <span className="badge" style={color ? { background: color } : undefined}>
      {children}
    </span>
  );
}

export const TYPE_COLORS: Record<string, string> = {
  fuerza: "#4a9eff",
  running: "#22c55e",
  yoga: "#a855f7",
  otro: "#f59e0b",
};

export const TYPE_LABELS: Record<string, string> = {
  fuerza: "💪 Fuerza",
  running: "🏃 Running",
  yoga: "🧘 Yoga",
  otro: "⚡ Benchmark",
};
