import { NextRequest, NextResponse } from "next/server";
import { bucket } from "@/lib/storage";

const PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const filename = searchParams.get("filename");

  try {
    // If a filename is provided, return details for that specific file
    if (filename) {
      const [files] = await bucket.getFiles();
      const file = files.find((f) => f.name === filename);

      if (!file) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }

      const [metadata] = await file.getMetadata();
      return NextResponse.json({
        name: file.name,
        updatedAt: metadata.updated,
        size: parseInt(String(metadata.size) || "0", 10),
      });
    }

    // Pagination and search functionality
    const [files] = await bucket.getFiles();
    const filteredFiles = await Promise.all(
      files
        .filter((file) =>
          file.name.toLowerCase().includes(search.toLowerCase()),
        )
        .map(async (file) => {
          const [metadata] = await file.getMetadata();
          return {
            name: file.name,
            updatedAt: metadata.updated,
            size: parseInt(String(metadata.size) || "0", 10),
          };
        }),
    );

    const totalPages = Math.ceil(filteredFiles.length / PAGE_SIZE);
    const paginatedFiles = filteredFiles.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE,
    );

    return NextResponse.json({
      files: paginatedFiles,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching files" },
      { status: 500 },
    );
  }
}
