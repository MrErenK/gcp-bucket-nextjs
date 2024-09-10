import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { s3Client, bucket, GetObjectCommand, HeadObjectCommand } from "@/lib/storage";
import { getFileType } from "@/types/filetypes";
import { getPrisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json({ error: "Filename is required" }, { status: 400 });
  }

  try {
    const fileExtension = path.extname(filename).toLowerCase();
    const fileType = getFileType(fileExtension);

    // Check if file exists
    const headObjectCommand = new HeadObjectCommand({
      Bucket: bucket,
      Key: filename,
    });

    try {
      await s3Client.send(headObjectCommand);
    } catch (error) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const previewData: {
      content?: string;
      previewUrl?: string;
      fileType?: string;
      views?: number;
      downloads?: number;
    } = {};

    switch (fileType) {
      case "text":
        const getObjectCommand = new GetObjectCommand({
          Bucket: bucket,
          Key: filename,
        });
        const { Body } = await s3Client.send(getObjectCommand);
        const fileContent = await Body!.transformToString();
        previewData.content = fileContent;
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

    // Get file stats
    const prisma = await getPrisma();
    const stats = await prisma.fileStats.findUnique({
      where: { filename },
      select: { views: true, downloads: true },
    }) || { views: 0, downloads: 0 };
    previewData.views = stats.views;
    previewData.downloads = stats.downloads;

    return NextResponse.json(previewData);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching file preview" }, { status: 500 });
  }
}
