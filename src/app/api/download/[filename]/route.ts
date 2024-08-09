import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const filename = url.pathname.split("/").pop();

  if (typeof filename !== "string") {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  try {
    const cdnUrl = `${process.env.CDN_URL}/${filename}`;

    // Fetch the file from the CDN
    const cdnResponse = await fetch(cdnUrl);

    if (!cdnResponse.ok) {
      return NextResponse.json({ error: "File not found on CDN" }, { status: 404 });
    }

    // Get the content type and length from the CDN response
    const contentType = cdnResponse.headers.get("Content-Type") || "application/octet-stream";
    const contentLength = cdnResponse.headers.get("Content-Length");

    // Create a ReadableStream from the CDN response
    const stream = cdnResponse.body;

    // Create a new response with the stream
    const response = new NextResponse(stream, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": contentType,
        "Transfer-Encoding": "chunked",
      },
    });

    // Add Content-Length header if available
    if (contentLength) {
      response.headers.set("Content-Length", contentLength);
    }

    return response;
  } catch (error) {
    console.error("Error processing file download:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}