import cron from "node-cron";
import { syncDatabases } from "./syncDatabases.js";

// Log that the script has started
console.log("Scheduled database sync script started");

async function runSync() {
  console.log("Running database sync...");
  try {
    await syncDatabases();
  } catch (error) {
    console.error("Error during database sync:", error);
  }
}

// Schedule the sync to run every 2 hours
cron.schedule("0 */2 * * *", runSync);

// Run the sync immediately when the script starts
runSync();

// Handle process termination
process.on("SIGINT", () => {
  console.log("Scheduled sync script terminated");
  process.exit(0);
});

// Keep the script running
process.stdin.resume();

console.log("Sync scheduler is running. Press Ctrl+C to exit.");
