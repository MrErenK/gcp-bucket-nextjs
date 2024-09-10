const express = require("express");
const next = require("next");
const { s3, bucket } = require("./src/lib/expressStorage");
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
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

  const contentType = response.headers.get("content-type") || "application/octet-stream";
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

  const buffer = await response.arrayBuffer();

  const uploadParams = {
    Bucket: bucket.name,
    Key: filename,
    Body: Buffer.from(buffer),
    ContentType: contentType,
    ContentDisposition: `${contentType.startsWith("text/") ? "inline" : "attachment"}; filename="${filename}"`,
  };

  await s3.send(new PutObjectCommand(uploadParams));

  const downloadUrl = await getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket.name, Key: filename }), { expiresIn: 3600 });
  return { name: filename, url: downloadUrl };
}

nextApp.prepare().then(() => {
  app.post("/api/upload", async (req, res) => {
    const apiKey = req.headers["x-api-key"];

    console.log("Received API key:", apiKey); // Log the received API key

    if (!apiKey) {
      return res.status(401).json({
        error: "Unauthorized: Missing API key",
      });
    }

    const isValidKey = await verifyApiKey(apiKey);
    console.log("API key validation result:", isValidKey); // Log the validation result

    if (!isValidKey) {
      return res.status(401).json({
        error: "Unauthorized: Invalid API key",
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

      filesUploaded++;
      let fileSize = 0;
      const chunks = [];

      const uploadPromise = new Promise((resolveUpload, rejectUpload) => {
        file.on("data", (data) => {
          fileSize += data.length;
          if (fileSize > MAX_FILE_SIZE) {
            file.resume();
            rejectUpload(new Error(`File ${filename} exceeds the maximum allowed size of 6 GB.`));
          }
          chunks.push(data);
        });

        file.on("end", async () => {
          try {
            const buffer = Buffer.concat(chunks);
            const uploadParams = {
              Bucket: bucket.name,
              Key: filename,
              Body: buffer,
              ContentType: mimeType,
              ContentDisposition: `${mimeType.startsWith("text/") ? "inline" : "attachment"}; filename="${filename}"`,
            };

            await s3.send(new PutObjectCommand(uploadParams));

            const fileUrl = await getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket.name, Key: filename }), { expiresIn: 3600 });
            resolveUpload({ name: filename, url: fileUrl });
          } catch (error) {
            rejectUpload(error);
          }
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

  app.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    console.log("> Mode:", process.env.NODE_ENV);
    console.log("> Custom server is running");
  });
});

console.log("Preparing Next.js app...");
