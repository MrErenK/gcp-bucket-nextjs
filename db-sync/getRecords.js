import { PrismaClient as PrismaClient1 } from "@prisma/client";
import { PrismaClient as PrismaClient2 } from "./prisma/client/index.js";

export async function getRecords(isBackup = false) {
  const prisma = isBackup ? new PrismaClient2() : new PrismaClient1();

  try {
    // Get all the records from the specified Prisma database
    const apiKeys = await prisma.apiKey.findMany();
    const fileStats = await prisma.fileStats.findMany();

    // Return the records to the caller
    return { apiKeys, fileStats };
  } catch (error) {
    console.error("Error getting records:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}
