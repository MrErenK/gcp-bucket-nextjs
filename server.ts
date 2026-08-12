import express, { Request, Response } from "express";
import next from "next";
import { cloudStorage } from "./src/lib/cloudStorage";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { Readable } from "stream";

dotenv.config({ path: "./.env.local" });

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5 GB
const MIN_FILE_SIZE = 1 * 1024 * 1024; // 1 MB
const BASE_URL = process.env.WEB_URL || "http://localhost:3000";
const PORT = parseInt(process.env.PORT || "3000", 10);
const IS_DEV = process.env.NODE_ENV !== "production";
const FORBIDDEN_MIME_TYPES = new Set(["audio/", "video/", "text/"]);

interface UploadedFile {
  name: string;
  url: string;
}

class UploadError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = "UploadError";
  }
}

// ── Filename helpers ──────────────────────────────────────────────────────────

function sanitizeFilename(filename: string): string {
  let sanitized = filename.replace(/\s+/g, "_");
  sanitized = sanitized.replace(/[^\x00-\x7F]/g, "");
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, "");
  sanitized = sanitized.replace(/_+/g, "_");
  sanitized = sanitized.replace(/^_+|_+$/g, "");
  if (!sanitized) sanitized = "file";
  const originalExt = path.extname(filename);
  const sanitizedExt = path.extname(sanitized);
  if (originalExt && !sanitizedExt) sanitized += originalExt;
  return sanitized;
}

async function getUniqueFilename(originalFilename: string): Promise<string> {
  let sanitizedFilename = sanitizeFilename(originalFilename);
  const exists = await cloudStorage.fileExists(sanitizedFilename);
  if (!exists) return sanitizedFilename;
  const ext = path.extname(sanitizedFilename);
  const baseName = path.basename(sanitizedFilename, ext);
  let counter = 1;
  let newFilename = `${baseName}-${counter}${ext}`;
  while (await cloudStorage.fileExists(newFilename)) {
    counter++;
    newFilename = `${baseName}-${counter}${ext}`;
  }
  return newFilename;
}

// Content-Type → extension fallback, used only when neither the URL nor the
// Content-Disposition header supplies a usable file extension. Audio, video and
// text types are intentionally omitted since they are rejected on upload.
const MIME_EXTENSIONS: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/zip": ".zip",
  "application/x-zip-compressed": ".zip",
  "application/gzip": ".gz",
  "application/x-gzip": ".gz",
  "application/x-tar": ".tar",
  "application/x-7z-compressed": ".7z",
  "application/x-rar-compressed": ".rar",
  "application/vnd.rar": ".rar",
  "application/x-bzip2": ".bz2",
  "application/json": ".json",
  "application/xml": ".xml",
  "application/rtf": ".rtf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    ".pptx",
  "application/vnd.android.package-archive": ".apk",
  "application/x-msdownload": ".exe",
  "application/x-apple-diskimage": ".dmg",
  "application/x-iso9660-image": ".iso",
  "application/epub+zip": ".epub",
  "application/wasm": ".wasm",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "image/bmp": ".bmp",
  "image/tiff": ".tiff",
  "image/avif": ".avif",
  "image/heic": ".heic",
  "image/x-icon": ".ico",
  "image/vnd.microsoft.icon": ".ico",
  "font/woff": ".woff",
  "font/woff2": ".woff2",
  "font/ttf": ".ttf",
  "font/otf": ".otf",
};

function extensionFromContentType(contentType: string): string {
  const type = contentType.split(";")[0].trim().toLowerCase();
  return MIME_EXTENSIONS[type] ?? "";
}

// A path segment "looks like a filename" only if it ends in a short, non-numeric
// extension (e.g. report.pdf, archive.7z — but not /v1.2 or /1234567890).
function hasFileExtension(segment: string): boolean {
  return /\.[a-zA-Z0-9]{1,8}$/.test(segment) && !/\.\d+$/.test(segment);
}

// Sanitize a candidate name and guarantee it has an extension, deriving one from
// the response's Content-Type when the name itself lacks one.
function finalizeFilename(rawName: string, contentType: string): string {
  const name = sanitizeFilename(rawName.replace(/"/g, ""));
  if (path.extname(name)) return name;
  const ext = extensionFromContentType(contentType);
  return ext ? name + ext : name;
}

function extractFilename(
  directLink: string,
  contentDisposition: string | null,
  contentType: string,
): string {
  // 1. Content-Disposition is the most authoritative source for the name.
  if (contentDisposition) {
    // Prefer RFC 5987 encoded filename* (e.g. filename*=UTF-8''foo%20bar.zip)
    const rfc5987 = contentDisposition.match(
      /filename\*=(?:UTF-8|utf-8)'[^']*'([^;\s]+)/i,
    );
    if (rfc5987) {
      let name: string;
      try {
        name = decodeURIComponent(rfc5987[1]);
      } catch {
        name = rfc5987[1];
      }
      return finalizeFilename(name, contentType);
    }
    // Basic filename="foo.zip" or filename=foo.zip
    const basic = contentDisposition.match(
      /filename="([^"]+)"|filename=([^;\s]+)/i,
    );
    if (basic) return finalizeFilename(basic[1] ?? basic[2] ?? "", contentType);
  }

  // 2. Fall back to the URL path. Prefer the last segment that actually looks
  //    like a filename, which handles links such as /files/report.pdf/download
  //    where the trailing segment ("download") is not the real name.
  const segments = new URL(directLink).pathname
    .split("/")
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    })
    .filter(Boolean);

  const named = [...segments].reverse().find(hasFileExtension);
  if (named) return finalizeFilename(named, contentType);

  // 3. Nothing usable in the URL (e.g. it ends in "/download") — build a name
  //    from the trailing segment plus an extension inferred from Content-Type.
  const base = segments[segments.length - 1] || "downloaded_file";
  return finalizeFilename(base, contentType);
}

// ── Validation helpers ────────────────────────────────────────────────────────

const validateFileType = (mimeType: string, _filename: string): void => {
  const isForbiddenType = Array.from(FORBIDDEN_MIME_TYPES).some((type) =>
    mimeType.startsWith(type),
  );
  if (isForbiddenType) {
    throw new UploadError(
      `File type not allowed: ${mimeType}. Audio, video, and text files are not permitted.`,
      400,
    );
  }
};

const validateFileSize = (size: number, filename: string): void => {
  if (size < MIN_FILE_SIZE) {
    throw new UploadError(
      `File ${filename} is too small. Minimum size is 1 MB.`,
      400,
    );
  }
  if (size > MAX_FILE_SIZE) {
    throw new UploadError(
      `File ${filename} is too large. Maximum size is 5 GB.`,
      400,
    );
  }
};

// ── Upload helpers ────────────────────────────────────────────────────────────

const generateDownloadUrl = (filename: string): string =>
  `${BASE_URL}/api/download?filename=${encodeURIComponent(filename)}`;

const getContentDisposition = (_contentType: string, filename: string): string =>
  `attachment; filename="${filename}"`;

async function finalizeUpload(filename: string): Promise<void> {
  await cloudStorage.makeFilePublic(filename);
}

async function uploadFromDirectLink(directLink: string): Promise<UploadedFile> {
  try {
    const response = await fetch(directLink);
    if (!response.ok) {
      throw new UploadError(`Failed to fetch file: ${response.statusText}`, 400);
    }

    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    const contentLength = response.headers.get("content-length");
    let filename = extractFilename(
      directLink,
      response.headers.get("content-disposition"),
      contentType,
    );

    filename = await getUniqueFilename(filename);

    if (contentLength) {
      validateFileSize(parseInt(contentLength, 10), filename);
    }

    validateFileType(contentType, filename);

    if (!response.body) {
      throw new UploadError("Response body is null", 400);
    }

    const blobStream = cloudStorage.createWriteStream(filename, {
      contentType,
      contentDisposition: getContentDisposition(contentType, filename),
    });
    let size = 0;

    // @ts-ignore
    const nodeReadable = Readable.fromWeb(response.body);

    return new Promise((resolve, reject) => {
      nodeReadable.on("data", (chunk: Buffer) => {
        size += chunk.length;

        if (size > MAX_FILE_SIZE) {
          nodeReadable.destroy();
          blobStream.destroy();
          reject(
            new UploadError(
              `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
              400,
            ),
          );
        }
      });

      nodeReadable.pipe(blobStream);

      blobStream.on("finish", async () => {
        try {
          if (size < MIN_FILE_SIZE) {
            // Best-effort cleanup; don't mask the size error if it fails
            await cloudStorage.deleteFile(filename).catch(() => {});
            throw new UploadError(
              `File size is below minimum requirement of ${MIN_FILE_SIZE / (1024 * 1024)}MB`,
              400,
            );
          }
          await finalizeUpload(filename);
          resolve({ name: filename, url: generateDownloadUrl(filename) });
        } catch (error) {
          reject(error);
        }
      });

      blobStream.on("error", (error: Error) => {
        nodeReadable.destroy();
        blobStream.destroy();
        reject(new UploadError(`Upload failed: ${error.message}`, 500));
      });
    });
  } catch (error) {
    if (error instanceof UploadError) throw error;
    throw new UploadError(
      `Failed to upload from direct link: ${(error as Error).message}`,
    );
  }
}

// ── Express / Next.js server ──────────────────────────────────────────────────

const nextApp = next({ dev: IS_DEV });
const handle = nextApp.getRequestHandler();
const app = express();

app.use(cors());
// The only JSON body this server parses is { directLink: string }; a 10 MB
// ceiling just let anyone buffer 10 MB per request for nothing.
app.use(express.json({ limit: "16kb" }));

nextApp.prepare().then(() => {
  // @ts-ignore
  app.post("/api/upload", async (req: Request, res: Response) => {
    try {
      const { directLink } = req.body;
      if (!directLink) throw new UploadError("directLink is required", 400);

      const uploadedFile = await uploadFromDirectLink(directLink);

      return res.json({
        message: "File uploaded successfully from direct link",
        file: uploadedFile,
      });
    } catch (error) {
      const uploadError =
        error instanceof UploadError
          ? error
          : new UploadError((error as Error).message);

      console.error("Upload error:", uploadError.message);

      res.status(uploadError.statusCode).json({ error: uploadError.message });
    }
  });

  app.all(/.*/, (req: Request, res: Response) => handle(req, res));

  startServer();
});

async function startServer(port: number = PORT): Promise<void> {
  try {
    await new Promise<void>((resolve, reject) => {
      const server = app.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
        resolve();
      });

      server.on("error", (error: NodeJS.ErrnoException) => {
        if (error.code === "EADDRINUSE") {
          console.log(`Port ${port} is in use, trying ${port + 1}...`);
          server.close();
          startServer(port + 1);
        } else {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}
