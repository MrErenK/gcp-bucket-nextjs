import { NextRequest, NextResponse } from "next/server";
import { cloudStorage } from "@/lib/cloudStorage";
import { verifyApiKey, getApiKeyDescription } from "@/lib/apiKeyAuth";

export async function POST(req: NextRequest) {
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

  const body = await req.json();
  const { oldFilename, newFilename } = body;

  if (!oldFilename || !newFilename) {
    return NextResponse.json(
      { error: "Old and new filenames are required" },
      { status: 400 },
    );
  }

  try {
    const fileStats = await cloudStorage.getFileStats(oldFilename);
    if (fileStats.uploadedKey !== apiKeyDescription) {
      return NextResponse.json(
        { error: "You don't have permission to rename this file" },
        { status: 403 },
      );
    }

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
