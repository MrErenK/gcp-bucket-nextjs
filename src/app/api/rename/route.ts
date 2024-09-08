import { NextRequest, NextResponse } from "next/server";
import { cloudStorage } from "@/lib/cloudStorage";

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ") ||
    token !== ADMIN_API_KEY
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { oldFilename, newFilename } = body;

  if (!oldFilename || !newFilename) {
    return NextResponse.json(
      { error: "Old and new filenames are required" },
      { status: 400 },
    );
  }

  try {
    await cloudStorage.renameFile(oldFilename, newFilename);
    return NextResponse.json(
      { message: "File renamed successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error renaming file:", error);
    return NextResponse.json(
      { error: "Failed to rename file" },
      { status: 500 },
    );
  }
}
