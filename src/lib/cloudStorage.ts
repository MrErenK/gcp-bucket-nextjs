import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { s3Client, bucketName } from "./storage";
import { Readable, PassThrough, Writable } from "stream";

export interface StorageObject {
  name: string;
  size: number;
  updated?: string;
}

/**
 * Returns a Writable stream that pipes data to S3 via a multipart upload.
 * The 'finish' event fires only after the S3 backend has confirmed the upload,
 * matching the GCS createWriteStream() contract that server.ts relies on.
 *
 * Pass contentType/contentDisposition when they are known upfront: setting
 * them on the upload itself avoids a post-upload self-copy, which S3 caps at
 * 5 GB — exactly the maximum upload size server.ts allows.
 */
function createS3WriteStream(
  filename: string,
  metadata?: { contentType?: string; contentDisposition?: string },
): Writable {
  const passThrough = new PassThrough();

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucketName,
      Key: filename,
      Body: passThrough,
      ContentType: metadata?.contentType,
      ContentDisposition: metadata?.contentDisposition,
    },
  });

  // Start the upload now, not in final(). The SDK only begins draining
  // passThrough once done() is called, so deferring it lets passThrough fill
  // its high-water mark and stall the writer before final() is ever reached.
  let uploadError: Error | null = null;
  const uploadPromise = upload.done();
  uploadPromise.catch((err: Error) => {
    uploadError = err;
    // Unblock any write callback still waiting on a stream nobody is draining
    passThrough.destroy(err);
  });

  const proxy = new Writable({
    write(chunk, encoding, callback) {
      const failure: Error | null = uploadError;
      if (failure) return callback(failure);
      passThrough.write(chunk, encoding, callback);
    },
    final(callback) {
      // End the passThrough, then wait for S3 to confirm before emitting 'finish'
      passThrough.end();
      uploadPromise.then(() => callback()).catch(callback);
    },
    destroy(err, callback) {
      passThrough.destroy(err ?? undefined);
      upload
        .abort()
        .catch(() => {})
        .finally(() => callback(err));
    },
  });

  return proxy;
}

export const cloudStorage = {
  uploadFile: async (file: Buffer, filename: string) => {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: filename,
        Body: file,
      }),
    );
    return filename;
  },

  createWriteStream: (
    filename: string,
    metadata?: { contentType?: string; contentDisposition?: string },
  ): Writable => {
    return createS3WriteStream(filename, metadata);
  },

  getWriteStream: (
    filename: string,
    metadata?: { contentType?: string; contentDisposition?: string },
  ): Writable => {
    return createS3WriteStream(filename, metadata);
  },

  /**
   * No-op: SeaweedFS public access is configured at the bucket level
   * (anonymous read policy / public bucket), not per-object.
   */
  makeFilePublic: async (_filename: string): Promise<void> => {},

  downloadFile: async (filename: string): Promise<Buffer> => {
    const response = await s3Client.send(
      new GetObjectCommand({ Bucket: bucketName, Key: filename }),
    );

    const stream = response.Body as Readable;
    const chunks: Buffer[] = [];

    return new Promise<Buffer>((resolve, reject) => {
      stream.on("data", (chunk: Buffer) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", reject);
    });
  },

  deleteFile: async (filename: string): Promise<void> => {
    await s3Client.send(
      new DeleteObjectCommand({ Bucket: bucketName, Key: filename }),
    );
  },

  /**
   * S3 has no native rename. Copy the object with updated metadata,
   * then delete the original.
   */
  renameFile: async (
    oldFilename: string,
    newFilename: string,
  ): Promise<void> => {
    // Preserve existing ContentType while updating ContentDisposition
    const head = await s3Client.send(
      new HeadObjectCommand({ Bucket: bucketName, Key: oldFilename }),
    );

    await s3Client.send(
      new CopyObjectCommand({
        Bucket: bucketName,
        CopySource: `${bucketName}/${encodeURIComponent(oldFilename)}`,
        Key: newFilename,
        ContentType: head.ContentType,
        ContentDisposition: `attachment; filename="${newFilename}"`,
        MetadataDirective: "REPLACE",
      }),
    );

    await cloudStorage.deleteFile(oldFilename);
  },

  fileExists: async (filename: string): Promise<boolean> => {
    try {
      await s3Client.send(
        new HeadObjectCommand({ Bucket: bucketName, Key: filename }),
      );
      return true;
    } catch (error) {
      const status = (error as { $metadata?: { httpStatusCode?: number } })
        .$metadata?.httpStatusCode;
      if (status === 404 || (error as Error).name === "NotFound") return false;
      throw error;
    }
  },

  /**
   * S3 metadata is immutable after upload; updating it requires copying the
   * object to itself with MetadataDirective: REPLACE.
   */
  setFileMetadata: async (
    filename: string,
    metadata: { [key: string]: string },
  ): Promise<void> => {
    // Fetch current metadata so we don't accidentally drop ContentType, etc.
    const existing = await s3Client.send(
      new HeadObjectCommand({ Bucket: bucketName, Key: filename }),
    );

    await s3Client.send(
      new CopyObjectCommand({
        Bucket: bucketName,
        CopySource: `${bucketName}/${encodeURIComponent(filename)}`,
        Key: filename,
        ContentType: metadata.contentType ?? existing.ContentType,
        ContentDisposition:
          metadata.contentDisposition ?? existing.ContentDisposition,
        MetadataDirective: "REPLACE",
      }),
    );
  },

  getFileMetadata: async (filename: string) => {
    const response = await s3Client.send(
      new HeadObjectCommand({ Bucket: bucketName, Key: filename }),
    );

    return {
      // Normalised to match the shape that api/files/route.ts already reads
      updated: response.LastModified?.toISOString(),
      size: String(response.ContentLength ?? 0),
      contentType: response.ContentType,
      contentDisposition: response.ContentDisposition,
    };
  },

  /**
   * Lists objects with the size/mtime that ListObjectsV2 already returns, so
   * callers don't need a HeadObject round-trip per file to get them.
   */
  listFiles: async (prefix?: string): Promise<StorageObject[]> => {
    const objects: StorageObject[] = [];
    let continuationToken: string | undefined;

    do {
      const response = await s3Client.send(
        new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        }),
      );

      for (const obj of response.Contents ?? []) {
        if (obj.Key) {
          objects.push({
            name: obj.Key,
            size: obj.Size ?? 0,
            updated: obj.LastModified?.toISOString(),
          });
        }
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return objects;
  },

  createReadStream: (filename: string): Readable => {
    const passThrough = new PassThrough();

    s3Client
      .send(new GetObjectCommand({ Bucket: bucketName, Key: filename }))
      .then((response) => {
        (response.Body as Readable).pipe(passThrough);
      })
      .catch((err) => passThrough.destroy(err));

    return passThrough;
  },
};
