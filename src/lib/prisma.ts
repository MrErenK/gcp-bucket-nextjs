import { PrismaClient as PrismaClient1 } from "@prisma/client";
import { PrismaClient as PrismaClient2 } from "../../db-sync/prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient1 | PrismaClient2;
};

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
    try {
      // If the first client fails, attempt to connect with the second client
      const client2 = new PrismaClient2({
        log: [],
      });
      await client2.$connect();
      console.log("Connected to secondary database");
      return client2;
    } catch (error) {
      console.error("Failed to connect to secondary database:", error);
      throw new Error("Unable to connect to any database");
    }
  }
}

export async function getPrisma() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = await createPrismaClient();
  }
  return globalForPrisma.prisma;
}
