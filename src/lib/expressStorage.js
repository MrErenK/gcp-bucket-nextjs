const { Storage } = require("@google-cloud/storage");
const { readFileSync } = require("fs");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: `.env.local`, override: true });

const keyFilePath = path.resolve(process.cwd(), "google-cloud-key.json");
const keyFileContents = readFileSync(keyFilePath, "utf8");

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: JSON.parse(keyFileContents),
});

const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
if (!bucketName) {
  throw new Error(
    "GOOGLE_CLOUD_BUCKET_NAME is not defined in the environment variables",
  );
}

const bucket = storage.bucket(bucketName);

module.exports = { storage, bucket };
