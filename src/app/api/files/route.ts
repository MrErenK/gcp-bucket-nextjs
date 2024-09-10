import { NextRequest, NextResponse } from "next/server";
import { s3Client, bucket, ListObjectsV2Command, HeadObjectCommand } from "@/lib/storage";
import { getPrisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const filename = searchParams.get("filename");
  const sort = searchParams.get("sort") || "name";
  const order = searchParams.get("order") || "asc";
  const all = searchParams.get("all") === "true";

  try {
    // Ensure the endpoint URL is properly formatted
    if (!process.env.BACKBLAZE_ENDPOINT?.startsWith('https://')) {
      throw new Error('Invalid BACKBLAZE_ENDPOINT. It must start with https://');
    }

    if (filename) {
      const headObjectCommand = new HeadObjectCommand({
        Bucket: bucket,
        Key: filename,
      });

      try {
        const headObjectResponse = await s3Client.send(headObjectCommand);
        const prisma = await getPrisma();
        const stats = await prisma.fileStats.findUnique({
          where: { filename },
          select: { views: true, downloads: true, uploadedKey: true },
        }) || { views: 0, downloads: 0, uploadedKey: null };

        return NextResponse.json({
          name: filename,
          updatedAt: headObjectResponse.LastModified,
          size: headObjectResponse.ContentLength,
          downloads: stats.downloads,
          views: stats.views,
          uploadedKey: stats.uploadedKey,
        });
      } catch (error) {
        console.error('Error in HeadObjectCommand:', error);
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
    }

    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: search,
    });

    const listObjectsResponse = await s3Client.send(listObjectsCommand);
    const files = listObjectsResponse.Contents || [];

    const prisma = await getPrisma();
    const fileStats = await prisma.fileStats.findMany();
    const statsMap = new Map(fileStats.map(stat => [stat.filename, stat]));

    const processedFiles = files.map(file => ({
      name: file.Key!,
      updatedAt: file.LastModified,
      size: file.Size,
      downloads: statsMap.get(file.Key!)?.downloads || 0,
      views: statsMap.get(file.Key!)?.views || 0,
      uploadedKey: statsMap.get(file.Key!)?.uploadedKey || null,
    }));

    // Sort the processed files
    const sortedFiles = processedFiles.sort((a, b) => {
      if (sort === "name") {
        return order === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      } else if (sort === "date") {
        return order === "asc" ? a.updatedAt!.getTime() - b.updatedAt!.getTime() : b.updatedAt!.getTime() - a.updatedAt!.getTime();
      } else if (sort === "size") {
        return order === "asc" ? a.size! - b.size! : b.size! - a.size!;
      } else if (sort === "downloads") {
        return order === "asc" ? a.downloads - b.downloads : b.downloads - a.downloads;
      }
      return 0;
    });

    const totalPages = all ? 1 : Math.ceil(sortedFiles.length / PAGE_SIZE);
    const paginatedFiles = all ? sortedFiles : sortedFiles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const totalSize = sortedFiles.reduce((acc, file) => acc + (file.size || 0), 0);

    return NextResponse.json({
      files: paginatedFiles,
      totalPages,
      totalFiles: sortedFiles.length,
      totalSize,
    });
  } catch (error) {
    console.error('Error in GET request:', error);
    return NextResponse.json({ error: "Error fetching files", details: (error as Error).message }, { status: 500 });
  }
}
