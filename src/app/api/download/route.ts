import { NextRequest, NextResponse } from "next/server";
import { cloudStorage } from "@/lib/cloudStorage";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fileId = searchParams.get("fileId");

  if (!fileId) {
    return NextResponse.json({ error: "File ID is required" }, { status: 400 });
  }

  try {
    // Check if file exists
    const fileExists = await cloudStorage.fileExists(fileId);
    const filename = await cloudStorage.getFileName(fileId);
    if (!fileExists) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Increment download count
    await cloudStorage.incrementFileDownloads(fileId, filename as string);

    // Get file metadata
    const fileMetadata = await cloudStorage.getFileMetadata(fileId);

    // Get download URL
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    // Set response headers
    const headers = new Headers();
    headers.set(
      "Content-Disposition",
      `attachment; filename="${fileMetadata.name}"`,
    );
    headers.set("Content-Type", fileMetadata.mimeType);

    // Redirect to the download URL
    return NextResponse.redirect(downloadUrl, {
      headers: headers,
      status: 302,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
