import { NextRequest, NextResponse } from "next/server";
import { cloudStorage } from "@/lib/cloudStorage";
import { Readable } from "stream";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json(
      { error: "Filename is required" },
      { status: 400 },
    );
  }

  try {
    // Check if file exists
    const fileExists = await cloudStorage.fileExists(filename);
    if (!fileExists) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Get file metadata
    const metadata = await cloudStorage.getFileMetadata(filename);
    const fileSize = metadata.size;

    // Create a readable stream
    const readStream = await cloudStorage.createReadStream(filename);

    // Create a transform stream to track progress
    let downloadedBytes = 0;
    const progressStream = new TransformStream({
      transform(chunk, controller) {
        downloadedBytes += chunk.length;
        controller.enqueue(chunk);
      },
    });

    // Pipe the read stream through the progress stream
    const stream = Readable.from(readStream);

    const response = new NextResponse(stream as any, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": metadata.contentType || "application/octet-stream",
        "Content-Length": fileSize ? fileSize.toString() : "",
        "X-Total-Size": fileSize ? fileSize.toString() : "0",
      } as HeadersInit,
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
