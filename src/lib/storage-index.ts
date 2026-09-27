import {
  mkdir,
  readFile,
  readdir,
  rename,
  unlink,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { STORAGE_DIR } from "@/lib/upload-config";

export type FileRecord = {
  sha256: string | null;
  bytes: number | null;
  addedAt: string | null;
  downloads: number;
};

type RawEntry = {
  sha256?: unknown;
  bytes?: unknown;
  addedAt?: unknown;
  downloads?: unknown;
};

const INDEX_DIR = join(process.cwd(), "data");
const INDEX_PATH = join(INDEX_DIR, "storage.json");

let queue: Promise<void> = Promise.resolve();

function serialize(task: () => Promise<void>): Promise<void> {
  const next = queue.then(task, task);
  queue = next.catch(() => undefined);
  return next;
}

function string(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

function count(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 0;
}

function toRecord(entry: RawEntry): FileRecord {
  const sha256 = string(entry.sha256);

  return {
    sha256: sha256 && /^[0-9a-f]{64}$/.test(sha256) ? sha256 : null,
    bytes:
      typeof entry.bytes === "number" && Number.isFinite(entry.bytes)
        ? entry.bytes
        : null,
    addedAt: string(entry.addedAt),
    downloads: count(entry.downloads),
  };
}

async function readRaw(): Promise<Record<string, RawEntry>> {
  let raw: string;

  try {
    raw = await readFile(INDEX_PATH, "utf8");
  } catch {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    const files = (parsed as { files?: unknown }).files;
    if (!files || typeof files !== "object" || Array.isArray(files)) return {};

    return files as Record<string, RawEntry>;
  } catch {
    return {};
  }
}

function render(files: Record<string, RawEntry>): string {
  const lines = Object.keys(files)
    .sort((left, right) => left.localeCompare(right))
    .map((name) => `    ${JSON.stringify(name)}: ${JSON.stringify(files[name])}`);

  if (lines.length === 0) return `{\n  "files": {}\n}\n`;

  return `{\n  "files": {\n${lines.join(",\n")}\n  }\n}\n`;
}

async function update(mutate: (files: Record<string, RawEntry>) => void): Promise<void> {
  await serialize(async () => {
    const files = await readRaw();
    mutate(files);

    await mkdir(INDEX_DIR, { recursive: true });
    const temp = `${INDEX_PATH}.${process.pid}.tmp`;

    try {
      await writeFile(temp, render(files), "utf8");
      await rename(temp, INDEX_PATH);
    } catch (error) {
      await unlink(temp).catch(() => undefined);
      throw error;
    }
  });
}

async function storedNames(): Promise<Set<string> | null> {
  try {
    const entries = await readdir(/*turbopackIgnore: true*/ STORAGE_DIR, {
      withFileTypes: true,
    });

    return new Set(entries.filter((entry) => entry.isFile()).map((entry) => entry.name));
  } catch {
    return null;
  }
}

export async function readIndex(): Promise<Map<string, FileRecord>> {
  const raw = await readRaw();
  const index = new Map<string, FileRecord>();

  for (const [name, entry] of Object.entries(raw)) {
    index.set(name, toRecord(entry));
  }

  return index;
}

export async function recordFetch(
  name: string,
  file: { bytes: number; sha256: string },
): Promise<void> {
  const present = await storedNames();

  await update((files) => {
    if (present) {
      for (const known of Object.keys(files)) {
        if (!present.has(known)) delete files[known];
      }
    }

    files[name] = {
      ...files[name],
      sha256: file.sha256,
      bytes: file.bytes,
      addedAt: new Date().toISOString(),
    };
  });
}

export async function countDownload(name: string): Promise<void> {
  await update((files) => {
    const entry = files[name] ?? {};
    files[name] = { ...entry, downloads: count(entry.downloads) + 1 };
  });
}
