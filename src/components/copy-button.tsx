"use client";

import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type CopyState = "idle" | "copied" | "failed";

export function CopyButton({
  value,
  children,
  label,
  title,
  className,
}: {
  value: string;
  children: ReactNode;
  label: string;
  title?: string;
  className?: string;
}) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function copy() {
    let outcome: CopyState = "failed";

    try {
      await navigator.clipboard.writeText(value);
      outcome = "copied";
    } catch {
      outcome = "failed";
    }

    setState(outcome);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1200);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      title={title ?? value}
      className={cn(
        "inline-flex items-center px-1 py-1 text-xs font-bold tracking-wider whitespace-nowrap",
        "cursor-pointer transition-colors duration-75",
        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-foreground",
        state === "idle"
          ? "hover:bg-invert hover:text-invert-foreground"
          : "bg-invert text-invert-foreground",
        className,
      )}
    >
      <span aria-hidden>[</span>
      <span aria-live="polite">
        {state === "idle" ? children : state === "copied" ? "copied" : "failed"}
      </span>
      <span aria-hidden>]</span>
    </button>
  );
}
