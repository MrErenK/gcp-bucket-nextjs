import { Storage } from "@google-cloud/storage";

import { readFileSync } from "fs";

const keyFileContents = readFileSync("./google-cloud-key.json", "utf8");

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: JSON.parse(keyFileContents),
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME || "");

export { storage, bucket };
