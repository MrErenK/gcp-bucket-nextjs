import { cn } from "@/lib/cn";

export function Meter({
  value,
  max,
  width = 24,
  label,
  className,
}: {
  value: number;
  max: number;
  width?: number;
  label: string;
  className?: string;
}) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const filled = Math.round(ratio * width);

  return (
    <span
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
      className={cn("tabular-nums", className)}
    >
      <span aria-hidden>
        [{`${"#".repeat(filled)}${"-".repeat(width - filled)}`}]
      </span>
    </span>
  );
}
