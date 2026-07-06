import type { CSSProperties, ReactNode } from "react";

interface ChipProps {
  children: ReactNode;
  style?: CSSProperties;
}

/** Subtle metadata pill — reps, series, secondary counts. Not for CTAs or status. */
export function Chip({ children, style }: ChipProps) {
  return (
    <span className="chip" style={style}>
      {children}
    </span>
  );
}
