import { NextRequest, NextResponse } from "next/server";
import { cloudStorage } from "@/lib/cloudStorage";
import Busboy from "busboy";
import { IncomingHttpHeaders } from "http";
import fetch from "node-fetch";
import stream from "stream";
import { promisify } from "util";
import { URL } from "url";

const pipeline = promisify(stream.pipeline);

const MAX_FILE_SIZE = 3 * 1024 * 1024 * 1024; // 3 GB in bytes
const BASE_URL = process.env.WEB_URL || "http://localhost:3000"; // Default to localhost if WEB_URL is not set
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY) {
  throw new Error("ADMIN_API_KEY environment variable is not set");
}

async function verifyApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/api/keys/verify?key=${apiKey}`, {
      headers: {
        Authorization: `Bearer ${ADMIN_API_KEY}`,
      },
    });
    if (response.ok) {
      const data: any = await response.json();
      return data.valid === true;
    }
    return false;
  } catch (error) {
    console.error("Error verifying API key:", error);
    return false;
  }
}

async function uploadFromDirectLink(
  directLink: string,
): Promise<{ name: string; url: string }> {
  const response = await fetch(directLink);
  if (!response.ok) throw new Error(`Failed to fetch file from ${directLink}`);

  const contentType =
    response.headers.get("content-type") || "application/octet-stream";
  const contentDisposition = response.headers.get("content-disposition");
  const sourceUrl = new URL(directLink);
  let filename = sourceUrl.pathname.split("/").pop() || "downloaded_file";

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
    if (filenameMatch) {
      filename = filenameMatch[1].replace(/^"|"$/g, ""); // Remove leading and trailing quotes
    }
  }

  // Remove any remaining quotes from the filename
  filename = filename.replace(/"/g, "");

  const blobStream = cloudStorage.getWriteStream(filename);
  if (response.body) {
    await pipeline(response.body, blobStream);
  } else {
    throw new Error("Response body is null");
  }

  // Make the file public
  await cloudStorage.makeFilePublic(filename);

  await cloudStorage.setFileMetadata(filename, {
    contentType,
    contentDisposition: `${contentType.startsWith("text/") ? "inline" : "attachment"}; filename="${filename}"`,
  });

  const downloadUrl = `${BASE_URL}/api/download?filename=${encodeURIComponent(filename)}`;
  return { name: filename, url: downloadUrl };
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey || !(await verifyApiKey(apiKey))) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing API key", key: apiKey },
      { status: 401 },
    );
  }

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    if (body.directLink) {
      try {
        const uploadedFile = await uploadFromDirectLink(body.directLink);
        return NextResponse.json({
          message: "File uploaded successfully from direct link",
          file: uploadedFile,
        });
      } catch (error) {
        console.error(error);
        return NextResponse.json(
          {
            error: `Error uploading file from direct link: ${(error as Error).message}`,
          },
          { status: 500 },
        );
      }
    }
  }

  return new Promise<NextResponse>((resolve) => {
    const headers: IncomingHttpHeaders = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const busboy = Busboy({ headers });
    const uploadPromises: Promise<{ name: string; url: string }>[] = [];
    let fileUploaded = false;

    busboy.on(
      "file",
      (
        fieldname: string,
        file: NodeJS.ReadableStream,
        info: Busboy.FileInfo,
      ) => {
        const { filename, mimeType } = info;
        if (!filename) {
          // Skip this file if no filename is provided
          file.resume();
          return;
        }

        fileUploaded = true;
        let fileSize = 0;
        const blobStream = cloudStorage.getWriteStream(filename);
        const uploadPromise = new Promise<{ name: string; url: string }>(
          async (resolveUpload, rejectUpload) => {
            file.on("data", (data: Buffer) => {
              fileSize += data.length;
              if (fileSize > MAX_FILE_SIZE) {
                file.resume();
                blobStream.destroy(
                  new Error(
                    `File ${filename} exceeds the maximum allowed size of 3 GB.,`,
                  ),
                );
                rejectUpload(
                  new Error(
                    `File ${filename} exceeds the maximum allowed size of 3 GB.`,
                  ),
                );
              }
            });

            file.pipe(blobStream);

            blobStream.on("finish", async () => {
              try {
                await cloudStorage.makeFilePublic(filename);
                await cloudStorage.setFileMetadata(filename, {
                  contentType: mimeType,
                  contentDisposition: `${mimeType.startsWith("text/") ? "inline" : "attachment"}; filename="${filename}"`,
                });

                const fileUrl = `${BASE_URL}/api/download?filename=${encodeURIComponent(filename)}`;
                resolveUpload({ name: filename, url: fileUrl });
              } catch (error) {
                rejectUpload(error);
              }
            });

            blobStream.on("error", (error) => {
              rejectUpload(error);
            });
          },
        );

        uploadPromises.push(uploadPromise);
      },
    );

    busboy.on("finish", async () => {
      if (!fileUploaded) {
        resolve(
          NextResponse.json(
            { error: "No valid file was uploaded" },
            { status: 400 },
          ),
        );
      } else {
        try {
          const uploadedFiles = await Promise.all(uploadPromises);
          resolve(
            NextResponse.json({
              message: "Files uploaded successfully",
              files: uploadedFiles,
            }),
          );
        } catch (error) {
          resolve(
            NextResponse.json(
              { error: `Error uploading files: ${(error as Error).message}` },
              { status: 500 },
            ),
          );
        }
      }
    });

    busboy.on("error", (error: Error) => {
      console.error(error);
      resolve(
        NextResponse.json(
          { error: `Error uploading files: ${error.message}` },
          { status: 500 },
        ),
      );
    });

    if (request.body) {
      const readableStream = request.body as ReadableStream;
      const reader = readableStream.getReader();

      const readChunk = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            busboy.end();
          } else {
            busboy.write(value);
            readChunk();
          }
        });
      };

      readChunk();
    } else {
      busboy.end();
    }
  });
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
