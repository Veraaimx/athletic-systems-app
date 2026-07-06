import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";

interface CardProps {
  children: ReactNode;
  /** Renders the card as a Next.js Link when provided. */
  href?: string;
  onClick?: () => void;
  style?: CSSProperties;
}

/** Base surface for grouped content — cards, KPI groups, chat panels. */
export function Card({ children, href, onClick, style }: CardProps) {
  if (href) {
    return (
      <Link href={href} className="card" style={{ display: "block", ...style }}>
        {children}
      </Link>
    );
  }
  return (
    <div className="card" onClick={onClick} style={onClick ? { cursor: "pointer", ...style } : style}>
      {children}
    </div>
  );
}
