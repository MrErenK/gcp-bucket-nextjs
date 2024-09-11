const fastifyPlugin = require("fastify-plugin");
const multipart = require("@fastify/multipart");
const dotenv = require("dotenv");
const Fastify = require("fastify");
const Next = require("next");
const { pipeline } = require("stream/promises");
const { URL } = require("url");
const { prisma } = require("./src/lib/expressPrisma");
const { bucket } = require("./src/lib/expressStorage");

dotenv.config({ path: `.env.local`, override: true });

const dev = process.env.NODE_ENV !== "production";
const nextApp = Next({ dev });
const handle = nextApp.getRequestHandler();

const fastify = Fastify();
const port = parseInt(process.env.PORT || "3000", 10);

fastify.register(fastifyPlugin(multipart));

const MAX_FILE_SIZE = 6 * 1024 * 1024 * 1024; // 6 GB in bytes
const CHUNK_SIZE = 100 * 1024 * 1024; // 100 MB in bytes
const BASE_URL = process.env.WEB_URL || "http://localhost:3000";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const UPLOAD_TIMEOUT = 60 * 60 * 1000; // 60 minutes in milliseconds

if (!ADMIN_API_KEY) {
  throw new Error("ADMIN_API_KEY environment variable is not set");
}

async function verifyApiKey(apiKey) {
  try {
    const response = await fetch(`${BASE_URL}/api/keys/verify?key=${apiKey}`);
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

  const file = bucket.file(filename);
  const writeStream = file.createWriteStream({
    resumable: true,
    chunkSize: CHUNK_SIZE,
    metadata: {
      contentType,
    },
  });

  if (response.body) {
    await pipeline(response.body, writeStream);
  } else {
    throw new Error("Response body is null");
  }

  await file.makePublic();

  await file.setMetadata({
    contentType,
    contentDisposition: `${contentType.startsWith("text/") ? "inline" : "attachment"}; filename="${filename}"`,
  });

  const downloadUrl = `${BASE_URL}/api/download?filename=${encodeURIComponent(filename)}`;
  return { name: filename, url: downloadUrl };
}

nextApp.prepare().then(() => {
  fastify.post("/api/upload", async (request, reply) => {
    const apiKey = request.headers["x-api-key"];

    if (!apiKey || !(await verifyApiKey(apiKey))) {
      return reply.status(401).send({
        error: "Unauthorized: Invalid or missing API key",
        key: apiKey,
      });
    }

    console.log("Upload started");

    const uploadTimeout = setTimeout(() => {
      console.log("Upload canceled: Timeout reached");
      reply
        .status(408)
        .send({ error: "Request Timeout: Upload took too long" });
      request.raw.destroy();
    }, UPLOAD_TIMEOUT);

    const contentType =
      request.headers["content-type"] || "application/octet-stream";

    if (contentType.includes("application/json")) {
      let body;
      try {
        body = await request.body;
      } catch (error) {
        clearTimeout(uploadTimeout);
        console.log("Upload canceled: Invalid JSON body");
        return reply.status(400).send({ error: "Invalid JSON body" });
      }

      if (body && body.directLink) {
        try {
          const uploadedFile = await uploadFromDirectLink(body.directLink);
          clearTimeout(uploadTimeout);
          const apikey = await getApiKeyDescription(apiKey);
          console.log("Upload completed successfully");
          console.log(
            `Uploaded file details: Name: ${uploadedFile.name}, URL: ${uploadedFile.url}, apiKey: ${apikey}`,
          );
          return reply.send({
            message: "File uploaded successfully from direct link",
            file: uploadedFile,
          });
        } catch (error) {
          clearTimeout(uploadTimeout);
          console.error(error);
          console.log(
            "Upload canceled: Error uploading from direct link",
            error,
          );
          return reply.status(500).send({
            error: `Error uploading file from direct link: ${error.message}`,
          });
        }
      }
    }

    const parts = request.parts();
    const uploadPromises = [];
    let filesUploaded = 0;

    for await (const part of parts) {
      if (part.type === "file") {
        const { filename, mimetype, file } = part;
        if (!filename) {
          continue;
        }

        filesUploaded++;
        let fileSize = 0;

        const uploadPromise = new Promise(
          async (resolveUpload, rejectUpload) => {
            try {
              const gcsFile = bucket.file(filename);
              const writeStream = gcsFile.createWriteStream({
                resumable: true,
                chunkSize: CHUNK_SIZE,
                metadata: {
                  contentType: mimetype,
                },
              });

              for await (const chunk of file) {
                fileSize += chunk.length;
                if (fileSize > MAX_FILE_SIZE) {
                  file.destroy();
                  writeStream.destroy(new Error("File size limit exceeded"));
                  console.log(
                    `Upload canceled: File ${filename} exceeds size limit`,
                  );
                  rejectUpload(
                    new Error(
                      `File ${filename} exceeds the maximum allowed size of 6 GB.`,
                    ),
                  );
                  break;
                }
                writeStream.write(chunk);
              }

              writeStream.on("error", (error) => {
                console.error(`Error uploading ${filename}:`, error);
                rejectUpload(error);
              });

              writeStream.on("finish", async () => {
                try {
                  await gcsFile.makePublic();
                  await gcsFile.setMetadata({
                    contentDisposition: `${
                      mimetype.startsWith("text/") ? "inline" : "attachment"
                    }; filename="${filename}"`,
                  });

                  const fileUrl = `${BASE_URL}/api/download?filename=${encodeURIComponent(
                    filename,
                  )}`;
                  console.log(
                    `Uploaded file details: Name: ${filename}, URL: ${fileUrl}`,
                  );
                  resolveUpload({ name: filename, url: fileUrl });
                } catch (error) {
                  console.log(
                    `Upload canceled: Error processing ${filename}`,
                    error,
                  );
                  rejectUpload(error);
                }
              });

              await pipeline(file, writeStream);
            } catch (error) {
              console.log(
                `Upload canceled: Error setting up upload for ${filename}`,
                error,
              );
              rejectUpload(error);
            }
          },
        );

        uploadPromises.push(uploadPromise);
      }
    }

    clearTimeout(uploadTimeout);
    if (!filesUploaded) {
      console.log("Upload canceled: No valid file was uploaded");
      return reply.status(400).send({ error: "No valid file was uploaded" });
    } else {
      try {
        const uploadedFiles = await Promise.all(uploadPromises);
        const apiKeyDescription = await getApiKeyDescription(apiKey);
        await prisma.fileStats.deleteMany({
          where: {
            filename: {
              in: uploadedFiles.map((file) => file.name),
            },
          },
        });
        await prisma.fileStats.createMany({
          data: uploadedFiles.map((file) => ({
            filename: file.name,
            views: 0,
            downloads: 0,
            uploadedKey: apiKeyDescription || undefined,
          })),
        });
        console.log(
          `Upload completed: Files uploaded to ${
            bucket.name
          } with the following names: ${uploadedFiles
            .map((file) => file.name)
            .join(", ")} using the api key: ${apiKeyDescription}`,
        );
        return reply.send({
          message: "Files uploaded successfully",
          files: uploadedFiles,
        });
      } catch (error) {
        console.log("Upload canceled: Error uploading files", error);
        return reply.status(500).send({
          error: `Error uploading files: ${error.message}`,
        });
      }
    }
  });

  // Handle all other routes with Next.js
  fastify.all("*", (request, reply) => {
    return handle(request.raw, reply.raw);
  });

  const findAvailablePort = async (port) => {
    return new Promise((resolve, reject) => {
      fastify.listen({ port, host: "0.0.0.0" }, (err) => {
        if (err) {
          if (err.code === "EADDRINUSE") {
            console.log(`Port ${port} is in use, trying another port...`);
            resolve(findAvailablePort(port + 1));
          } else {
            reject(err);
          }
        } else {
          console.log(`> Ready on http://localhost:${port}`);
          resolve(port);
        }
      });
    });
  };

  findAvailablePort(port).catch((error) => {
    console.error("Failed to start server:", error);
  });
});

console.log("Preparing Next.js app...");
