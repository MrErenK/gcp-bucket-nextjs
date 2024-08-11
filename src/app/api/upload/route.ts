import { NextRequest, NextResponse } from "next/server";
import { bucket } from "@/lib/storage";
import { PassThrough, Readable } from "stream";

const MAX_FILE_SIZE = 3 * 1024 * 1024 * 1024; // 3 GB in bytes
const BASE_URL = process.env.WEB_URL || "http://localhost:3000"; // Default to localhost if WEB_URL is not set

export async function POST(request: NextRequest) {
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

        const gcsFile = bucket.file(file.name);
        const contentDisposition = file.type.startsWith("text/")
          ? "inline"
          : "attachment";

        const writeStream = gcsFile.createWriteStream({
          metadata: {
            contentType: file.type,
            acl: [{ entity: "allUsers", role: "READER" }],
            contentDisposition: `${contentDisposition}; filename="${file.name}"`,
          },
        });

        // Convert ReadableStream to Node.js Readable stream
        const nodeReadable = Readable.from(fileStream as any);

        // Pipe the Readable stream to PassThrough and then to Google Cloud Storage
        nodeReadable.pipe(passThroughStream);
        passThroughStream.pipe(writeStream);

        await new Promise<void>((resolve, reject) => {
          passThroughStream
            .on("error", (err) => {
              reject(
                new Error(`Error uploading file ${file.name}: ${err.message}`),
              );
            })
            .on("finish", () => {
              resolve();
            });
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