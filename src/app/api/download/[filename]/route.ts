import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { Readable } from "stream";

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: "./google-cloud-key.json",
});

const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME || "";
const bucket = storage.bucket(bucketName);

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const filename = url.pathname.split("/").pop();

  if (typeof filename !== "string") {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  try {
    const file = bucket.file(filename);
    const [exists] = await file.exists();

    if (!exists) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileStream = file.createReadStream();

    // Create a ReadableStream for the NextResponse
    const readableStream = new ReadableStream({
      start(controller) {
        fileStream.on("data", (chunk) => controller.enqueue(chunk));
        fileStream.on("end", () => controller.close());
        fileStream.on("error", (err) => controller.error(err));
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
