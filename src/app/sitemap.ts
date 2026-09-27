import type { MetadataRoute } from "next";
import { catalogHref } from "@/lib/catalog";
import { loadRoms } from "@/lib/roms";
import { SITE_ORIGIN } from "@/lib/seo";
import { readIndex } from "@/lib/storage-index";

export const revalidate = 3600;

function latest(dates: ReadonlyArray<string | null>): Date | undefined {
  let newest = Number.NEGATIVE_INFINITY;

  for (const value of dates) {
    if (!value) continue;

    const time = Date.parse(value);
    if (Number.isFinite(time) && time > newest) newest = time;
  }

  return Number.isFinite(newest) ? new Date(newest) : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [roms, index] = await Promise.all([loadRoms(), readIndex()]);
  const root = `${SITE_ORIGIN}/`;
  const addedAt = (file: string) => index.get(file)?.addedAt ?? null;
  const catalog = latest(roms.map((rom) => addedAt(rom.file)));

  const devices = new Map<string, Array<string | null>>();
  for (const rom of roms) {
    if (!rom.device) continue;

    const dates = devices.get(rom.device) ?? [];
    dates.push(addedAt(rom.file));
    devices.set(rom.device, dates);
  }

  return [
    { url: root, lastModified: catalog },
    { url: `${root}upload`, lastModified: catalog },
    ...[...devices]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([device, dates]) => ({
        url: catalogHref({ device }, root),
        lastModified: latest(dates),
      })),
  ];
}
