function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const STORAGE_DIR = process.env.STORAGE_DIR?.trim() || "/storage/roms";

export const DOWNLOAD_BASE_URL = (process.env.DOWNLOAD_BASE_URL ?? "")
  .trim()
  .replace(/\/+$/, "");

export const MAX_BYTES = positiveInt(
  process.env.UPLOAD_MAX_BYTES,
  5_000_000_000,
);

export const MIN_BYTES = positiveInt(
  process.env.UPLOAD_MIN_BYTES,
  512_000_000,
);

export const TIMEOUT_MS = positiveInt(
  process.env.UPLOAD_TIMEOUT_MS,
  15 * 60_000,
);

export const ALLOW_PRIVATE = process.env.UPLOAD_ALLOW_PRIVATE === "1";

export const MIN_FREE_BYTES = positiveInt(
  process.env.UPLOAD_MIN_FREE_BYTES,
  1024 ** 3,
);

export const RATE_LIMIT = positiveInt(process.env.UPLOAD_RATE_LIMIT, 10);

export const RATE_WINDOW_MS = positiveInt(
  process.env.UPLOAD_RATE_WINDOW_MS,
  60 * 60_000,
);

export const MAX_ACTIVE = positiveInt(process.env.UPLOAD_MAX_ACTIVE, 3);

export const MAX_QUEUE = positiveInt(process.env.UPLOAD_MAX_QUEUE, 12);

export const MAX_PER_ADDRESS = positiveInt(
  process.env.UPLOAD_MAX_PER_ADDRESS,
  2,
);

export function rateLimitLabel(): string {
  const minutes = Math.round(RATE_WINDOW_MS / 60_000);
  if (minutes >= 60 && minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${RATE_LIMIT} per ${hours === 1 ? "hour" : `${hours} hours`}`;
  }

  return `${RATE_LIMIT} per ${minutes === 1 ? "minute" : `${minutes} min`}`;
}
