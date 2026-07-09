"use client";

import { useEffect, useRef, type KeyboardEvent, type TextareaHTMLAttributes } from "react";

interface AutoResizeTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "rows"> {
  // Enter submits (calls onEnter); Shift+Enter inserts a newline as usual.
  onEnter?: () => void;
  minRows?: number;
  maxRows?: number;
}

export function AutoResizeTextarea({
  onEnter,
  minRows = 1,
  maxRows = 10,
  value,
  style,
  onKeyDown,
  ...rest
}: AutoResizeTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 20;
    const maxHeight = lineHeight * maxRows;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [value, maxRows]);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.key === "Enter" && !e.shiftKey && onEnter) {
      e.preventDefault();
      onEnter();
    }
  }

  return (
    <textarea
      ref={ref}
      rows={minRows}
      value={value}
      onKeyDown={handleKeyDown}
      style={{ resize: "none", overflow: "hidden", ...style }}
      {...rest}
    />
  );
}
