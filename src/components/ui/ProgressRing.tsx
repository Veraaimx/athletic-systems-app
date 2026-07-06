import type { ComponentType, CSSProperties, ReactNode } from "react";

export function ProgressRingTiles({ children }: { children: ReactNode }) {
  return <div className="progress-ring-tiles">{children}</div>;
}

interface ProgressRingTileProps {
  icon: ComponentType<{ size?: number; style?: CSSProperties }>;
  value: ReactNode;
  label: string;
}

/** Compact 3-column companion to KpiTile — same visual language, used in the dashboard hero. */
export function ProgressRingTile({ icon: Icon, value, label }: ProgressRingTileProps) {
  return (
    <div className="progress-ring-tile">
      <div className="progress-ring-tile-value">
        <Icon size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
        {value}
      </div>
      <div className="progress-ring-tile-label">{label}</div>
    </div>
  );
}
