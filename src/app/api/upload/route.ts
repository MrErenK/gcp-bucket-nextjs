import { NextRequest, NextResponse } from "next/server";
import { cloudStorage } from "@/lib/cloudStorage";
import Busboy from "busboy";
import { IncomingHttpHeaders } from "http";

const MAX_FILE_SIZE = 3 * 1024 * 1024 * 1024; // 3 GB in bytes
const BASE_URL = process.env.WEB_URL || "http://localhost:3000"; // Default to localhost if WEB_URL is not set
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY) {
  throw new Error("ADMIN_API_KEY environment variable is not set");
}

async function verifyApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/api/keys/verify?key=${apiKey}`, {
      headers: {
        Authorization: `Bearer ${ADMIN_API_KEY}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data.valid === true;
    }
    return false;
  } catch (error) {
    console.error("Error verifying API key:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey || !(await verifyApiKey(apiKey))) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing API key", key: apiKey },
      { status: 401 },
    );
  }

  return new Promise<NextResponse>((resolve) => {
    const headers: IncomingHttpHeaders = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const busboy = Busboy({ headers });
    const uploadedFiles: { name: string; url: string }[] = [];

    busboy.on("file", (fieldname: string, file: NodeJS.ReadableStream, info: Busboy.FileInfo) => {
      const { filename, encoding, mimeType } = info;
      let fileSize = 0;
      const blobStream = cloudStorage.getWriteStream(filename);

      file.on("data", (data: Buffer) => {
        fileSize += data.length;
        if (fileSize > MAX_FILE_SIZE) {
          file.resume();
          blobStream.destroy(new Error(`File ${filename} exceeds the maximum allowed size of 3 GB.`));
        }
      });

      file.pipe(blobStream);

      blobStream.on("finish", async () => {
        await cloudStorage.setFileMetadata(filename, {
          contentType: mimeType,
          contentDisposition: `${mimeType.startsWith("text/") ? "inline" : "attachment"}; filename="${filename}"`,
        });

        const fileUrl = `${BASE_URL}/api/download?filename=${encodeURIComponent(filename)}`;
        uploadedFiles.push({ name: filename, url: fileUrl });
      });
    });

    busboy.on("finish", () => {
      resolve(NextResponse.json({
        message: "Files uploaded successfully",
        files: uploadedFiles,
      }));
    });

    busboy.on("error", (error: Error) => {
      console.error(error);
      resolve(NextResponse.json(
        { error: `Error uploading files: ${error.message}` },
        { status: 500 },
      ));
    });

    if (request.body) {
      const readableStream = request.body as ReadableStream;
      const reader = readableStream.getReader();

      const readChunk = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            busboy.end();
          } else {
            busboy.write(value);
            readChunk();
          }
        });
      };

      readChunk();
    } else {
      busboy.end();
    }
  });
}

// New way to configure the API route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';