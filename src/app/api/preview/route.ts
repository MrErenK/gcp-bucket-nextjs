import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { cloudStorage } from "@/lib/cloudStorage";
import { getFileType } from "@/types/filetypes";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fileId = searchParams.get("fileId");

  if (!fileId) {
    return NextResponse.json({ error: "File ID is required" }, { status: 400 });
  }

  try {
    // Check if file exists
    const fileExists = await cloudStorage.fileExists(fileId);

    if (!fileExists) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Get file metadata
    const fileMetadata = await cloudStorage.getFileMetadata(fileId);
    const fileExtension = path.extname(fileMetadata.name).toLowerCase();
    const fileType = getFileType(fileExtension);

    const previewData: {
      content?: string;
      previewUrl?: string;
      fileType?: string;
      views?: number;
      downloads?: number;
    } = {};

    switch (fileType) {
      case "text":
        const fileContent = await cloudStorage.downloadFile(fileId);
        previewData.content = fileContent.toString("utf8");
        break;

      case "image":
        previewData.previewUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
        break;

      case "audio":
      case "video":
        previewData.previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        break;

      default:
        previewData.fileType = fileType;
        previewData.previewUrl = `https://drive.google.com/file/d/${fileId}/view`;
    }

    // Get file stats
    const stats = await cloudStorage.getFileStats(fileId);
    previewData.views = stats.views;
    previewData.downloads = stats.downloads;

    const filename = await cloudStorage.getFileName(fileId);

    // Increment view count
    await cloudStorage.incrementFileViews(fileId, filename as string);

    return NextResponse.json(previewData);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching file preview" },
      { status: 500 },
    );
  }
}
