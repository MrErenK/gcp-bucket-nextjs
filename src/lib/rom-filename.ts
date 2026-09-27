export type RomVariant = "gapps" | "vanilla" | "unknown";
export type RomRelease = "official" | "unofficial" | "unknown";
export type RomImage = "ota" | "fastboot" | "unknown";

export type ParsedRomFilename = {
  raw: string;
  name: string;
  nameKey: string;
  version: string | null;
  revision: string | null;
  device: string | null;
  builtAt: string | null;
  builtTime: string | null;
  variant: RomVariant;
  release: RomRelease;
  image: RomImage;
  flags: string[];
  unparsed: string[];
};

export const ROM_VARIANTS: readonly RomVariant[] = ["gapps", "vanilla"];
export const ROM_RELEASES: readonly RomRelease[] = ["official", "unofficial"];

const ARCHIVE_EXTENSION =
  /\.(zip|img|bin|tar|tgz|gz|xz|7z|md5|md5sum|sha1|sha1sum|sha256|sha256sum|json|txt)$/i;

const NAME_JOINERS = new Set(["os", "android", "rom"]);

const BRANDS: ReadonlyArray<readonly [RegExp, string]> = [
  [/^crdroid/, "crDroid"],
  [/^lineage/, "LineageOS"],
  [/^rising/, "RisingOS"],
  [/^evolution/, "EvolutionX"],
  [/^pixelos/, "PixelOS"],
  [/^pixelexperience/, "PixelExperience"],
  [/^arrow/, "ArrowOS"],
  [/^havoc/, "Havoc-OS"],
  [/^derpfest|^derp/, "DerpFest"],
  [/^paranoid|^aospa/, "Paranoid Android"],
  [/^aosp/, "AOSP"],
  [/^hyperos/, "HyperOS"],
  [/^miui/, "MIUI"],
  [/^oneui/, "One UI"],
  [/^dotos/, "dotOS"],
  [/^superior/, "Superior OS"],
  [/^projectelixir|^elixir/, "Project Elixir"],
  [/^spark/, "SparkOS"],
  [/^yaap/, "YAAP"],
  [/^nameless/, "Nameless"],
  [/^carbon/, "CarbonROM"],
  [/^resurrection/, "Resurrection Remix"],
];

const VARIANT_WORDS: Record<string, RomVariant> = {
  gapps: "gapps",
  gapp: "gapps",
  gaps: "gapps",
  ggapps: "gapps",
  google: "gapps",
  gms: "gapps",
  withgapps: "gapps",
  gappsbuild: "gapps",
  vanilla: "vanilla",
  nongapps: "vanilla",
  nogapps: "vanilla",
  vanillaonly: "vanilla",
};

const RELEASE_WORDS: Record<string, RomRelease> = {
  official: "official",
  officialbuild: "official",
  unofficial: "unofficial",
  unofficialbuild: "unofficial",
  community: "unofficial",
};

const IMAGE_WORDS: Record<string, RomImage> = {
  ota: "ota",
  otaonly: "ota",
  otaupdate: "ota",
  fastboot: "fastboot",
  fastbootimage: "fastboot",
  img: "fastboot",
};

const FLAG_WORDS = new Set([
  "signed",
  "unsigned",
  "nightly",
  "weekly",
  "monthly",
  "stable",
  "beta",
  "alpha",
  "rc",
  "snapshot",
  "milestone",
  "release",
  "user",
  "userdebug",
  "eng",
  "dev",
  "test",
  "testing",
  "gsi",
  "boot",
  "firmware",
  "vendor",
  "plus",
  "edition",
  "testkey",
  "pre",
  "post",
  "treble",
  "aonly",
  "ab",
  "build",
  "final",
  "update",
  "patch",
  "hotfix",
  "sideload",
  "recovery",
]);

const VERSION_TOKEN = /^\d+(?:\.\d+)*$/;
const REVISION_TOKEN = /^v\d+(?:\.\d+)*$/i;
const YEAR_TOKEN = /^(?:20\d{2})$/;
const SHORT_TOKEN = /^\d{2}$/;

function stripArchiveExtension(value: string): string {
  let base = value.trim();

  for (;;) {
    const next = base.replace(ARCHIVE_EXTENSION, "");
    if (next === base) return base;
    base = next;
  }
}

function readDay(year: number, month: number, day: number): string | null {
  if (year < 2015 || year > 2100) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const at = new Date(Date.UTC(year, month - 1, day));
  if (
    at.getUTCFullYear() !== year ||
    at.getUTCMonth() !== month - 1 ||
    at.getUTCDate() !== day
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function readClock(token: string): string | null {
  if (!/^\d{4}$/.test(token)) return null;

  const hours = Number(token.slice(0, 2));
  const minutes = Number(token.slice(2, 4));
  if (hours > 23 || minutes > 59) return null;

  return `${token.slice(0, 2)}:${token.slice(2, 4)}`;
}

function tokenize(base: string): string[] {
  return base
    .split(/[-_\s+]+/)
    .flatMap((token) => {
      if (VERSION_TOKEN.test(token) || REVISION_TOKEN.test(token)) return [token];
      return token.split(".").filter(Boolean);
    })
    .filter(Boolean);
}

function canonicalName(token: string): string {
  const key = token.toLowerCase();

  for (const [pattern, brand] of BRANDS) {
    if (pattern.test(key)) return brand;
  }

  return token;
}

function readStamp(
  tokens: string[],
): { iso: string; time: string | null; index: number; span: number } | null {
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    let iso: string | null = null;
    let span = 1;

    if (/^\d{8}$/.test(token)) {
      iso = readDay(
        Number(token.slice(0, 4)),
        Number(token.slice(4, 6)),
        Number(token.slice(6, 8)),
      );
    }

    if (!iso && /^\d{6}$/.test(token)) {
      iso = readDay(
        2000 + Number(token.slice(0, 2)),
        Number(token.slice(2, 4)),
        Number(token.slice(4, 6)),
      );
    }

    if (
      !iso &&
      YEAR_TOKEN.test(token) &&
      SHORT_TOKEN.test(tokens[index + 1] ?? "") &&
      SHORT_TOKEN.test(tokens[index + 2] ?? "")
    ) {
      iso = readDay(
        Number(token),
        Number(tokens[index + 1]),
        Number(tokens[index + 2]),
      );
      if (iso) span = 3;
    }

    if (!iso) continue;

    const time = readClock(tokens[index + span] ?? "");
    return { iso, time, index, span: span + (time ? 1 : 0) };
  }

  return null;
}

export function parseRomFilename(filename: string): ParsedRomFilename {
  const raw = filename.trim();
  const tokens = tokenize(stripArchiveExtension(raw));

  let nameEnd = 0;
  while (
    nameEnd + 1 < tokens.length &&
    /^[a-z]{2,}$/i.test(tokens[nameEnd]) &&
    NAME_JOINERS.has(tokens[nameEnd + 1].toLowerCase())
  ) {
    nameEnd += 1;
  }

  const rawName = tokens.slice(0, nameEnd + 1).join("");
  const name = canonicalName(rawName);

  const stamp = readStamp(tokens);
  const claimed = new Set<number>();
  if (stamp) {
    for (let offset = 0; offset < stamp.span; offset += 1) {
      claimed.add(stamp.index + offset);
    }
  }
  for (let index = 0; index <= nameEnd; index += 1) claimed.add(index);

  let version: string | null = null;
  let revision: string | null = null;
  let variant: RomVariant = "unknown";
  let release: RomRelease = "unknown";
  let image: RomImage = "unknown";
  const flags: string[] = [];
  const unparsed: string[] = [];
  const candidates: Array<{ token: string; index: number }> = [];

  for (let index = 0; index < tokens.length; index += 1) {
    if (claimed.has(index)) continue;

    const token = tokens[index];
    const word = token.toLowerCase();

    const variantWord = VARIANT_WORDS[word];
    if (variantWord) {
      if (variant === "unknown") variant = variantWord;
      continue;
    }

    const releaseWord = RELEASE_WORDS[word];
    if (releaseWord) {
      if (release === "unknown") release = releaseWord;
      continue;
    }

    const imageWord = IMAGE_WORDS[word];
    if (imageWord) {
      if (image === "unknown") image = imageWord;
      continue;
    }

    if (FLAG_WORDS.has(word)) {
      if (!flags.includes(word)) flags.push(word);
      continue;
    }

    if (REVISION_TOKEN.test(token)) {
      if (!revision) revision = word;
      else unparsed.push(token);
      continue;
    }

    if (VERSION_TOKEN.test(token)) {
      if (!version) version = token;
      else unparsed.push(token);
      continue;
    }

    candidates.push({ token, index });
  }

  let device: string | null = null;
  if (candidates.length > 0) {
    const afterStamp = stamp
      ? candidates.find((candidate) => candidate.index > stamp.index)
      : undefined;
    const chosen = afterStamp ?? candidates[candidates.length - 1];

    device = chosen.token.toLowerCase();
    for (const candidate of candidates) {
      if (candidate !== chosen) unparsed.push(candidate.token);
    }
  }

  return {
    raw,
    name,
    nameKey: name.toLowerCase().replace(/[^a-z0-9]/g, ""),
    version,
    revision,
    device,
    builtAt: stamp?.iso ?? null,
    builtTime: stamp?.time ?? null,
    variant,
    release,
    image,
    flags,
    unparsed,
  };
}
