const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Handle Prisma connection errors
prisma.$connect()
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  });

// Gracefully close the Prisma connection on application shutdown
process.on('SIGINT', () => {
  prisma.$disconnect()
    .then(() => {
      console.log('Database connection closed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error closing database connection:', error);
      process.exit(1);
    });
});

prisma.$disconnect

module.exports = { prisma };