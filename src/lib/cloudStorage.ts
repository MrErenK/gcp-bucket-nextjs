import { bucket } from "./storage";
import { Readable } from "stream";

export const cloudStorage = {
  uploadFile: async (file: Buffer, filename: string) => {
    const blob = bucket.file(filename);
    await blob.save(file);
    return filename;
  },
  getWriteStream: (filename: string) => {
    const blob = bucket.file(filename);
    return blob.createWriteStream();
  },
  downloadFile: async (filename: string) => {
    const [fileContents] = await bucket.file(filename).download();
    return fileContents;
  },
  deleteFile: async (filename: string) => {
    await bucket.file(filename).delete();
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
};
