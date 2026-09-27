const UNITS = ["B", "KB", "MB", "GB", "TB"];

export const ABSENT = "--";

export function formatBytes(bytes: number | null): string | null {
  if (bytes === null || !Number.isFinite(bytes) || bytes < 0) return null;

  let value = bytes;
  let unit = 0;

  while (value >= 1000 && unit < UNITS.length - 1) {
    value /= 1000;
    unit += 1;
  }

  const digits = unit === 0 ? 0 : value < 10 ? 2 : 1;
  return `${value.toFixed(digits)} ${UNITS[unit]}`;
}

export function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}

export function formatAge(days: number): string {
  if (days <= 0) return "today";
  if (days < 30) return `+${days}d`;
  if (days < 365) return `+${Math.floor(days / 30)}mo`;
  return `+${(days / 365).toFixed(1)}y`;
}

export function formatDuration(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m${String(seconds % 60).padStart(2, "0")}s`;

  const hours = Math.floor(minutes / 60);
  return `${hours}h${String(minutes % 60).padStart(2, "0")}m`;
}
