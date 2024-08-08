// app/api/rename/route.ts
import { NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";

// Initialize Google Cloud Storage client
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: "./google-cloud-key.json",
});

const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME || "";

export async function POST(request: Request) {
  const { oldName, newName } = await request.json();

  if (!oldName || !newName) {
    return NextResponse.json(
      { message: "Old name and new name are required" },
      { status: 400 },
    );
  }

  const bucket = storage.bucket(bucketName);

  try {
    // Check if the old file exists
    const [oldFileExists] = await bucket.file(oldName).exists();
    if (!oldFileExists) {
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

    // Check if the new file name already exists
    const [newFileExists] = await bucket.file(newName).exists();
    if (newFileExists) {
      return NextResponse.json(
        { message: "A file with the new name already exists" },
        { status: 409 },
      );
    }

    // Rename the file
    //await bucket.file(oldName).rename(newName)

    return NextResponse.json({ message: "API is currently disabled." });
  } catch (error) {
    console.error("Error renaming file:", error);
    return NextResponse.json(
      { message: "Error renaming file" },
      { status: 500 },
    );
  }
}
