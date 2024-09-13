import { NextRequest, NextResponse } from "next/server";
import { cloudStorage, FileData } from "@/lib/cloudStorage";

const PAGE_SIZE = 10;

interface FileWithStats extends FileData {
  downloads: number;
  views: number;
  uploadedKey: string | null;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const fileId = searchParams.get("fileId");
  const sort = searchParams.get("sort") || "name";
  const order = searchParams.get("order") || "asc";
  const all = searchParams.get("all") === "true";

  try {
    if (fileId) {
      const fileExists = await cloudStorage.fileExists(fileId);
      if (!fileExists) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }

      const metadata = await cloudStorage.getFileMetadata(fileId);
      const stats = await cloudStorage.getFileStats(fileId);

      return NextResponse.json({
        ...metadata,
        downloads: stats.downloads,
        views: stats.views,
        uploadedKey: stats.uploadedKey || null,
      });
    }

    const files = await cloudStorage.listFiles();
    const filteredFiles = await Promise.all(
      files
        .filter((file) =>
          file.name.toLowerCase().includes(search.toLowerCase()),
        )
        .map(async (file) => {
          const stats = await cloudStorage.getFileStats(file.id);
          return {
            ...file,
            downloads: stats.downloads,
            views: stats.views,
            uploadedKey: stats.uploadedKey || null,
          };
        }),
    );

    const sortedFiles = filteredFiles.sort((a, b) => {
      if (sort === "name") {
        return order === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sort === "date") {
        return order === "asc"
          ? new Date(a.modifiedTime).getTime() -
              new Date(b.modifiedTime).getTime()
          : new Date(b.modifiedTime).getTime() -
              new Date(a.modifiedTime).getTime();
      } else if (sort === "size") {
        return order === "asc"
          ? parseInt(a.size) - parseInt(b.size)
          : parseInt(b.size) - parseInt(a.size);
      } else if (sort === "downloads") {
        return order === "asc"
          ? a.downloads - b.downloads
          : b.downloads - a.downloads;
      }
      return 0;
    });

    const totalPages = all ? 1 : Math.ceil(sortedFiles.length / PAGE_SIZE);
    const paginatedFiles = all
      ? sortedFiles
      : sortedFiles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const totalSize = sortedFiles.reduce(
      (acc, file) => acc + parseInt(file.size),
      0,
    );

    return NextResponse.json({
      files: paginatedFiles,
      totalPages,
      totalFiles: sortedFiles.length,
      totalSize,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching files" },
      { status: 500 },
    );
  }
}
