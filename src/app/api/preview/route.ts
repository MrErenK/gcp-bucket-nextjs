import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { cloudStorage } from "@/lib/cloudStorage";
import { getFileType } from "@/types/filetypes";

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
    const fileExtension = path.extname(filename).toLowerCase();
    const fileType = getFileType(fileExtension);

    // Check if file exists
    const fileExists = await cloudStorage.fileExists(filename);

    if (!fileExists) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const previewData: {
      content?: string;
      previewUrl?: string;
      fileType?: string;
    } = {};

    switch (fileType) {
      case "text":
        const fileContent = await cloudStorage.downloadFile(filename);
        previewData.content = fileContent.toString("utf8");
        break;

      case "image":
      case "audio":
      case "video":
        previewData.previewUrl = `${process.env.NEXT_PUBLIC_CDN_URL}/${filename}`;
        break;

      default:
        previewData.fileType = fileType;
        previewData.previewUrl = `${process.env.NEXT_PUBLIC_CDN_URL}/${filename}`;
    }

    return NextResponse.json(previewData);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching file preview" },
      { status: 500 },
    );
  }
}
