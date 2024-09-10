import { s3Client, bucket } from "./storage";
import { Readable } from "stream";
import { getPrisma } from "./prisma";
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand, CopyObjectCommand, ListObjectsCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

export const cloudStorage = {
  uploadFile: async (file: Buffer, filename: string) => {
    await s3Client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: filename,
      Body: file,
      ACL: 'public-read'
    }));
    return filename;
  },
  getWriteStream: (filename: string) => {
    return new Upload({
      client: s3Client,
      params: {
        Bucket: bucket,
        Key: filename,
        Body: new Readable()
      }
    }).done();
  },
  downloadFile: async (filename: string) => {
    const { Body } = await s3Client.send(new GetObjectCommand({
      Bucket: bucket,
      Key: filename
    }));
    return Buffer.from(await Body!.transformToByteArray());
  },
  deleteFile: async (filename: string) => {
    const prisma = await getPrisma();
    await s3Client.send(new DeleteObjectCommand({
      Bucket: bucket,
      Key: filename
    }));
    await prisma.fileStats.delete({ where: { filename } }).catch(() => {});
  },
  fileExists: async (filename: string): Promise<boolean> => {
    try {
      await s3Client.send(new HeadObjectCommand({
        Bucket: bucket,
        Key: filename
      }));
      return true;
    } catch (error) {
      if ((error as any).name === 'NotFound') {
        return false;
      }
      throw error;
    }
  },
  setFileMetadata: async (filename: string, metadata: { [key: string]: string }) => {
    await s3Client.send(new CopyObjectCommand({
      Bucket: bucket,
      CopySource: `${bucket}/${filename}`,
      Key: filename,
      Metadata: metadata,
      MetadataDirective: 'REPLACE'
    }));
  },
  getFileMetadata: async (filename: string) => {
    const { Metadata } = await s3Client.send(new HeadObjectCommand({
      Bucket: bucket,
      Key: filename
    }));
    return Metadata;
  },
  listFiles: async (prefix?: string) => {
    const { Contents } = await s3Client.send(new ListObjectsCommand({
      Bucket: bucket,
      Prefix: prefix
    }));
    return Contents || [];
  },
  createReadStream: async (filename: string): Promise<Readable> => {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: filename
    });
    const { Body } = await s3Client.send(command);
    return Body as Readable;
  },
  getFileStats: async (filename: string) => {
    const prisma = await getPrisma();
    const stats = await prisma.fileStats.findUnique({
      where: { filename },
      select: { views: true, downloads: true, uploadedKey: true },
    });
    return stats || { views: 0, downloads: 0, uploadedKey: null };
  },
  incrementFileViews: async (filename: string) => {
    const prisma = await getPrisma();
    await prisma.fileStats.upsert({
      where: { filename },
      update: { views: { increment: 1 } },
      create: { filename, views: 1, downloads: 0 },
    });
  },
  incrementFileDownloads: async (filename: string) => {
    const prisma = await getPrisma();
    await prisma.fileStats.upsert({
      where: { filename },
      update: { downloads: { increment: 1 } },
      create: { filename, downloads: 1, views: 0 },
    });
  },
};
