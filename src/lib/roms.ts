import {
  parseRomFilename,
  type RomImage,
  type RomRelease,
  type RomVariant,
} from "@/lib/rom-filename";
import { SITE } from "@/lib/site";
import { listStored } from "@/lib/storage";
import { readIndex } from "@/lib/storage-index";

export type Rom = {
  id: string;
  file: string;
  name: string;
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
  sizeBytes: number | null;
  sha256: string | null;
  downloads: number;
  url: string;
  absoluteUrl: string;
};

export async function loadRoms(): Promise<Rom[]> {
  const [files, index] = await Promise.all([listStored(), readIndex()]);

  return files.map((file) => {
    const parsed = parseRomFilename(file.file);
    const record = index.get(file.file);
    const url = `/api/files/${encodeURIComponent(file.file)}`;

    return {
      id: file.file,
      file: file.file,
      name: parsed.name,
      version: parsed.version,
      revision: parsed.revision,
      device: parsed.device,
      builtAt: parsed.builtAt,
      builtTime: parsed.builtTime,
      variant: parsed.variant,
      release: parsed.release,
      image: parsed.image,
      flags: parsed.flags,
      unparsed: parsed.unparsed,
      sizeBytes: file.bytes,
      sha256: record?.sha256 ?? null,
      downloads: record?.downloads ?? 0,
      url,
      absoluteUrl: `${SITE.url}${url}`,
    };
  });
}

export type DeviceOption = {
  device: string;
  count: number;
};

export function listDevices(roms: readonly Rom[]): DeviceOption[] {
  const counts = new Map<string, number>();

  for (const rom of roms) {
    if (!rom.device) continue;
    counts.set(rom.device, (counts.get(rom.device) ?? 0) + 1);
  }

  return [...counts]
    .map(([device, count]) => ({ device, count }))
    .sort((left, right) => left.device.localeCompare(right.device));
}
