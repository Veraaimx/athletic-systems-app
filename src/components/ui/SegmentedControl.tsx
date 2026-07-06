import type { CSSProperties, ReactNode } from "react";

interface SegmentedOption<T extends string | number> {
  value: T;
  label: ReactNode;
}

interface SegmentedControlProps<T extends string | number> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: CSSProperties;
}

/** Single-select segmented control — used for energy (1-5) and period (day/week/month) pickers. */
export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  style,
}: SegmentedControlProps<T>) {
  return (
    <div className="energy-picker" style={style}>
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          className={opt.value === value ? "selected" : ""}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
