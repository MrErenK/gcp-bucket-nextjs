import { NextRequest, NextResponse } from "next/server";
import { cloudStorage } from "@/lib/cloudStorage";

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json(
      { error: "Filename is required" },
      { status: 400 },
    );
  }

  try {
    await cloudStorage.incrementFileViews(filename);
    return NextResponse.json({ message: "File views incremented" });
  } catch (error) {
    console.error("Error incrementing file views:", error);
    return NextResponse.json(
      { error: "Failed to increment file views" },
      { status: 500 },
    );
  }
}
