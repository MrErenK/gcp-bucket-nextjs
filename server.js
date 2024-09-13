const express = require("express");
const next = require("next");
const { drive } = require("./src/lib/expressStorage");
const { prisma } = require("./src/lib/expressPrisma");
const cors = require("cors");
const busboy = require("busboy");
const stream = require("stream");
const { promisify } = require("util");
const { URL } = require("url");
const dotenv = require("dotenv");

dotenv.config({ path: `.env.local`, override: true });

const pipeline = promisify(stream.pipeline);

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());

const MAX_FILE_SIZE = 6 * 1024 * 1024 * 1024; // 6 GB in bytes
const BASE_URL = process.env.WEB_URL || "http://localhost:3000";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

if (!ADMIN_API_KEY) {
  throw new Error("ADMIN_API_KEY environment variable is not set");
}

if (!GOOGLE_DRIVE_FOLDER_ID) {
  throw new Error("GOOGLE_DRIVE_FOLDER_ID environment variable is not set");
}

async function verifyApiKey(apiKey) {
  try {
    const response = await fetch(`${BASE_URL}/api/keys/verify?key=${apiKey}`);
    const data = await response.json();
    return data.valid;
  } catch (error) {
    console.error("Error verifying API key:", error);
    return false;
  }
}

async function getApiKeyDescription(apiKey) {
  const apiKeyData = await prisma.apiKey.findUnique({
    where: { key: apiKey },
    select: { description: true },
  });
  return apiKeyData ? apiKeyData.description : null;
}

async function uploadFromDirectLink(directLink) {
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
      filename = filenameMatch[1].replace(/^"|"$/g, "");
    }
  }

  filename = filename.replace(/"/g, "");

  // Check if file with the same name exists
  const existingFiles = await drive.files.list({
    q: `name='${filename}' and '${GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed=false`,
    fields: "files(id, name)",
  });

  if (existingFiles.data.files.length > 0) {
    throw new Error(`A file with the name "${filename}" already exists.`);
  }

  const driveResponse = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [GOOGLE_DRIVE_FOLDER_ID],
    },
    media: {
      mimeType: contentType,
      body: response.body,
    },
  });

  await drive.permissions.create({
    fileId: driveResponse.data.id,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  const downloadUrl = `${BASE_URL}/api/download?fileId=${driveResponse.data.id}`;
  return { name: filename, url: downloadUrl, id: driveResponse.data.id };
}

nextApp.prepare().then(() => {
  app.post("/api/upload", async (req, res) => {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey || !(await verifyApiKey(apiKey))) {
      console.log(
        "Upload canceled: Unauthorized. Invalid or missing API key:",
        apiKey,
      );
      return res.status(401).json({
        error: "Unauthorized: Invalid or missing API key",
        key: apiKey,
      });
    }

    console.log("Upload started");

    const contentType = req.headers["content-type"] || "";

    if (contentType.includes("application/json")) {
      let body;
      try {
        body = await new Promise((resolve, reject) => {
          let data = "";
          req.on("data", (chunk) => {
            data += chunk;
          });
          req.on("end", () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(e);
            }
          });
        });
      } catch (error) {
        console.log("Upload canceled: Invalid JSON body");
        return res.status(400).json({ error: "Invalid JSON body" });
      }

      if (body && body.directLink) {
        try {
          const uploadedFile = await uploadFromDirectLink(body.directLink);
          const apikey = await getApiKeyDescription(apiKey);
          console.log("Upload completed successfully");
          console.log(
            `Uploaded file details: Name: ${uploadedFile.name}, URL: ${uploadedFile.url}, apiKey: ${apikey}`,
          );
          return res.json({
            message: "File uploaded successfully from direct link",
            file: uploadedFile,
          });
        } catch (error) {
          console.error(error);
          console.log("Upload canceled: Error uploading from direct link");
          return res.status(500).json({
            error: `Error uploading file from direct link: ${error.message}`,
          });
        }
      }
    }

    const bb = busboy({ headers: req.headers });
    const uploadPromises = [];
    let filesUploaded = 0;

    bb.on("file", async (fieldname, file, info) => {
      if (fieldname !== "files") {
        file.resume();
        return;
      }

      const { filename, mimeType } = info;
      if (!filename) {
        file.resume();
        return;
      }

      // Check if file with the same name exists
      const existingFiles = await drive.files.list({
        q: `name='${filename}' and '${GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed=false`,
        fields: "files(id, name)",
      });

      if (existingFiles.data.files.length > 0) {
        console.log(`Upload canceled: File ${filename} already exists`);
        file.resume();
        uploadPromises.push(
          Promise.reject(new Error(`File ${filename} already exists`)),
        );
        jsonRes = {
          error: `A file with the name "${filename}" already exists.`,
        };
        return res.status(400).json(jsonRes);
      }

      filesUploaded++;
      let fileSize = 0;

      const uploadPromise = new Promise((resolveUpload, rejectUpload) => {
        const chunks = [];

        file.on("data", (data) => {
          fileSize += data.length;
          if (fileSize > MAX_FILE_SIZE) {
            file.resume();
            console.log(`Upload canceled: File ${filename} exceeds size limit`);
            rejectUpload(
              new Error(
                `File ${filename} exceeds the maximum allowed size of 6 GB.`,
              ),
            );
          } else {
            chunks.push(data);
          }
        });

        file.on("end", async () => {
          if (fileSize <= MAX_FILE_SIZE) {
            try {
              const fileBuffer = Buffer.concat(chunks);
              const driveResponse = await drive.files.create({
                requestBody: {
                  name: filename,
                  parents: [GOOGLE_DRIVE_FOLDER_ID],
                },
                media: {
                  mimeType: mimeType,
                  body: stream.Readable.from(fileBuffer),
                },
              });

              await drive.permissions.create({
                fileId: driveResponse.data.id,
                requestBody: {
                  role: "reader",
                  type: "anyone",
                },
              });

              const fileUrl = `${BASE_URL}/api/download?fileId=${driveResponse.data.id}`;
              console.log(
                `Uploaded file details: Name: ${filename}, URL: ${fileUrl}`,
              );
              resolveUpload({
                name: filename,
                url: fileUrl,
                id: driveResponse.data.id,
              });
            } catch (error) {
              console.log(`Upload canceled: Error uploading ${filename}`);
              rejectUpload(error);
            }
          }
        });
      });

      uploadPromises.push(uploadPromise);
    });

    bb.on("finish", async () => {
      if (uploadPromises.length === 0) {
        console.log("Upload canceled: No valid files were uploaded");
        res.status(400).json({ error: "No valid files were uploaded" });
      } else {
        try {
          const results = await Promise.allSettled(uploadPromises);
          const uploadedFiles = results
            .filter((result) => result.status === "fulfilled")
            .map((result) => result.value);
          const errors = results
            .filter((result) => result.status === "rejected")
            .map((result) => result.reason.message);

          if (uploadedFiles.length === 0) {
            console.log("Upload failed: All files encountered errors");
            res
              .status(400)
              .json({ error: "All files encountered errors", details: errors });
          } else {
            const apiKeyDescription = await getApiKeyDescription(apiKey);
            const existingStats = await prisma.fileStats.findMany({
              where: {
                fileId: {
                  in: uploadedFiles.map((file) => file.id),
                },
              },
              select: { fileId: true },
            });

            if (existingStats.length > 0) {
              await prisma.fileStats.deleteMany({
                where: {
                  fileId: {
                    in: existingStats.map((stat) => stat.fileId),
                  },
                },
              });
            }
            await prisma.fileStats.createMany({
              data: uploadedFiles.map((file) => ({
                fileId: file.id,
                filename: file.name,
                views: 0,
                downloads: 0,
                uploadedKey: apiKeyDescription,
              })),
            });
            console.log(
              `Upload completed: Files uploaded to Google Drive with the following names: ${uploadedFiles.map((file) => file.name).join(", ")} using the api key: ${apiKeyDescription}`,
            );

            if (errors.length > 0) {
              res.json({
                message:
                  "Some files uploaded successfully, others encountered errors",
                files: uploadedFiles,
                errors: errors,
              });
            } else {
              res.json({
                message: "All files uploaded successfully",
                files: uploadedFiles,
              });
            }
          }
        } catch (error) {
          console.log("Upload canceled: Error uploading files");
          if (!res.headersSent) {
            res
              .status(500)
              .json({ error: `Error uploading files: ${error.message}` });
          }
        }
      }
    });

    bb.on("error", (error) => {
      console.error(error);
      console.log("Upload canceled: Error in busboy");
      if (!res.headersSent) {
        res
          .status(500)
          .json({ error: `Error uploading files: ${error.message}` });
      }
    });

    req.pipe(bb);
  });

  // Handle all other routes with Next.js
  app.all("*", (req, res) => {
    return handle(req, res);
  });

  const findAvailablePort = async (port) => {
    return new Promise((resolve, reject) => {
      const server = app.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
        resolve(port);
      });

      server.on("error", (error) => {
        if (error.code === "EADDRINUSE") {
          console.log(`Port ${port} is in use, trying another port...`);
          server.close();
          resolve(findAvailablePort(parseInt(port) + 1));
        } else {
          reject(error);
        }
      });
    });
  };

  findAvailablePort(port).catch((error) => {
    console.error("Failed to start server:", error);
  });
});

console.log("Preparing Next.js app...");
