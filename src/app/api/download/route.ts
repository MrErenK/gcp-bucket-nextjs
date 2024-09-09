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

    await cloudStorage.incrementFileDownloads(filename);

    // Construct the CDN URL
    const cdnFileUrl = `${CDN_URL}/${encodeURIComponent(filename)}`;

    // Redirect to the CDN URL
    return NextResponse.redirect(cdnFileUrl, 302);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
