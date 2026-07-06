import type { ComponentType, ReactNode } from "react";

interface KpiTileProps {
  icon: ComponentType<{ size?: number; color?: string }>;
  /** Icon tint — use --accent-secondary for category icons, --accent-positive/--accent-attention only when the KPI itself is a value judgment. */
  iconColor: string;
  value: ReactNode;
  label: string;
  sub?: string;
  subColor?: string;
  /** Optional footer content, e.g. a sparkline — kept out of this component so it has no charting-library dependency. */
  children?: ReactNode;
}

export function KpiTile({ icon: Icon, iconColor, value, label, sub, subColor, children }: KpiTileProps) {
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
      {children}
    </div>
  );
}

export function KpiGrid({ children }: { children: ReactNode }) {
  return <div className="kpi-grid">{children}</div>;
}
