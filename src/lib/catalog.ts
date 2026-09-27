import {
  ROM_RELEASES,
  ROM_VARIANTS,
  type RomRelease,
  type RomVariant,
} from "@/lib/rom-filename";
import type { Rom } from "@/lib/roms";
import { matchesSearch, normalizeSearchText } from "@/lib/search";

export const PAGE_SIZE = 30;
export const OUTDATED_AFTER_DAYS = 365;
export const SEARCH_DEBOUNCE_MS = 300;
export const ALL = "all";

export type StatusFilter = "current" | "outdated" | typeof ALL;

export type SortKey =
  | "built"
  | "name"
  | "version"
  | "device"
  | "size"
  | "downloads";

export type SortDir = "asc" | "desc";

export const SORT_KEYS: readonly SortKey[] = [
  "built",
  "name",
  "version",
  "device",
  "size",
  "downloads",
];

export const DEFAULT_SORT: SortKey = "built";

export function defaultDir(sort: SortKey): SortDir {
  return sort === "name" || sort === "device" ? "asc" : "desc";
}

export type SortStep = { sort: SortKey; dir: SortDir } | null;

export function nextSortStep(
  query: Pick<CatalogQuery, "sort" | "dir">,
  key: SortKey,
): SortStep {
  const natural = defaultDir(key);

  if (query.sort !== key) return { sort: key, dir: natural };
  if (query.dir === natural) {
    return { sort: key, dir: natural === "asc" ? "desc" : "asc" };
  }

  return null;
}

export function sortHref(
  query: CatalogQuery,
  step: SortStep,
  basePath = "/",
): string {
  return catalogHref(
    { ...query, page: 1, sort: step?.sort, dir: step?.dir },
    basePath,
  );
}

export type CatalogQuery = {
  q: string;
  device: string;
  variant: RomVariant | typeof ALL;
  release: RomRelease | typeof ALL;
  status: StatusFilter;
  sort: SortKey;
  dir: SortDir;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseCatalogQuery(params: RawParams): CatalogQuery {
  const variant = first(params.variant);
  const release = first(params.release);
  const status = first(params.status);
  const sort = first(params.sort);
  const dir = first(params.dir);
  const page = Number.parseInt(first(params.page) ?? "", 10);

  const sortKey = SORT_KEYS.includes(sort as SortKey)
    ? (sort as SortKey)
    : DEFAULT_SORT;

  return {
    q: (first(params.q) ?? "").slice(0, 120),
    device: (first(params.device) ?? ALL).slice(0, 40),
    variant: ROM_VARIANTS.includes(variant as RomVariant)
      ? (variant as RomVariant)
      : ALL,
    release: ROM_RELEASES.includes(release as RomRelease)
      ? (release as RomRelease)
      : ALL,
    status: status === "current" || status === "outdated" ? status : ALL,
    sort: sortKey,
    dir: dir === "asc" || dir === "desc" ? dir : defaultDir(sortKey),
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export function catalogHref(input: Partial<CatalogQuery>, basePath = "/"): string {
  const params = new URLSearchParams();
  const q = input.q?.trim();
  const sort = input.sort ?? DEFAULT_SORT;
  const dir = input.dir ?? defaultDir(sort);

  if (q) params.set("q", q);
  if (input.device && input.device !== ALL) params.set("device", input.device);
  if (input.variant && input.variant !== ALL) params.set("variant", input.variant);
  if (input.release && input.release !== ALL) params.set("release", input.release);
  if (input.status && input.status !== ALL) params.set("status", input.status);
  if (sort !== DEFAULT_SORT || dir !== defaultDir(DEFAULT_SORT)) {
    params.set("sort", sort);
    params.set("dir", dir);
  }
  if (input.page && input.page > 1) params.set("page", String(input.page));

  const search = params.toString();
  return search ? `${basePath}?${search}` : basePath;
}

export function catalogCanonical(query: CatalogQuery): string | null {
  if (query.q) return null;

  return catalogHref({ device: query.device });
}

export type CatalogFilters = Partial<
  Pick<CatalogQuery, "q" | "device" | "variant" | "release" | "status">
>;

export function filtersHref(query: CatalogFilters, basePath = "/"): string {
  return catalogHref(
    {
      q: query.q,
      device: query.device,
      variant: query.variant,
      release: query.release,
      status: query.status,
    },
    basePath,
  );
}

export function daysSince(iso: string | null, now: Date): number | null {
  if (!iso) return null;

  const then = Date.parse(`${iso}T00:00:00Z`);
  if (!Number.isFinite(then)) return null;

  return Math.floor((now.getTime() - then) / 86_400_000);
}

export function isOutdated(builtAt: string | null, now: Date): boolean {
  const days = daysSince(builtAt, now);
  return days !== null && days > OUTDATED_AFTER_DAYS;
}

export function romSearchText(rom: Rom): string {
  const builtAt = rom.builtAt;

  return normalizeSearchText(
    [
      rom.name,
      rom.version ?? "",
      rom.revision ?? "",
      rom.device ?? "",
      rom.variant,
      rom.release,
      rom.image,
      builtAt ?? "",
      builtAt ? builtAt.replace(/-/g, "") : "",
      rom.builtTime ?? "",
      ...rom.flags,
      rom.sha256 ?? "",
      rom.file,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

export function matchesFilters(
  rom: Rom,
  query: CatalogQuery,
  now: Date,
): boolean {
  if (query.device !== ALL && rom.device !== query.device) return false;
  if (query.variant !== ALL && rom.variant !== query.variant) return false;
  if (query.release !== ALL && rom.release !== query.release) return false;

  if (query.status !== ALL) {
    const outdated = isOutdated(rom.builtAt, now);
    if (query.status === "outdated" ? !outdated : outdated) return false;
  }

  return matchesSearch(romSearchText(rom), query.q);
}

function sortValue(key: SortKey, rom: Rom): string | number | null {
  switch (key) {
    case "name":
      return rom.name;
    case "version":
      return rom.version;
    case "device":
      return rom.device;
    case "built":
      return rom.builtAt ? `${rom.builtAt} ${rom.builtTime ?? "00:00"}` : null;
    case "size":
      return rom.sizeBytes;
    case "downloads":
      return rom.downloads;
  }
}

function compareRoms(sort: SortKey, dir: SortDir) {
  return (left: Rom, right: Rom): number => {
    const a = sortValue(sort, left);
    const b = sortValue(sort, right);

    if (a === null || b === null) {
      if (a !== b) return a === null ? 1 : -1;
    } else {
      const order =
        typeof a === "number" && typeof b === "number"
          ? a - b
          : String(a).localeCompare(String(b), undefined, { numeric: true });

      if (order) return dir === "asc" ? order : -order;
    }

    return (
      left.name.localeCompare(right.name) ||
      (left.device ?? "").localeCompare(right.device ?? "")
    );
  };
}

export type CatalogPage = {
  rows: Rom[];
  total: number;
  page: number;
  pageCount: number;
  filtered: boolean;
};

export function queryRoms(
  roms: readonly Rom[],
  query: CatalogQuery,
  now: Date,
): CatalogPage {
  const matched = roms.filter((rom) => matchesFilters(rom, query, now));
  const sorted = [...matched].sort(compareRoms(query.sort, query.dir));

  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(query.page, pageCount);
  const start = (page - 1) * PAGE_SIZE;

  return {
    rows: sorted.slice(start, start + PAGE_SIZE),
    total,
    page,
    pageCount,
    filtered: total !== roms.length,
  };
}

export function summarize(roms: readonly Rom[], now: Date) {
  const brands = new Set<string>();
  const devices = new Set<string>();
  let outdated = 0;

  for (const rom of roms) {
    brands.add(rom.name);
    if (rom.device) devices.add(rom.device);
    if (isOutdated(rom.builtAt, now)) outdated += 1;
  }

  return {
    entries: roms.length,
    brands: brands.size,
    devices: devices.size,
    outdated,
  };
}
