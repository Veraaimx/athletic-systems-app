import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** "primary" is the single high-emphasis CTA per screen — amber gradient + glow. */
  variant?: "default" | "primary";
}

export function Button({ variant = "default", className, ...props }: ButtonProps) {
  const classes = [variant === "primary" ? "btn-primary" : "", className].filter(Boolean).join(" ");
  return <button className={classes || undefined} {...props} />;
}
