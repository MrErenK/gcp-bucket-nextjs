import { NextRequest, NextResponse } from "next/server";

const CDN_URL = process.env.CDN_URL;

if (!CDN_URL) {
  throw new Error("CDN_URL environment variable is not set");
}

export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json(
      { error: "Filename is required" },
      { status: 400 },
    );
  }

  const cdnFileUrl = `${CDN_URL}/${encodeURIComponent(filename)}`;

  return NextResponse.redirect(cdnFileUrl, 302);
}
