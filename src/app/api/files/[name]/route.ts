import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { join } from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { listStored } from "@/lib/storage";
import { countDownload } from "@/lib/storage-index";
import { DOWNLOAD_BASE_URL, STORAGE_DIR } from "@/lib/upload-config";

export const maxDuration = 900;

const SAFE_NAME = /^[A-Za-z0-9._+-]+\.zip$/i;

function notFound(): NextResponse {
  return new NextResponse("Not Found", { status: 404 });
}

function range(value: string | null, size: number): { start: number; end: number } | null | "invalid" {
  if (!value) return null;

  const match = /^bytes=(\d*)-(\d*)$/.exec(value.trim());
  if (!match) return "invalid";

  const [, rawStart, rawEnd] = match;
  if (!rawStart && !rawEnd) return "invalid";

  if (!rawStart) {
    const length = Number.parseInt(rawEnd, 10);
    if (!Number.isFinite(length) || length <= 0) return "invalid";

    return { start: Math.max(0, size - length), end: size - 1 };
  }

  const start = Number.parseInt(rawStart, 10);
  if (!Number.isFinite(start) || start >= size) return "invalid";

  const end = rawEnd ? Number.parseInt(rawEnd, 10) : size - 1;
  if (!Number.isFinite(end) || end < start) return "invalid";

  return { start, end: Math.min(end, size - 1) };
}

export async function GET(
  request: Request,
  { params }: RouteContext<"/api/files/[name]">,
) {
  const { name } = await params;
  if (!SAFE_NAME.test(name)) return notFound();

  const stored = await listStored();
  const file = stored.find((entry) => entry.file === name);
  if (!file) return notFound();

  await countDownload(name).catch(() => undefined);

  if (DOWNLOAD_BASE_URL) {
    const target = `${DOWNLOAD_BASE_URL}/${encodeURIComponent(name)}`;
    return NextResponse.redirect(target, 302);
  }

  const path = join(/*turbopackIgnore: true*/ STORAGE_DIR, name);

  let size: number;
  try {
    size = (await stat(/*turbopackIgnore: true*/ path)).size;
  } catch {
    return notFound();
  }

  const span = range(request.headers.get("range"), size);
  if (span === "invalid") {
    return new NextResponse("Range Not Satisfiable", {
      status: 416,
      headers: { "content-range": `bytes */${size}` },
    });
  }

  const headers = new Headers({
    "content-type": "application/zip",
    "content-disposition": `attachment; filename="${name}"`,
    "cache-control": "public, max-age=3600",
    "accept-ranges": "bytes",
  });

  const start = span ? span.start : 0;
  const end = span ? span.end : size - 1;
  headers.set("content-length", String(end - start + 1));
  if (span) headers.set("content-range", `bytes ${start}-${end}/${size}`);

  const body = Readable.toWeb(
    createReadStream(path, { start, end }),
  ) as ReadableStream<Uint8Array>;

  return new NextResponse(body, {
    status: span ? 206 : 200,
    headers,
  });
}
