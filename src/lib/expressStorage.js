const { google } = require("googleapis");
const { readFileSync } = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: `.env.local`, override: true });

const keyFilePath = path.resolve(process.cwd(), "google-drive-key.json");
const keyFileContents = readFileSync(keyFilePath, "utf8");

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(keyFileContents),
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

module.exports = { drive };
