import type { CSSProperties, ReactNode } from "react";

interface FieldProps {
  label: string;
  children: ReactNode;
  style?: CSSProperties;
}

/** Label + input group with standard spacing. Native <input>/<textarea> already carry
 * their styling from bare-element selectors in globals.css — no wrapper needed for those. */
export function Field({ label, children, style }: FieldProps) {
  return (
    <div className="field" style={style}>
      <label>{label}</label>
      {children}
    </div>
  );
}
