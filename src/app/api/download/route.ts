import { NextRequest, NextResponse } from "next/server";
import { cloudStorage } from "@/lib/cloudStorage";

const CDN_URL = process.env.CDN_URL;

if (!CDN_URL) {
  throw new Error("CDN_URL environment variable is not set");
}

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

    // Increment download count
    await cloudStorage.incrementFileDownloads(filename);

    // Construct the CDN URL
    const cdnFileUrl = `${CDN_URL}/${encodeURIComponent(filename)}`;

    // Download the file from CDN
    const response = await fetch(cdnFileUrl);

    // Set appropriate headers for file download
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Content-Type', response.headers.get('content-type') || '');
    headers.set('Content-Length', response.headers.get('content-length') || '');

    // Return the file as a download
    return new NextResponse(await response.arrayBuffer(), {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
