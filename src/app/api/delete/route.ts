import { NextRequest, NextResponse } from "next/server";
import { cloudStorage } from "@/lib/cloudStorage";

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get("filename");
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (token !== ADMIN_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!filename) {
    return NextResponse.json(
      { error: "Filename is required" },
      { status: 400 },
    );
  }

  try {
    await cloudStorage.deleteFile(filename);
    return NextResponse.json(
      { message: "File deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 },
    );
  }
}
