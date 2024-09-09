import { NextResponse } from "next/server";
import { verifyApiKey, getApiKeyDescription } from "@/lib/apiKeyAuth";
import { cloudStorage } from "@/lib/cloudStorage";

export async function GET(request: Request) {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    return NextResponse.json({ error: "API key is required" }, { status: 401 });
  }

  try {
    const isValid = await verifyApiKey(apiKey);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const apiKeyDescription = await getApiKeyDescription(apiKey);

    if (!apiKeyDescription) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    const files = await cloudStorage.listUserFiles(apiKeyDescription);

    const totalSize = files.reduce(
      (sum: number, file: any) => sum + file.size,
      0,
    );

    return NextResponse.json({
      files,
      totalFiles: files.length,
      totalSize,
    });
  } catch (error) {
    console.error("Error fetching user files:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
