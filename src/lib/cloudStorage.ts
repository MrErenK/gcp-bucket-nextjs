import { bucket } from "./storage";
import { Readable } from "stream";
import { getPrisma } from "./prisma";

export const cloudStorage = {
  uploadFile: async (file: Buffer, filename: string) => {
    const blob = bucket.file(filename);
    await blob.save(file);
    await blob.makePublic(); // Make the file public
    return filename;
  },
  getWriteStream: (filename: string) => {
    const blob = bucket.file(filename);
    return blob.createWriteStream();
  },
  makeFilePublic: async (filename: string) => {
    const blob = bucket.file(filename);
    await blob.makePublic();
  },
  downloadFile: async (filename: string) => {
    const [fileContents] = await bucket.file(filename).download();
    return fileContents;
  },
  deleteFile: async (filename: string) => {
    const prisma = await getPrisma();
    await bucket
      .file(filename)
      .delete()
      .catch(() => {});
    await prisma.fileStats.delete({ where: { filename } }).catch(() => {});
  },
  renameFile: async (oldFilename: string, newFilename: string) => {
    const prisma = await getPrisma();
    await bucket.file(oldFilename).rename(newFilename);
    await prisma.fileStats.update({
      where: { filename: oldFilename },
      data: { filename: newFilename },
    });
  },
  fileExists: async (filename: string): Promise<boolean> => {
    const [exists] = await bucket.file(filename).exists();
    return exists;
  },
  setFileMetadata: async (
    filename: string,
    metadata: { [key: string]: string },
  ) => {
    await bucket.file(filename).setMetadata(metadata);
  },
  getFileMetadata: async (filename: string) => {
    const [metadata] = await bucket.file(filename).getMetadata();
    return metadata;
  },
  listFiles: async (prefix?: string) => {
    const [files] = await bucket.getFiles({ prefix });
    return files;
  },
  createReadStream: (filename: string): Readable => {
    return bucket.file(filename).createReadStream();
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
