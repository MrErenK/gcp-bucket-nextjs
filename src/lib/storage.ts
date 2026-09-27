import { createHash, randomUUID, type Hash } from "node:crypto";
import { lookup } from "node:dns/promises";
import {
  link,
  mkdir,
  open,
  readdir,
  rename,
  stat,
  statfs,
  unlink,
  type FileHandle,
} from "node:fs/promises";
import { isIP } from "node:net";
import { join } from "node:path";
import { Readable } from "node:stream";
import { formatBytes } from "@/lib/format";
import { recordFetch } from "@/lib/storage-index";
import {
  ALLOW_PRIVATE,
  MAX_BYTES,
  MIN_BYTES,
  STORAGE_DIR,
  TIMEOUT_MS,
} from "@/lib/upload-config";

const MAX_HOPS = 5;
const MAX_NAME = 116;
const ZIP_MAGIC = ["504b0304", "504b0506", "504b0708"];

const SAFE_NAME = /^[A-Za-z0-9][A-Za-z0-9._+-]*\.zip$/i;

const NOT_ZIP = "that link does not name a .zip file";
const MALICIOUS = "malicious file detected";

const INCOMING_DIR = join(STORAGE_DIR, ".incoming");

const V4_RANGES: ReadonlyArray<readonly [string, number]> = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
];

const V6_RANGES: ReadonlyArray<readonly [string, number]> = [
  ["::", 128],
  ["::1", 128],
  ["64:ff9b::", 96],
  ["100::", 64],
  ["2001:db8::", 32],
  ["2002::", 16],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
];

export type FetchOutcome =
  | { ok: true; file: string; bytes: number; sha256: string }
  | { ok: false; error: string };

export type FetchProgress = {
  received: number;
  total: number | null;
  file: string;
};

export type StoredFile = {
  file: string;
  bytes: number;
  modifiedAt: string;
};

export type StorageState = {
  files: StoredFile[];
  count: number;
  bytes: number;
  free: number | null;
};

class Refused extends Error {}

function ipv4Value(address: string): number | null {
  const parts = address.split(".");
  if (parts.length !== 4) return null;

  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;

    const octet = Number(part);
    if (octet > 255) return null;
    value = value * 256 + octet;
  }

  return value;
}

function hextets(address: string): number[] | null {
  const bare = address.split("%")[0].toLowerCase();
  if (!bare.includes(":")) return null;

  const compressed = bare.includes("::");
  const [left, right] = bare.split("::");
  const head = left ? left.split(":") : [];
  const tail = right ? right.split(":") : [];
  const gap = 8 - head.length - tail.length;

  if (compressed ? gap < 1 : head.length !== 8) return null;

  const groups = [
    ...head,
    ...Array<string>(compressed ? gap : 0).fill("0"),
    ...tail,
  ];

  const parts: number[] = [];
  for (const group of groups) {
    if (!group.includes(".")) {
      if (!/^[0-9a-f]{1,4}$/.test(group)) return null;
      parts.push(Number.parseInt(group, 16));
      continue;
    }

    const embedded = ipv4Value(group);
    if (embedded === null) return null;
    parts.push(embedded >>> 16, embedded & 0xffff);
  }

  return parts.length === 8 ? parts : null;
}

function inV4Range(value: number, base: string, bits: number): boolean {
  const start = ipv4Value(base);
  if (start === null) return false;

  const size = 2 ** (32 - bits);
  return Math.floor(value / size) === Math.floor(start / size);
}

function inV6Range(value: number[], base: string, bits: number): boolean {
  const start = hextets(base);
  if (!start) return false;

  const whole = Math.floor(bits / 16);
  for (let index = 0; index < whole; index += 1) {
    if (value[index] !== start[index]) return false;
  }

  const rest = bits % 16;
  if (rest === 0) return true;

  const mask = (0xffff << (16 - rest)) & 0xffff;
  return (value[whole] & mask) === (start[whole] & mask);
}

function blockedV4(value: number): boolean {
  return V4_RANGES.some(([base, bits]) => inV4Range(value, base, bits));
}

function blockedAddress(address: string): boolean {
  const family = isIP(address);

  if (family === 4) {
    const value = ipv4Value(address);
    return value === null || blockedV4(value);
  }

  if (family === 6) {
    const value = hextets(address);
    if (!value) return true;

    const zero = value.slice(0, 6).every((group) => group === 0);
    const mapped =
      value.slice(0, 5).every((group) => group === 0) && value[5] === 0xffff;
    if (zero || mapped) return blockedV4((value[6] << 16) | value[7]);

    return V6_RANGES.some(([base, bits]) => inV6Range(value, base, bits));
  }

  return true;
}

async function blockedHost(hostname: string): Promise<string | null> {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (isIP(host) === 0 && !host.includes(".")) {
    return "that link points at a name with no domain";
  }

  if (ALLOW_PRIVATE) return null;

  const local = [
    "localhost",
    ".localhost",
    ".local",
    ".internal",
    ".home.arpa",
  ];
  if (local.some((suffix) => host === suffix || host.endsWith(suffix))) {
    return "that link points at a machine-local name";
  }

  if (isIP(host) !== 0) {
    return blockedAddress(host)
      ? `that link points at a private address (${host})`
      : null;
  }

  let addresses: Array<{ address: string }>;
  try {
    addresses = await lookup(host, { all: true });
  } catch {
    return `${host} could not be resolved`;
  }

  if (addresses.length === 0) return `${host} could not be resolved`;

  for (const { address } of addresses) {
    if (blockedAddress(address)) {
      return `that link resolves to a private address (${address})`;
    }
  }

  return null;
}

type Target = { url: URL } | { error: string };

async function resolveTarget(raw: string): Promise<Target> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { error: "that is not a link" };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { error: "only http and https links can be fetched" };
  }

  const blocked = await blockedHost(url.hostname);
  return blocked ? { error: blocked } : { url };
}

function describeFetchError(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return `the source did not answer within ${Math.round(TIMEOUT_MS / 1000)}s`;
    }

    const code = (error.cause as NodeJS.ErrnoException | undefined)?.code;
    if (code === "ENOTFOUND") return "the source host could not be resolved";
    if (code) return `the source could not be reached (${code})`;
  }

  return "the source could not be reached";
}

type Opened = { response: Response; url: URL } | { error: string };

async function openSource(start: URL, stopped: AbortSignal): Promise<Opened> {
  let url = start;

  for (let hop = 0; hop <= MAX_HOPS; hop += 1) {
    let response: Response;

    try {
      response = await fetch(url, {
        redirect: "manual",
        cache: "no-store",
        signal: AbortSignal.any([stopped, AbortSignal.timeout(TIMEOUT_MS)]),
        headers: { accept: "*/*", "user-agent": "erens-bucket" },
      });
    } catch (error) {
      return { error: describeFetchError(error) };
    }

    if (response.status < 300 || response.status >= 400) {
      return { response, url };
    }

    const location = response.headers.get("location");
    await response.body?.cancel();

    if (!location) {
      return {
        error: `the source answered ${response.status} with nowhere to go`,
      };
    }

    let next: URL;
    try {
      next = new URL(location, url);
    } catch {
      return { error: "the source redirected to something that is not a link" };
    }

    const target = await resolveTarget(next.toString());
    if ("error" in target) return { error: `redirect: ${target.error}` };
    url = target.url;
  }

  return { error: `that link redirects more than ${MAX_HOPS} times` };
}

type NameCheck = { name: string } | { error: string };

function checkedName(raw: string): NameCheck {
  const name = raw.trim();

  if (name.length <= 4 || !name.toLowerCase().endsWith(".zip")) {
    return { error: NOT_ZIP };
  }

  if (!SAFE_NAME.test(name)) return { error: MALICIOUS };
  if (name.length - 4 > MAX_NAME) {
    return { error: `that filename is longer than ${MAX_NAME} characters` };
  }

  return { name };
}

function decodeSegment(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function dispositionName(value: string): string | null {
  const extended = value.match(/filename\*\s*=\s*[^']*'[^']*'([^;]+)/i);
  if (extended) {
    try {
      return decodeURIComponent(extended[1].trim());
    } catch {
      return extended[1].trim();
    }
  }

  const plain = value.match(/filename\s*=\s*"([^"]*)"|filename\s*=\s*([^;]+)/i);
  if (!plain) return null;

  return (plain[1] ?? plain[2]).trim();
}

function storageName(url: URL, disposition: string | null): NameCheck {
  const path = url.pathname;

  const fromPath = checkedName(
    decodeSegment(path.slice(path.lastIndexOf("/") + 1)),
  );
  if ("name" in fromPath) return fromPath;
  if (fromPath.error === MALICIOUS) return fromPath;
  if (!disposition) return fromPath;

  const fromHeader = checkedName(dispositionName(disposition) ?? "");
  if ("name" in fromHeader) return fromHeader;
  if (fromHeader.error === MALICIOUS) return fromHeader;

  return fromPath;
}

function zipSignature(chunk: Uint8Array): boolean {
  const magic = Buffer.from(chunk.subarray(0, 4)).toString("hex");
  return ZIP_MAGIC.includes(magic);
}

type Declared = {
  total: number | null;
  type: string | null;
};

function notZip(type: string | null): string {
  return type
    ? `that link served ${type}, not a zip`
    : "that link served something that is not a zip";
}

async function writeBody(
  body: ReadableStream<Uint8Array> | null,
  handle: FileHandle,
  hash: Hash,
  name: string,
  declared: Declared,
  onProgress?: (progress: FetchProgress) => void,
): Promise<number> {
  if (!body) throw new Refused("the source sent no data");

  const source = Readable.fromWeb(body as Parameters<typeof Readable.fromWeb>[0]);

  const head = Buffer.alloc(4);
  let headBytes = 0;
  let bytes = 0;

  for await (const chunk of source) {
    const buffer = Buffer.from(chunk as Uint8Array);

    if (headBytes < 4) {
      const take = Math.min(4 - headBytes, buffer.length);
      buffer.copy(head, headBytes, 0, take);
      headBytes += take;

      if (headBytes === 4 && !zipSignature(head)) {
        throw new Refused(notZip(declared.type));
      }
    }

    bytes += buffer.length;
    if (bytes > MAX_BYTES) {
      throw new Refused(
        `that file is larger than the ${formatBytes(MAX_BYTES)} limit`,
      );
    }

    hash.update(buffer);
    await handle.write(buffer);
    onProgress?.({ received: bytes, total: declared.total, file: name });
  }

  if (bytes === 0) throw new Refused("the source sent no data");
  if (headBytes < 4) throw new Refused(notZip(declared.type));

  if (declared.total !== null && bytes < declared.total) {
    throw new Refused(
      `the source stopped after ${formatBytes(bytes)} of ${formatBytes(declared.total)}`,
    );
  }

  if (bytes < MIN_BYTES) {
    throw new Refused(
      `that file is smaller than the ${formatBytes(MIN_BYTES)} minimum`,
    );
  }

  return bytes;
}

async function publish(tempPath: string, destination: string): Promise<void> {
  try {
    await link(tempPath, destination);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "EEXIST") throw error;

    if (code === "ENOTSUP" || code === "EPERM" || code === "EXDEV") {
      await rename(tempPath, destination);
      return;
    }

    throw error;
  }

  await unlink(tempPath);
}

export async function fetchIntoStorage(
  rawUrl: string,
  stopped: AbortSignal,
  onProgress?: (progress: FetchProgress) => void,
): Promise<FetchOutcome> {
  const input = rawUrl.trim();
  if (!input) return { ok: false, error: "a link is required" };
  if (input.length > 2048) return { ok: false, error: "that link is too long" };

  const target = await resolveTarget(input);
  if ("error" in target) return { ok: false, error: target.error };

  const opened = await openSource(target.url, stopped);
  if ("error" in opened) return { ok: false, error: opened.error };

  const { response, url } = opened;

  if (!response.ok) {
    await response.body?.cancel();
    return { ok: false, error: `the source answered ${response.status}` };
  }

  const encoded = response.headers.has("content-encoding");
  const length = Number(response.headers.get("content-length") ?? "");
  const declared: Declared = {
    total:
      !encoded && Number.isFinite(length) && length > 0 ? length : null,
    type:
      (response.headers.get("content-type") ?? "")
        .split(";")[0]
        .trim()
        .toLowerCase() || null,
  };

  const named = storageName(url, response.headers.get("content-disposition"));
  if ("error" in named) {
    await response.body?.cancel();
    return { ok: false, error: named.error };
  }

  const name = named.name;
  const destination = join(/*turbopackIgnore: true*/ STORAGE_DIR, name);

  const taken = await stat(destination).then(
    () => true,
    () => false,
  );
  if (taken) {
    await response.body?.cancel();
    return { ok: false, error: `${name} is already in storage` };
  }

  if (declared.total !== null && declared.total > MAX_BYTES) {
    await response.body?.cancel();
    return {
      ok: false,
      error: `that file is larger than the ${formatBytes(MAX_BYTES)} limit`,
    };
  }

  if (declared.total !== null && declared.total < MIN_BYTES) {
    await response.body?.cancel();
    return {
      ok: false,
      error: `that file is smaller than the ${formatBytes(MIN_BYTES)} minimum`,
    };
  }

  onProgress?.({ received: 0, total: declared.total, file: name });

  await mkdir(INCOMING_DIR, { recursive: true });

  const tempPath = join(INCOMING_DIR, `${randomUUID()}.part`);
  const handle = await open(tempPath, "wx", 0o644);
  const hash = createHash("sha256");
  let bytes = 0;

  try {
    bytes = await writeBody(
      response.body,
      handle,
      hash,
      name,
      declared,
      onProgress,
    );
    await handle.sync();
  } catch (error) {
    await handle.close().catch(() => undefined);
    await unlink(tempPath).catch(() => undefined);

    return {
      ok: false,
      error: error instanceof Refused ? error.message : describeFetchError(error),
    };
  }

  await handle.close();

  try {
    await publish(tempPath, destination);
  } catch (error) {
    await unlink(tempPath).catch(() => undefined);

    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      return { ok: false, error: `${name} is already in storage` };
    }

    return { ok: false, error: "the file could not be moved into storage" };
  }

  const sha256 = hash.digest("hex");
  await recordFetch(name, { bytes, sha256 }).catch(() => undefined);

  return { ok: true, file: name, bytes, sha256 };
}

export async function listStored(): Promise<StoredFile[]> {
  let entries;
  try {
    entries = await readdir(/*turbopackIgnore: true*/ STORAGE_DIR, {
      withFileTypes: true,
    });
  } catch {
    return [];
  }

  const files: StoredFile[] = [];
  for (const entry of entries) {
    if (!entry.isFile() || entry.name.startsWith(".")) continue;
    if (!entry.name.toLowerCase().endsWith(".zip")) continue;

    const path = join(/*turbopackIgnore: true*/ STORAGE_DIR, entry.name);
    const info = await stat(path).catch(() => null);
    if (!info) continue;

    files.push({
      file: entry.name,
      bytes: info.size,
      modifiedAt: info.mtime.toISOString(),
    });
  }

  return files.sort((left, right) =>
    right.modifiedAt.localeCompare(left.modifiedAt),
  );
}

export async function freeBytes(): Promise<number | null> {
  try {
    const info = await statfs(STORAGE_DIR);
    return Number(info.bavail) * Number(info.bsize);
  } catch {
    return null;
  }
}

export async function storageState(): Promise<StorageState> {
  const files = await listStored();

  return {
    files,
    count: files.length,
    bytes: files.reduce((total, file) => total + file.bytes, 0),
    free: await freeBytes(),
  };
}
