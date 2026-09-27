import { randomUUID } from "node:crypto";
import { formatBytes } from "@/lib/format";
import type { JobView } from "@/lib/job-view";
import { refund } from "@/lib/rate-limit";
import { fetchIntoStorage, freeBytes } from "@/lib/storage";
import {
  MAX_ACTIVE,
  MAX_PER_ADDRESS,
  MAX_QUEUE,
  MIN_FREE_BYTES,
} from "@/lib/upload-config";

type Job = Omit<JobView, "mine"> & {
  url: string;
  address: string;
  canceled: boolean;
  controller: AbortController | null;
};

type QueueState = { jobs: Map<string, Job>; order: string[] };

type QueueGlobal = typeof globalThis & { __erensBucketJobs?: QueueState };

const KEEP_FINISHED = 40;

function store(): QueueState {
  const global = globalThis as QueueGlobal;
  return (global.__erensBucketJobs ??= { jobs: new Map(), order: [] });
}

export type QueueResult = { ok: true; id: string } | { ok: false; error: string };

export type CancelResult = { ok: true } | { ok: false; error: string };

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "--";
  }
}

function waiting(job: Job): boolean {
  return job.state === "queued" || job.state === "fetching";
}

export async function queueJob(input: {
  url: string;
  address: string;
}): Promise<QueueResult> {
  const state = store();
  let queued = 0;
  let mine = 0;

  for (const job of state.jobs.values()) {
    if (job.state === "queued") queued += 1;
    if (job.address === input.address && waiting(job)) mine += 1;
  }

  if (queued >= MAX_QUEUE) {
    return { ok: false, error: "the queue is full -- try again in a few minutes" };
  }

  if (mine >= MAX_PER_ADDRESS) {
    return {
      ok: false,
      error: `${MAX_PER_ADDRESS} links from this address are already waiting`,
    };
  }

  const free = await freeBytes();
  if (free !== null && free < MIN_FREE_BYTES) {
    return {
      ok: false,
      error: `storage has less than ${formatBytes(MIN_FREE_BYTES)} free`,
    };
  }

  const job: Job = {
    id: randomUUID().slice(0, 8),
    host: hostOf(input.url),
    file: null,
    state: "queued",
    received: 0,
    total: null,
    bytes: null,
    sha256: null,
    error: null,
    queuedAt: Date.now(),
    startedAt: null,
    endedAt: null,
    position: queued + 1,
    url: input.url,
    address: input.address,
    canceled: false,
    controller: null,
  };

  state.jobs.set(job.id, job);
  state.order.push(job.id);
  prune();
  void pump();

  return { ok: true, id: job.id };
}

export function cancelJob(id: string, address: string): CancelResult {
  const job = store().jobs.get(id);

  if (!job) return { ok: false, error: "that job is not tracked" };
  if (job.address !== address) {
    return { ok: false, error: "that job belongs to another address" };
  }
  if (!waiting(job)) return { ok: false, error: "that job already finished" };

  if (job.state === "queued") {
    job.state = "canceled";
    job.endedAt = Date.now();
    refund(job.address);
    return { ok: true };
  }

  job.canceled = true;
  job.controller?.abort();
  return { ok: true };
}

async function runJob(id: string): Promise<void> {
  const state = store();
  const job = state.jobs.get(id);
  if (!job || job.state !== "queued") return;

  job.state = "fetching";
  job.startedAt = Date.now();
  job.position = null;

  const control = new AbortController();
  job.controller = control;

  try {
    const outcome = await fetchIntoStorage(
      job.url,
      control.signal,
      (progress) => {
        job.file = progress.file;
        job.received = progress.received;
        if (progress.total !== null) job.total = progress.total;
      },
    );

    if (outcome.ok) {
      job.state = "done";
      job.file = outcome.file;
      job.bytes = outcome.bytes;
      job.sha256 = outcome.sha256;
      job.received = outcome.bytes;
      job.total = outcome.bytes;
      job.error = null;
    } else if (job.canceled) {
      job.state = "canceled";
      job.error = null;
    } else {
      job.state = "failed";
      job.error = outcome.error;
    }
  } catch (error) {
    if (job.canceled) {
      job.state = "canceled";
      job.error = null;
    } else {
      job.state = "failed";
      job.error =
        error instanceof Error ? error.message : "the fetch stopped unexpectedly";
    }
  }

  job.controller = null;
  job.endedAt = Date.now();
  if (job.state !== "done") refund(job.address);

  await pump();
}

export async function pump(): Promise<void> {
  const state = store();
  let fetching = 0;
  const pending: Job[] = [];

  for (const id of state.order) {
    const job = state.jobs.get(id);
    if (!job) continue;

    if (job.state === "fetching") fetching += 1;
    else if (job.state === "queued") pending.push(job);
  }

  pending.forEach((job, index) => {
    job.position = index + 1;
  });

  const slots = Math.max(0, MAX_ACTIVE - fetching);
  await Promise.all(pending.slice(0, slots).map((job) => runJob(job.id)));
}

function prune(): void {
  const state = store();
  const finished: string[] = [];

  for (const id of state.order) {
    const job = state.jobs.get(id);
    if (!job || !waiting(job)) finished.push(id);
  }

  const drop = new Set(
    finished.slice(0, Math.max(0, finished.length - KEEP_FINISHED)),
  );
  if (drop.size === 0) return;

  for (const id of drop) state.jobs.delete(id);
  state.order = state.order.filter((id) => !drop.has(id));
}

function group(job: Job): number {
  if (job.state === "queued") return 0;
  return job.state === "fetching" ? 1 : 2;
}

function compareJobs(left: Job, right: Job): number {
  const diff = group(left) - group(right);
  if (diff !== 0) return diff;
  if (group(left) === 2) return (right.endedAt ?? 0) - (left.endedAt ?? 0);

  return left.queuedAt - right.queuedAt;
}

function viewOf(job: Job, viewer?: string): JobView {
  return {
    id: job.id,
    host: job.host,
    file: job.file,
    state: job.state,
    received: job.received,
    total: job.total,
    bytes: job.bytes,
    sha256: job.sha256,
    error: job.error,
    queuedAt: job.queuedAt,
    startedAt: job.startedAt,
    endedAt: job.endedAt,
    position: job.position,
    mine: viewer !== undefined && job.address === viewer,
  };
}

export function listJobs(viewer?: string): JobView[] {
  const state = store();

  return state.order
    .map((id) => state.jobs.get(id))
    .filter((job): job is Job => job !== undefined)
    .sort(compareJobs)
    .map((job) => viewOf(job, viewer));
}

export function getJob(id: string): JobView | null {
  const job = store().jobs.get(id);
  return job ? viewOf(job) : null;
}

export async function jobFeed(
  viewer?: string,
): Promise<{ now: number; jobs: JobView[] }> {
  return { now: Date.now(), jobs: listJobs(viewer) };
}
