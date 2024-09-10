import { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  endpoint: process.env.BACKBLAZE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.BACKBLAZE_KEY_ID || '',
    secretAccessKey: process.env.BACKBLAZE_APP_KEY || '',
  },
  forcePathStyle: true,
  region: process.env.BACKBLAZE_REGION || 'auto',
});

const bucket = process.env.BACKBLAZE_BUCKET_NAME;
if (!bucket) {
  throw new Error("BACKBLAZE_BUCKET_NAME is not defined in the environment variables");
}

export { s3Client, bucket, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand, ListObjectsV2Command, getSignedUrl };
