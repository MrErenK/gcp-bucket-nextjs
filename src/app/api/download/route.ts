import { NextRequest, NextResponse } from "next/server";
import { bucket } from "@/lib/storage";
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
    const file = bucket.file(filename);
    const [exists] = await file.exists();

    if (!exists) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const [metadata] = await file.getMetadata();
    const fileSize = metadata.size;

    // Create a readable stream
    const readStream = file.createReadStream();

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
        "Content-Type": metadata.contentType,
        "Content-Length": (fileSize ?? "").toString(),
        "X-Total-Size": (fileSize ?? 0).toString(),
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
