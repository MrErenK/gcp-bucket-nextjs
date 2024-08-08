import { NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: "./google-cloud-key.json",
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME || "");

export async function POST(request: Request) {
  const { fileName } = await request.json();

  if (!fileName) {
    return NextResponse.json(
      { error: "No file name provided" },
      { status: 400 },
    );
  }

  try {
    //await bucket.file(fileName).delete()
    return NextResponse.json({ message: "API is currently disabled." });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 },
    );
  }
}
