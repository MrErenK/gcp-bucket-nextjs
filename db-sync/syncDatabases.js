import { PrismaClient as PrismaClient1 } from "@prisma/client";
import { PrismaClient as PrismaClient2 } from "./prisma/client/index.js";
import { getRecords } from "./getRecords.js";

export async function syncDatabases(fromBackup = false) {
  const sourcePrisma = fromBackup ? new PrismaClient2() : new PrismaClient1();
  const targetPrisma = fromBackup ? new PrismaClient1() : new PrismaClient2();

  try {
    // Get the records from the source database
    const { apiKeys, fileStats } = await getRecords(fromBackup);

    if (!apiKeys || !fileStats) {
      throw new Error("Failed to get records from source database");
    }

    // Sync the records to the target database
    await targetPrisma.apiKey.createMany({
      data: apiKeys,
      skipDuplicates: true,
    });
    await targetPrisma.fileStats.createMany({
      data: fileStats,
      skipDuplicates: true,
    });

    console.log(
      `Database sync completed successfully (${fromBackup ? "Backup to Primary" : "Primary to Backup"})`,
    );
  } catch (error) {
    console.error("Error syncing databases:", error);
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
  }
}
