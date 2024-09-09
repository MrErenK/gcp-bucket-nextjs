import { NextRequest, NextResponse } from "next/server";
import { cloudStorage } from "@/lib/cloudStorage";
import { verifyApiKey, getApiKeyDescription } from "@/lib/apiKeyAuth";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get("filename");
  const apiKey = req.headers.get("x-api-key");

  if (!apiKey) {
    return NextResponse.json({ error: "API key is required" }, { status: 401 });
  }

  const isValid = await verifyApiKey(apiKey);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const apiKeyDescription = await getApiKeyDescription(apiKey);
  if (!apiKeyDescription) {
    return NextResponse.json({ error: "API key not found" }, { status: 404 });
  }

  if (!filename) {
    return NextResponse.json(
      { error: "Filename is required" },
      { status: 400 },
    );
  }

  try {
    const fileStats = await cloudStorage.getFileStats(filename);
    if (fileStats.uploadedKey !== apiKeyDescription) {
      return NextResponse.json(
        { error: "You don't have permission to delete this file" },
        { status: 403 },
      );
    }

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
