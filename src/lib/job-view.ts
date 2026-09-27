import { formatBytes, formatDuration } from "@/lib/format";

export type JobState = "queued" | "fetching" | "done" | "failed" | "canceled";

export type JobView = {
  id: string;
  host: string;
  file: string | null;
  state: JobState;
  received: number;
  total: number | null;
  bytes: number | null;
  sha256: string | null;
  error: string | null;
  queuedAt: number;
  startedAt: number | null;
  endedAt: number | null;
  position: number | null;
  mine: boolean;
};

export function isActive(job: JobView): boolean {
  return job.state === "queued" || job.state === "fetching";
}

export function jobMarker(job: JobView): string {
  switch (job.state) {
    case "queued":
      return "[ ]";
    case "fetching":
      return "[~]";
    case "done":
      return "[x]";
    case "failed":
      return "[!]";
    case "canceled":
      return "[-]";
  }
}

export function jobStateLabel(job: JobView): string {
  switch (job.state) {
    case "queued":
      return job.position === null ? "queued" : `queued #${job.position}`;
    case "fetching":
      return "fetching";
    case "done":
      return "stored";
    case "failed":
      return "failed";
    case "canceled":
      return "canceled";
  }
}

export function jobProgressText(job: JobView): string {
  const received = formatBytes(job.received) ?? "0 B";
  if (job.state === "done") return formatBytes(job.bytes) ?? received;
  if (job.total === null) return received;

  return `${received} / ${formatBytes(job.total)}`;
}

export function jobPercent(job: JobView): number | null {
  if (job.state === "done") return 100;
  if (job.total === null || job.total <= 0) return null;

  return Math.min(100, Math.floor((job.received / job.total) * 100));
}

export function jobAge(job: JobView, now: number): string {
  const end = job.endedAt ?? now;
  return formatDuration(end - (job.startedAt ?? job.queuedAt));
}
