import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getRecords() {
  try {
    // Get all the records from the Prisma database
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
