import { syncDatabases } from "./syncDatabases.js";

async function syncMainToBackup() {
  console.log("Starting database sync from primary to secondary...");
  await syncDatabases(false);
  console.log("Sync from primary to secondary completed.");
}

syncMainToBackup()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
