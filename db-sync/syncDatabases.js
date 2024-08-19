import { PrismaClient } from "./prisma/client/index.js";
import { getRecords } from "./getRecords.js";

const prisma = new PrismaClient();

export async function syncDatabases() {
  try {
    // Get the records from the first Prisma database
    const { apiKeys, fileStats } = await getRecords();

    // Sync the records to the second database
    await prisma.apiKey.createMany({
      data: apiKeys,
      skipDuplicates: true,
    });
    await prisma.fileStats.createMany({
      data: fileStats,
      skipDuplicates: true,
    });

    console.log("Database sync completed successfully");
  } catch (error) {
    console.error("Error syncing databases:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// If this script is run directly (not imported), run the sync and exit
if (import.meta.url === `file://${process.argv[1]}`) {
  syncDatabases().then(() => process.exit(0));
}
