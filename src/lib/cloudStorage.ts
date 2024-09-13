import { drive } from "./drive";
import { Readable } from "stream";
import { getPrisma } from "./prisma";
import { drive_v3 } from "googleapis";

const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

if (!GOOGLE_DRIVE_FOLDER_ID) {
  throw new Error(
    "GOOGLE_DRIVE_FOLDER_ID is not defined in environment variables",
  );
}

export interface FileData {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size: string;
}

export const cloudStorage = {
  uploadFile: async (file: Buffer, filename: string) => {
    const response = await drive.files.create({
      requestBody: {
        name: filename,
        mimeType: "application/octet-stream",
        parents: [GOOGLE_DRIVE_FOLDER_ID],
      },
      media: {
        mimeType: "application/octet-stream",
        body: Readable.from(file),
      },
    });
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
    return response.data.id!;
  },

  getWriteStream: (filename: string) => {
    throw new Error("Not implemented for Google Drive");
  },

  makeFilePublic: async (fileId: string) => {
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
  },

  downloadFile: async (fileId: string) => {
    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "arraybuffer" },
    );
    return Buffer.from(response.data as ArrayBuffer);
  },

  deleteFile: async (fileId: string) => {
    const prisma = await getPrisma();
    try {
      await drive.files.delete({ fileId });
      const existingStats = await prisma.fileStats.findUnique({
        where: { fileId },
      });
      if (existingStats) {
        await prisma.fileStats.delete({ where: { fileId } });
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  },

  renameFile: async (fileId: string, newFilename: string) => {
    const prisma = await getPrisma();
    try {
      await drive.files.update({
        fileId,
        requestBody: {
          name: newFilename,
        },
      });
      await prisma.fileStats.update({
        where: { fileId },
        data: { filename: newFilename },
      });
    } catch (error) {
      console.error("Error renaming file:", error);
      throw error;
    }
  },

  fileExists: async (fileId: string): Promise<boolean> => {
    try {
      await drive.files.get({ fileId });
      return true;
    } catch (error) {
      return false;
    }
  },

  setFileMetadata: async (
    fileId: string,
    metadata: { [key: string]: string },
  ) => {
    await drive.files.update({
      fileId,
      requestBody: {
        appProperties: metadata,
      },
    });
  },

  listFiles: async (): Promise<FileData[]> => {
    try {
      const response = await drive.files.list({
        q: `'${GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed = false`,
        fields: "nextPageToken, files(id, name, mimeType, modifiedTime, size)",
        pageSize: 1000,
      });

      let allFiles = response.data.files || [];
      let nextPageToken = response.data.nextPageToken;

      while (nextPageToken) {
        const nextResponse = await drive.files.list({
          q: `'${GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed = false`,
          fields:
            "nextPageToken, files(id, name, mimeType, modifiedTime, size)",
          pageSize: 1000,
          pageToken: nextPageToken,
        });

        allFiles = allFiles.concat(nextResponse.data.files || []);
        nextPageToken = nextResponse.data.nextPageToken;
      }

      if (allFiles.length === 0) {
        console.log("No files found in the specified folder.");
        console.log("Folder ID:", GOOGLE_DRIVE_FOLDER_ID);
      }

      return allFiles as FileData[];
    } catch (error) {
      console.error("Error listing files:", error);
      throw error;
    }
  },

  getFileMetadata: async (fileId: string): Promise<FileData> => {
    const response = await drive.files.get({
      fileId,
      fields: "id, name, mimeType, modifiedTime, size",
    });
    return response.data as FileData;
  },

  createReadStream: async (fileId: string): Promise<Readable> => {
    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" },
    );
    return response.data as Readable;
  },

  getFileStats: async (fileId: string) => {
    const prisma = await getPrisma();
    const stats = await prisma.fileStats.findUnique({
      where: { fileId },
      select: { views: true, downloads: true, uploadedKey: true },
    });
    return stats || { views: 0, downloads: 0, uploadedKey: null };
  },

  incrementFileViews: async (fileId: string, filename: string) => {
    const prisma = await getPrisma();
    await prisma.fileStats.upsert({
      where: { fileId },
      update: { views: { increment: 1 } },
      create: { fileId, views: 1, downloads: 0, filename },
    });
  },

  incrementFileDownloads: async (fileId: string, filename: string) => {
    const prisma = await getPrisma();
    await prisma.fileStats.upsert({
      where: { fileId },
      update: { downloads: { increment: 1 } },
      create: { fileId, downloads: 1, views: 0, filename },
    });
  },

  listUserFiles: async (apiKeyDescription: string) => {
    const allFiles = await cloudStorage.listFiles();
    const userFiles = await Promise.all(
      allFiles.map(async (file: drive_v3.Schema$File) => {
        const stats = await cloudStorage.getFileStats(file.id!);
        if (stats.uploadedKey === apiKeyDescription) {
          return {
            name: file.name!,
            size: parseInt(String(file.size) || "0", 10),
            updatedAt: file.modifiedTime!,
            downloads: stats.downloads,
            views: stats.views,
          };
        }
        return null;
      }),
    );
    return userFiles.filter(
      (file): file is NonNullable<typeof file> => file !== null,
    );
  },

  listUserStats: async (apiKeyDescription: string) => {
    const stats = await cloudStorage.getFileStats(apiKeyDescription);
    return stats;
  },

  getFileName: async (fileId: string) => {
    try {
      const response = await drive.files.get({
        fileId,
        fields: "name",
      });
      return response.data.name || null;
    } catch (error) {
      console.error("Error getting file name:", error);
      return null;
    }
  },
};
