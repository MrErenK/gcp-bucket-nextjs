import cron from "node-cron";
import { syncDatabases } from "./syncDatabases.js";

// Log that the script has started
console.log("Scheduled database sync script started");

// Schedule the sync to run every 6 hours
cron.schedule("0 */6 * * *", () => {
  console.log("Running scheduled database sync");
  syncDatabases();
});

// Run the sync immediately when the script starts
syncDatabases();

// Keep the script running
process.stdin.resume();
