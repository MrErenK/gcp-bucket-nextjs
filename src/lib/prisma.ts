import { PrismaClient as PrismaClient1 } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient1;
};

const API_SECRET = process.env.API_SECRET;
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

let PrismaClient2: typeof PrismaClient1 | null = null;

// Try to import PrismaClient2, but don't throw an error if it fails
try {
  PrismaClient2 = require("../../db-sync/prisma/client").PrismaClient;
} catch (error) {
  console.warn(
    "Secondary database client not available. Continuing with primary only.",
  );
}

async function createPrismaClient() {
  try {
    // Attempt to connect with the first client
    const client1 = new PrismaClient1({
      log: [],
    });
    await client1.$connect();
    console.log("Connected to primary database");
    return client1;
  } catch (error) {
    console.error("Failed to connect to primary database:", error);
    if (PrismaClient2) {
      try {
        // If the first client fails and PrismaClient2 is available, attempt to connect with the second client
        const client2 = new PrismaClient2({
          log: [],
        });
        await client2.$connect();
        console.log("Connected to secondary database");
        // Log the backup mode via API call
        await fetch(`${API_BASE_URL}/api/backup-mode`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": API_SECRET || "",
          },
          body: JSON.stringify({ isBackupMode: true }),
        });
        return client2;
      } catch (error) {
        console.error("Failed to connect to secondary database:", error);
      }
    }
    throw new Error("Unable to connect to any database");
  }
}

export async function getPrisma() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = await createPrismaClient();
  }
  return globalForPrisma.prisma;
}
