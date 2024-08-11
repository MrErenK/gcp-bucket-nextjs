import { NextRequest, NextResponse } from "next/server";
import { bucket } from "@/lib/storage";

const PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";

  try {
    const [files] = await bucket.getFiles();

    const filteredFiles = files
      .filter((file) => file.name.toLowerCase().includes(search.toLowerCase()))
      .map((file) => ({
        name: file.name,
        updatedAt: file.metadata.updated,
      }));

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
