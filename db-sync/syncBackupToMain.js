import { syncDatabases } from "./syncDatabases.js";

async function syncBackupToMain() {
  console.log("Starting database sync from secondary to primary...");
  await syncDatabases(true);
  console.log("Sync from secondary to primary completed.");
}

syncBackupToMain()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
