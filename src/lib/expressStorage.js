const { S3Client } = require('@aws-sdk/client-s3');
const dotenv = require("dotenv");

dotenv.config({ path: `.env.local`, override: true });

const s3 = new S3Client({
  endpoint: process.env.BACKBLAZE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.BACKBLAZE_KEY_ID,
    secretAccessKey: process.env.BACKBLAZE_APP_KEY,
  },
  forcePathStyle: true,
  region: process.env.BACKBLAZE_REGION || 'auto',
});

const bucketName = process.env.BACKBLAZE_BUCKET_NAME;
if (!bucketName) {
  throw new Error(
    "BACKBLAZE_BUCKET_NAME is not defined in the environment variables"
  );
}

const bucket = {
  name: bucketName,
  file: (filename) => ({
    createWriteStream: () => s3.upload({
      Bucket: bucketName,
      Key: filename,
      Body: null
    }).createReadStream()
  })
};

module.exports = { s3, bucket };
