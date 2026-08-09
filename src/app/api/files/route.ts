import { NextRequest, NextResponse } from "next/server";
import { cloudStorage } from "@/lib/cloudStorage";

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
    // If a filename is provided, return details for that specific file
    if (filename) {
      let metadata;
      try {
        metadata = await cloudStorage.getFileMetadata(filename);
      } catch (error) {
        const status = (error as { $metadata?: { httpStatusCode?: number } })
          .$metadata?.httpStatusCode;
        if (status === 404 || (error as Error).name === "NotFound") {
          return NextResponse.json({ error: "File not found" }, { status: 404 });
        }
        throw error;
      }

      return NextResponse.json({
        name: filename,
        updatedAt: metadata.updated,
        size: parseInt(String(metadata.size) || "0", 10),
      });
    }

    const files = await cloudStorage.listFiles();
    const needle = search.toLowerCase();
    const filteredFiles = files
      .filter((file) => file.name.toLowerCase().includes(needle))
      .map((file) => ({
        name: file.name,
        updatedAt: file.updated,
        size: file.size,
      }));

    // Sort the filtered files
    const sortedFiles = filteredFiles.sort((a, b) => {
      if (sort === "name") {
        return order === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sort === "date") {
        return order === "asc"
          ? new Date(a.updatedAt ?? 0).getTime() -
              new Date(b.updatedAt ?? 0).getTime()
          : new Date(b.updatedAt ?? 0).getTime() -
              new Date(a.updatedAt ?? 0).getTime();
      } else if (sort === "size") {
        return order === "asc" ? a.size - b.size : b.size - a.size;
      }
      return 0;
    });

    const totalPages = all ? 1 : Math.ceil(sortedFiles.length / PAGE_SIZE);
    const paginatedFiles = all
      ? sortedFiles
      : sortedFiles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const totalSize = sortedFiles.reduce((acc, file) => acc + file.size, 0);

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
