type LimitGlobal = typeof globalThis & {
  __erensBucketLimits?: Map<string, number[]>;
};

const MAX_KEYS = 4096;

function buckets(): Map<string, number[]> {
  const global = globalThis as LimitGlobal;
  return (global.__erensBucketLimits ??= new Map());
}

export type LimitCheck = { ok: true } | { ok: false; retryAfterMs: number };

export function take(key: string, limit: number, windowMs: number): LimitCheck {
  const now = Date.now();
  const store = buckets();
  const hits = (store.get(key) ?? []).filter((at) => now - at < windowMs);

  if (hits.length >= limit) {
    store.set(key, hits);
    return { ok: false, retryAfterMs: windowMs - (now - hits[0]) };
  }

  hits.push(now);
  store.delete(key);
  store.set(key, hits);

  if (store.size > MAX_KEYS) prune(store, now, windowMs);
  return { ok: true };
}

export function refund(key: string): void {
  const store = buckets();
  const hits = store.get(key);
  if (!hits || hits.length === 0) return;

  hits.pop();
  if (hits.length === 0) store.delete(key);
}

function prune(store: Map<string, number[]>, now: number, windowMs: number) {
  for (const [key, hits] of store) {
    if (hits.every((at) => now - at >= windowMs)) store.delete(key);
  }

  while (store.size > MAX_KEYS) {
    const oldest = store.keys().next().value;
    if (oldest === undefined) break;
    store.delete(oldest);
  }
}

export function clientAddress(headers: {
  get(name: string): string | null;
}): string {
  const forwarded = headers.get("x-forwarded-for");
  if (!forwarded) return "unknown";

  const hops = forwarded
    .split(",")
    .map((hop) => hop.trim())
    .filter(Boolean);

  return hops[hops.length - 1] ?? "unknown";
}
