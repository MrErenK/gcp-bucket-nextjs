import { S3Client } from "@aws-sdk/client-s3";
import { Agent } from "node:https";
import { Agent as HttpAgent } from "node:http";
import { config } from "dotenv";

config({ path: "./.env.local" });

const endpoint = process.env.S3_ENDPOINT;
if (!endpoint) throw new Error("S3_ENDPOINT is not set");

const accessKeyId = process.env.S3_ACCESS_KEY_ID;
if (!accessKeyId) throw new Error("S3_ACCESS_KEY_ID is not set");

const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
if (!secretAccessKey) throw new Error("S3_SECRET_ACCESS_KEY is not set");

export const bucketName = process.env.S3_BUCKET_NAME;
if (!bucketName) throw new Error("S3_BUCKET_NAME is not set");

export const s3Client = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint,
  // SeaweedFS's S3 gateway only supports path-style addressing
  // (https://endpoint/bucket/key), not virtual-hosted-style.
  forcePathStyle: true,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  requestHandler: {
    // Keep-alive so the many small calls (HeadObject, ListObjectsV2) and the
    // 4 concurrent multipart part uploads reuse sockets instead of paying a
    // TCP+TLS handshake each. maxSockets defaults to Infinity, which lets a
    // burst of uploads open unbounded connections to the gateway.
    httpAgent: new HttpAgent({ keepAlive: true, maxSockets: 64 }),
    httpsAgent: new Agent({ keepAlive: true, maxSockets: 64 }),
    // No socket timeout by default: a stalled gateway would hang a request
    // (and its held part buffer) forever. Generous enough for a 5 MB part.
    connectionTimeout: 5_000,
    requestTimeout: 120_000,
  },
});