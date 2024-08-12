import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { bucket } from "@/lib/storage";
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

    // Fetch file from Google Cloud Storage
    const [files] = await bucket.getFiles();
    const file = files.find((f) => f.name === filename);

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const previewData: {
      content?: string;
      previewUrl?: string;
      fileType?: string;
    } = {};

    switch (fileType) {
      case "text":
        const [fileData] = await file.download();
        previewData.content = fileData.toString("utf8");
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
