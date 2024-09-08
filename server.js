const express = require("express");
const next = require("next");
const { bucket } = require("./src/lib/expressStorage");
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

if (!ADMIN_API_KEY) {
  throw new Error("ADMIN_API_KEY environment variable is not set");
}

async function verifyApiKey(apiKey) {
  try {
    const response = await fetch(`${BASE_URL}/api/keys/verify?key=${apiKey}`, {
      headers: {
        Authorization: `Bearer ${ADMIN_API_KEY}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data.valid === true;
    }
    return false;
  } catch (error) {
    console.error("Error verifying API key:", error);
    return false;
  }
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

  const blob = bucket.file(filename);
  const blobStream = blob.createWriteStream();

  if (response.body) {
    await pipeline(response.body, blobStream);
  } else {
    throw new Error("Response body is null");
  }

  await blob.makePublic();

  await blob.setMetadata({
    contentType,
    contentDisposition: `${contentType.startsWith("text/") ? "inline" : "attachment"}; filename="${filename}"`,
  });

  const downloadUrl = `${BASE_URL}/api/download?filename=${encodeURIComponent(filename)}`;
  return { name: filename, url: downloadUrl };
}

nextApp.prepare().then(() => {
  app.post("/api/upload", async (req, res) => {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey || !(await verifyApiKey(apiKey))) {
      return res.status(401).json({
        error: "Unauthorized: Invalid or missing API key",
        key: apiKey,
      });
    }

    const contentType = req.headers["content-type"] || "";

    if (contentType.includes("application/json")) {
      const body = req.body;
      if (body.directLink) {
        try {
          const uploadedFile = await uploadFromDirectLink(body.directLink);
          return res.json({
            message: "File uploaded successfully from direct link",
            file: uploadedFile,
          });
        } catch (error) {
          console.error(error);
          return res.status(500).json({
            error: `Error uploading file from direct link: ${error.message}`,
          });
        }
      }
    }

    const bb = busboy({ headers: req.headers });
    const uploadPromises = [];
    let filesUploaded = 0;

    bb.on("file", (fieldname, file, info) => {
      if (fieldname !== "files") {
        file.resume();
        return;
      }

      const { filename, mimeType } = info;
      if (!filename) {
        file.resume();
        return;
      }

      filesUploaded++;
      let fileSize = 0;
      const blob = bucket.file(filename);
      const blobStream = blob.createWriteStream();

      const uploadPromise = new Promise((resolveUpload, rejectUpload) => {
        file.on("data", (data) => {
          fileSize += data.length;
          if (fileSize > MAX_FILE_SIZE) {
            file.resume();
            blobStream.destroy(
              new Error(
                `File ${filename} exceeds the maximum allowed size of 6 GB.`,
              ),
            );
            rejectUpload(
              new Error(
                `File ${filename} exceeds the maximum allowed size of 6 GB.`,
              ),
            );
          }
        });

        file.pipe(blobStream);

        blobStream.on("finish", async () => {
          try {
            await blob.makePublic();
            await blob.setMetadata({
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
      });

      uploadPromises.push(uploadPromise);
    });

    bb.on("finish", async () => {
      if (!filesUploaded) {
        res.status(400).json({ error: "No valid file was uploaded" });
      } else {
        try {
          const uploadedFiles = await Promise.all(uploadPromises);
          res.json({
            message: "Files uploaded successfully",
            files: uploadedFiles,
          });
          console.log(
            `Files uploaded to ${bucket.name} with the following names: ${uploadedFiles.map((file) => file.name).join(", ")}`,
          );
        } catch (error) {
          res
            .status(500)
            .json({ error: `Error uploading files: ${error.message}` });
        }
      }
    });

    bb.on("error", (error) => {
      console.error(error);
      res
        .status(500)
        .json({ error: `Error uploading files: ${error.message}` });
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

      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
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
