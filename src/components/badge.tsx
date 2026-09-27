import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "solid" | "outline" | "muted";

const variants: Record<Variant, string> = {
  solid: "border-line bg-invert text-invert-foreground",
  outline: "border-line bg-background text-foreground",
  muted: "border-line-subtle bg-surface text-muted",
};

export function Badge({
  children,
  variant = "outline",
  className,
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusFlag({
  state,
  children,
  className,
}: {
  state: "on" | "off" | "partial";
  children: ReactNode;
  className?: string;
}) {
  const marker = state === "on" ? "[x]" : state === "partial" ? "[~]" : "[ ]";

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", className)}>
      <span aria-hidden className="font-bold">
        {marker}
      </span>
      <span className={state === "off" ? "text-muted" : undefined}>{children}</span>
    </span>
  );
}
