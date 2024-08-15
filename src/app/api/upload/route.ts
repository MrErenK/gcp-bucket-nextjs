import { NextRequest, NextResponse } from "next/server";
import { PassThrough, Readable } from "stream";
import { cloudStorage } from "@/lib/cloudStorage";

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
  // Check for the API key in the headers
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey || !(await verifyApiKey(apiKey as string))) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing API key", key: apiKey },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
  }

  try {
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(
            `File ${file.name} exceeds the maximum allowed size of 3 GB.`,
          );
        }

        const fileStream = file.stream(); // Get a ReadableStream from the file
        const passThroughStream = new PassThrough(); // Create a PassThrough stream

        // Convert ReadableStream to Node.js Readable stream
        const nodeReadable = Readable.from(fileStream as any);

        // Pipe the Readable stream to PassThrough
        nodeReadable.pipe(passThroughStream);

        // Read the entire file into a buffer
        const chunks: Buffer[] = [];
        for await (const chunk of passThroughStream) {
          chunks.push(Buffer.from(chunk));
        }
        const fileBuffer = Buffer.concat(chunks);

        // Upload the file using our cloudStorage utility
        await cloudStorage.uploadFile(fileBuffer, file.name);

        // Set metadata after upload
        await cloudStorage.setFileMetadata(file.name, {
          contentType: file.type,
          contentDisposition: `${file.type.startsWith("text/") ? "inline" : "attachment"}; filename="${file.name}"`,
        });

        // Generate the file URL using the environment variable
        const fileUrl = `${BASE_URL}/api/download?filename=${encodeURIComponent(file.name)}`;
        return { name: file.name, url: fileUrl };
      }),
    );

    return NextResponse.json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: `Error uploading files: ${(error as Error).message}` },
      { status: 500 },
    );
  }
}
