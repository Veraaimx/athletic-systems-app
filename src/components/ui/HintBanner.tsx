import type { ReactNode } from "react";

/** Attention-colored callout — reserved for "this needs a look", never decorative. */
export function HintBanner({ children }: { children: ReactNode }) {
  return <div className="hint-banner">{children}</div>;
}
